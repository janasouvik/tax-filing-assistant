import { useAuth } from '@clerk/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface ExtractedField {
  id: string;
  fieldName: string;
  rawValue: string | null;
  normalizedValue: string | null;
  dataType: string | null;
  confidence: number | null;
  isVerified: boolean;
  sourceInfo?: {
    label?: string;
    category?: string;
    pageNumber?: number;
    sourceTextSnippet?: string | null;
    warning?: string | null;
    userCorrected?: boolean;
    originalValue?: string | null;
  } | null;
}

interface DocumentItem {
  id: string;
  workspaceId: string;
  taxReturnId?: string | null;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'VERIFIED';
  isVerified: boolean;
  processedAt?: string | null;
  createdAt: string;
  metadata?: {
    detectedCategory?: string;
    classificationConfidence?: number;
    classificationClues?: string[];
    pageCount?: number;
    step?: string;
    warnings?: Array<{ code: string; field?: string; message: string; severity: 'INFO' | 'WARNING' | 'ERROR' }>;
    summary?: {
      totalFields: number;
      highConfidenceFields: number;
      lowConfidenceFields: number;
      needsUserReview: boolean;
    };
    structuredData?: Record<string, any>;
    error?: string;
  } | null;
  _count?: {
    pages: number;
    extractedFields: number;
  };
}

export default function TaxPreparationDocumentOCR() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDocId = searchParams.get('docId');

  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('FORM_16');
  const [dragActive, setDragActive] = useState(false);

  // Active Review State
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);
  const [activeFields, setActiveFields] = useState<ExtractedField[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // File Preview Auth Token Blob URL
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const pollingRef = useRef<any>(null);

  // Load User Workspace
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const profileRes = await fetch(`${BASE_URL}/api/v1/individual/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        const wsId = profileData.data?.workspaceId;
        if (wsId) {
          setWorkspaceId(wsId);
        } else {
          setError('Please complete taxpayer profile onboarding first.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize workspace.');
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  // Load Documents for Workspace
  const loadDocuments = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/workspaces/${workspaceId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setDocuments(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    }
  }, [workspaceId, getToken]);

  useEffect(() => {
    if (workspaceId) {
      loadDocuments();
    }
  }, [workspaceId, loadDocuments]);

  // Polling for processing documents
  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === 'PENDING' || d.status === 'PROCESSING');
    if (hasProcessing) {
      pollingRef.current = setInterval(() => {
        loadDocuments();
        if (activeDoc) {
          loadDocumentDetails(activeDoc.id);
        }
      }, 2500);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [documents, loadDocuments, activeDoc]);

  // Load single document details for review
  const loadDocumentDetails = async (docId: string) => {
    setReviewLoading(true);
    setSaveSuccessMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const doc: DocumentItem = data.data;
        setActiveDoc(doc);
        const fields: ExtractedField[] = (data.data as any).extractedFields || [];
        setActiveFields(fields);

        // Prepopulate edit inputs
        const initialEdits: Record<string, string> = {};
        fields.forEach(f => {
          if (f.normalizedValue != null) initialEdits[f.fieldName] = f.normalizedValue;
        });
        setEditedValues(initialEdits);

        // Load preview blob safely
        fetchPreviewBlob(docId);
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchPreviewBlob = async (docId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/documents/${docId}/file`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const objUrl = URL.createObjectURL(blob);
        setPreviewUrl(objUrl);
      }
    } catch (err) {
      console.error('Failed to fetch preview blob:', err);
    }
  };

  // Preselect document from URL param if available
  useEffect(() => {
    if (preselectedDocId && documents.length > 0) {
      const found = documents.find(d => d.id === preselectedDocId);
      if (found) {
        loadDocumentDetails(found.id);
      }
    }
  }, [preselectedDocId, documents]);

  // File Upload Handler
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !workspaceId) return;
    setUploading(true);
    setError('');

    try {
      const token = await getToken();
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', uploadCategory);

        const res = await fetch(`${BASE_URL}/api/v1/workspaces/${workspaceId}/documents`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        if (data.data?.id) {
          loadDocumentDetails(data.data.id);
        }
      }
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Save Field Corrections
  const handleSaveCorrections = async () => {
    if (!activeDoc) return;
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/documents/${activeDoc.id}/extracted-data`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: editedValues }),
      });
      if (res.ok) {
        setSaveSuccessMsg('Corrections saved successfully');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        await loadDocumentDetails(activeDoc.id);
      }
    } catch (err) {
      console.error('Failed to save corrections:', err);
    }
  };

  // Verify and Apply to Return
  const handleVerifyDocument = async () => {
    if (!activeDoc) return;
    setVerifying(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/documents/${activeDoc.id}/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ overrides: editedValues }),
      });
      if (res.ok) {
        setSaveSuccessMsg('Document successfully verified and synchronized with your Tax Return!');
        await loadDocuments();
        await loadDocumentDetails(activeDoc.id);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Reprocess Document
  const handleReprocess = async (forceOcr: boolean) => {
    if (!activeDoc) return;
    try {
      const token = await getToken();
      await fetch(`${BASE_URL}/api/v1/documents/${activeDoc.id}/reprocess`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceOcr }),
      });
      await loadDocumentDetails(activeDoc.id);
      await loadDocuments();
    } catch (err) {
      console.error('Failed to trigger reprocessing:', err);
    }
  };

  // Delete Document
  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document and any imported lines?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (activeDoc?.id === docId) {
          setActiveDoc(null);
          setActiveFields([]);
          setPreviewUrl('');
        }
        await loadDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Group fields into logical sections
  const groupedFields = activeFields.reduce((acc, field) => {
    const cat = field.sourceInfo?.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(field);
    return acc;
  }, {} as Record<string, ExtractedField[]>);

  // Filtered documents list
  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Queued</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin"></span>Processing OCR</span>;
      case 'PROCESSED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Awaiting Review</span>;
      case 'VERIFIED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="material-symbols-outlined text-[14px]">verified</span>Verified &amp; Applied</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Failed</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#2C2A29]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E6DF]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A7670] mb-1">
              <span>TaxPilot Intelligence OS</span>
              <span>/</span>
              <span className="text-[#8B4513]">Optical Document Extraction &amp; Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#1A1918]">Document Vault &amp; Fiscal OCR</h1>
            <p className="text-sm text-[#5C5854] mt-0.5">
              100% Local, Private &amp; Open-Source Optical Character Recognition (Tesseract.js &amp; Poppler)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/individual/documents')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-[#D8D5CC] bg-white hover:bg-[#F2EFE9] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              Filing Step 5 (Vault)
            </button>
            <button
              onClick={() => navigate('/individual/income')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-[#8B4513] text-white hover:bg-[#72380F] shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              View Income &amp; Deductions
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900 font-bold">&times;</button>
          </div>
        )}

        {/* Top Upload Drawer / Dropzone */}
        <div className="mt-6 bg-white border border-[#E2DFD7] rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1A1918] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B4513]">cloud_upload</span>
                Upload Tax Document for Local OCR
              </h2>
              <p className="text-xs text-[#7A7670]">All extraction runs entirely in your private local backend. No cloud APIs.</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[#5C5854]">Document Type:</label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="text-xs font-medium bg-[#F7F6F2] border border-[#D8D5CC] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#8B4513]"
              >
                <option value="FORM_16">Form 16 (Part A &amp; B)</option>
                <option value="SALARY_SLIP">Salary Slip</option>
                <option value="BANK_STATEMENT">Bank Statement</option>
                <option value="INVESTMENT_PROOF">Investment Proof (80C/80D)</option>
                <option value="OTHER">Other Financial Document</option>
              </select>
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              handleUploadFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive ? 'border-[#8B4513] bg-[#FAF5F0]' : 'border-[#D8D5CC] hover:border-[#8B4513] bg-[#FAFAF8]'
            }`}
          >
            <input
              type="file"
              id="doc-upload"
              className="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => handleUploadFiles(e.target.files)}
            />
            <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl text-[#8B4513] mb-2">
                {uploading ? 'hourglass_top' : 'upload_file'}
              </span>
              <p className="text-sm font-medium text-[#1A1918]">
                {uploading ? 'Ingesting and queuing OCR pipeline...' : 'Click to select or drag & drop tax documents here'}
              </p>
              <p className="text-xs text-[#7A7670] mt-1">
                Supports PDF (digital &amp; scanned), PNG, JPG, JPEG · Maximum 25MB
              </p>
            </label>
          </div>
        </div>

        {/* Main Work Area: Document Vault List OR Two-Panel Review Mode */}
        {activeDoc ? (
          /* ── TWO-PANEL INTERACTIVE REVIEW WORKSPACE ── */
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between bg-white border border-[#E2DFD7] rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveDoc(null); setActiveFields([]); }}
                  className="p-1.5 rounded-lg hover:bg-[#F2EFE9] text-[#5C5854] transition-colors"
                  title="Back to Document Vault"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1A1918]">{activeDoc.name}</span>
                    {getStatusBadge(activeDoc.status)}
                  </div>
                  <p className="text-xs text-[#7A7670]">
                    {activeDoc.category} · Detected: {activeDoc.metadata?.detectedCategory || activeDoc.category} ({Math.round((activeDoc.metadata?.classificationConfidence || 0.9) * 100)}% confidence)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReprocess(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#D8D5CC] hover:bg-[#F2EFE9] transition-colors"
                >
                  Re-parse Text
                </button>
                <button
                  onClick={() => handleReprocess(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#D8D5CC] hover:bg-[#F2EFE9] transition-colors"
                  title="Force full image rasterization and Tesseract OCR"
                >
                  Force Deep OCR
                </button>
                <button
                  onClick={() => handleDelete(activeDoc.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Document"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Split Screen 50/50 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
              {/* LEFT PANEL: Document Facsimile Viewer */}
              <div className="lg:col-span-6 bg-white border border-[#E2DFD7] rounded-xl flex flex-col overflow-hidden shadow-xs">
                <div className="p-3 bg-[#F7F6F2] border-b border-[#E2DFD7] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5C5854] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Original Document Facsimile
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                      className="px-2 py-1 rounded bg-white border border-[#D8D5CC] text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))}
                      className="px-2 py-1 rounded bg-white border border-[#D8D5CC] text-xs font-bold"
                    >
                      +
                    </button>
                    <a
                      href={previewUrl}
                      download={activeDoc.name}
                      className="p-1 rounded hover:bg-[#EAE7DF] text-[#5C5854]"
                      title="Download file"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                    </a>
                  </div>
                </div>

                <div className="flex-1 bg-[#4A4744] overflow-auto flex items-center justify-center p-4">
                  {previewUrl ? (
                    activeDoc.mimeType === 'application/pdf' ? (
                      <iframe
                        src={`${previewUrl}#toolbar=0`}
                        title="Document Facsimile"
                        className="w-full h-full min-h-[580px] rounded border-0 bg-white"
                        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        className="max-w-full rounded shadow-md transition-transform"
                        style={{ width: `${zoomLevel}%` }}
                      />
                    )
                  ) : (
                    <div className="text-white text-xs font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Loading secure document preview...
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Extracted Structured Information */}
              <div className="lg:col-span-6 bg-white border border-[#E2DFD7] rounded-xl flex flex-col overflow-hidden shadow-xs">
                <div className="p-3 bg-[#F7F6F2] border-b border-[#E2DFD7] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5C5854] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schema</span>
                    Extracted Financial Ledger &amp; Tax Fields
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {activeFields.length} Fields Extracted
                  </span>
                </div>

                {/* Validation Warnings Callout */}
                {activeDoc.metadata?.warnings && activeDoc.metadata.warnings.length > 0 && (
                  <div className="p-3 bg-amber-50 border-b border-amber-200">
                    <p className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Compliance Diagnostics ({activeDoc.metadata.warnings.length} items flagged)
                    </p>
                    <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                      {activeDoc.metadata.warnings.map((w, i) => (
                        <li key={i}>{w.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex-1 p-5 overflow-y-auto space-y-6">
                  {reviewLoading ? (
                    <div className="py-20 text-center text-[#7A7670] text-sm flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                      <span>Loading extracted fiscal fields...</span>
                    </div>
                  ) : activeFields.length === 0 ? (
                    <div className="py-20 text-center text-[#7A7670] text-sm">
                      <span className="material-symbols-outlined text-4xl mb-2 text-[#C4C0B6]">description</span>
                      <p className="font-medium">Document is queued or processing.</p>
                      <p className="text-xs mt-1">Status: {activeDoc.status}. Please check back in a few seconds.</p>
                    </div>
                  ) : (
                    Object.entries(groupedFields).map(([cat, fields]) => (
                      <div key={cat} className="space-y-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-[#EFECE6]">
                          <span className="text-xs font-bold text-[#8B4513] uppercase tracking-wider">{cat}</span>
                          <span className="text-[11px] text-[#7A7670]">{fields.length} records</span>
                        </div>

                        <div className="space-y-2.5">
                          {fields.map(field => {
                            const currentVal = editedValues[field.fieldName] ?? (field.normalizedValue || '');
                            const isCorrected = currentVal !== (field.rawValue || '');
                            const conf = field.confidence || 0.9;
                            const confBadge = conf >= 0.85
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : conf >= 0.65
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200';

                            return (
                              <div
                                key={field.id || field.fieldName}
                                className="p-3 rounded-lg border border-[#E8E6DF] bg-[#FAF9F5] hover:border-[#D8D5CC] transition-colors"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <label className="text-xs font-semibold text-[#1A1918]">
                                    {field.sourceInfo?.label || field.fieldName}
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    {isCorrected && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium">
                                        User Corrected
                                      </span>
                                    )}
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-numeric ${confBadge}`}>
                                      {Math.round(conf * 100)}% conf
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={currentVal}
                                    onChange={e => {
                                      setEditedValues({
                                        ...editedValues,
                                        [field.fieldName]: e.target.value,
                                      });
                                    }}
                                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#D8D5CC] bg-white text-[#1A1918] focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] outline-none"
                                  />
                                </div>

                                {field.sourceInfo?.sourceTextSnippet && (
                                  <p className="text-[11px] text-[#7A7670] mt-1 font-mono truncate">
                                    Source: "{field.sourceInfo.sourceTextSnippet}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 bg-[#F7F6F2] border-t border-[#E2DFD7] flex items-center justify-between">
                  <button
                    onClick={handleSaveCorrections}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-[#D8D5CC] bg-white hover:bg-[#F2EFE9] text-[#1A1918] transition-colors"
                  >
                    Save Corrections
                  </button>

                  <button
                    onClick={handleVerifyDocument}
                    disabled={verifying || activeDoc.status === 'VERIFIED'}
                    className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-all ${
                      activeDoc.status === 'VERIFIED'
                        ? 'bg-emerald-600 opacity-90 cursor-default'
                        : 'bg-[#8B4513] hover:bg-[#72380F]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {activeDoc.status === 'VERIFIED' ? 'check' : 'verified'}
                    </span>
                    {activeDoc.status === 'VERIFIED' ? 'Verified into Tax Return' : 'Approve & Apply to Tax Return'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── DOCUMENT VAULT TABLE & DASHBOARD ── */
          <div className="mt-6 bg-white border border-[#E2DFD7] rounded-xl overflow-hidden shadow-xs">
            {/* Filter Bar */}
            <div className="p-4 bg-[#FBFBF9] border-b border-[#E2DFD7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'FORM_16', 'SALARY_SLIP', 'BANK_STATEMENT', 'INVESTMENT_PROOF'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#8B4513] text-white shadow-xs'
                        : 'bg-white border border-[#D8D5CC] text-[#5C5854] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search uploaded files..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D8D5CC] bg-white outline-none focus:border-[#8B4513]"
                />
                <span className="material-symbols-outlined text-[16px] text-[#7A7670] absolute left-2.5 top-2">
                  search
                </span>
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F2] text-[#7A7670] uppercase font-semibold border-b border-[#E2DFD7]">
                  <tr>
                    <th className="px-5 py-3">Document</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Extraction Status</th>
                    <th className="px-4 py-3">Audit Details</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#7A7670]">
                        <span className="material-symbols-outlined animate-spin text-2xl mb-1">progress_activity</span>
                        <p>Loading documents vault...</p>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[#7A7670]">
                        <span className="material-symbols-outlined text-4xl mb-2 text-[#C4C0B6]">folder_open</span>
                        <p className="font-medium text-sm text-[#1A1918]">No documents in vault</p>
                        <p className="text-xs mt-0.5">Upload a Form 16, Salary Slip, or Bank Statement above to run local OCR.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map(doc => {
                      const warningsCount = doc.metadata?.warnings?.length || 0;
                      const fieldsCount = doc._count?.extractedFields || doc.metadata?.summary?.totalFields || 0;

                      return (
                        <tr key={doc.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-2xl text-[#8B4513]">
                                {doc.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                              </span>
                              <div>
                                <p className="font-semibold text-sm text-[#1A1918]">{doc.name}</p>
                                <p className="text-[11px] text-[#7A7670]">
                                  {(doc.sizeBytes / (1024 * 1024)).toFixed(2)} MB · {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-semibold text-[#1A1918] block">{doc.category.replace(/_/g, ' ')}</span>
                            {doc.metadata?.detectedCategory && (
                              <span className="text-[10px] text-[#7A7670]">
                                Detected: {doc.metadata.detectedCategory} ({Math.round((doc.metadata.classificationConfidence || 0.9) * 100)}%)
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {getStatusBadge(doc.status)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="space-y-0.5">
                              <p className="text-xs text-[#1A1918] font-medium">
                                {fieldsCount} fields extracted
                              </p>
                              {warningsCount > 0 ? (
                                <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">warning</span>
                                  {warningsCount} warnings flagged
                                </p>
                              ) : doc.status === 'VERIFIED' ? (
                                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  Applied to Return
                                </p>
                              ) : (
                                <p className="text-[11px] text-[#7A7670]">Ready for assessee verification</p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => loadDocumentDetails(doc.id)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#8B4513] text-white hover:bg-[#72380F] transition-all"
                              >
                                Review &amp; Verify
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
