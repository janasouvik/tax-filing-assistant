import { useAuth } from '@clerk/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndividualLayout } from './PersonalProfile';
import { StatusBadge } from '../../components/individual/SharedComponents';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const DOCUMENT_TYPES = [
  { id: 'FORM_16', label: 'Form 16', icon: 'description', desc: 'Salary & TDS certificate from employer', required: true },
  { id: 'SALARY_SLIP', label: 'Salary Slips', icon: 'receipt', desc: 'Monthly pay slips for FY 2025-26', required: false },
  { id: 'BANK_STATEMENT', label: 'Bank Statement', icon: 'account_balance', desc: 'Annual statement for interest income', required: false },
  { id: 'FORM_26AS', label: 'Form 26AS / AIS', icon: 'article', desc: 'Annual Information Statement from IT portal', required: true },
  { id: 'INVESTMENT_PROOF', label: 'Investment Proofs', icon: 'savings', desc: 'For 80C deductions: LIC, PPF, ELSS, etc.', required: false },
  { id: 'INSURANCE_PREMIUM', label: 'Health Insurance', icon: 'shield_with_heart', desc: 'For 80D deduction', required: false },
  { id: 'CAPITAL_GAINS', label: 'Capital Gains Statement', icon: 'trending_up', desc: 'Mutual fund/stock LTCG/STCG', required: false },
  { id: 'OTHER', label: 'Other Documents', icon: 'folder_open', desc: 'Rent receipts, donation receipts, home loan certificate, etc.', required: false },
];

interface UploadedFile {
  id: string;
  name: string;
  category: string;
  status: 'uploading' | 'processing' | 'processed' | 'verified' | 'failed';
  size: number;
  error?: string;
  fieldsCount?: number;
}

export default function DocumentCollectionPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('FORM_16');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Load Workspace and existing uploaded documents
  const loadExistingDocuments = useCallback(async (wsId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/v1/workspaces/${wsId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const mapped: UploadedFile[] = data.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          status: d.status === 'VERIFIED' ? 'verified' : d.status === 'PROCESSED' ? 'processed' : d.status === 'FAILED' ? 'failed' : 'processing',
          size: d.sizeBytes,
          fieldsCount: d._count?.extractedFields || d.metadata?.summary?.totalFields || 0,
        }));
        setUploadedFiles(mapped);
      }
    } catch (err) {
      console.error('Failed to load existing documents:', err);
    }
  }, [getToken]);

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
          loadExistingDocuments(wsId);
        }
      } catch {
        // Continue silently
      }
    })();
  }, [getToken, loadExistingDocuments]);

  // Polling for processing status
  useEffect(() => {
    const hasPending = uploadedFiles.some(f => f.status === 'processing' || f.status === 'uploading');
    if (!hasPending || !workspaceId) return;

    const interval = setInterval(() => {
      loadExistingDocuments(workspaceId);
    }, 2500);

    return () => clearInterval(interval);
  }, [uploadedFiles, workspaceId, loadExistingDocuments]);

  const uploadFile = async (file: File, category: string) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const newFile: UploadedFile = {
      id: tempId,
      name: file.name,
      category,
      status: 'uploading',
      size: file.size,
    };
    setUploadedFiles(prev => [newFile, ...prev]);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      let currentWsId = workspaceId;
      if (!currentWsId) {
        const profileRes = await fetch(`${BASE_URL}/api/v1/individual/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        currentWsId = profileData.data?.workspaceId;
        if (!currentWsId) throw new Error('Workspace not found. Please complete profile setup first.');
        setWorkspaceId(currentWsId);
      }

      const res = await fetch(`${BASE_URL}/api/v1/workspaces/${currentWsId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Upload failed');
      }

      const resData = await res.json();
      const realDocId = resData.data?.id;

      setUploadedFiles(prev => prev.map(f => f.id === tempId
        ? { ...f, id: realDocId || f.id, status: 'processing' }
        : f
      ));

      // Refresh documents
      setTimeout(() => {
        loadExistingDocuments(currentWsId);
      }, 1500);
    } catch (err: any) {
      setUploadedFiles(prev => prev.map(f => f.id === tempId
        ? { ...f, status: 'failed', error: err.message || 'Upload failed' }
        : f
      ));
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Only PDF and image files are accepted.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert(`${file.name}: File exceeds 25MB limit.`);
        return;
      }
      uploadFile(file, selectedCategory);
    });
  }, [selectedCategory, workspaceId]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const statusBadge = (file: UploadedFile) => {
    if (file.status === 'uploading' || file.status === 'processing') {
      return <StatusBadge variant="processing" label={file.status === 'uploading' ? 'Uploading...' : 'Local OCR Scanning...'} size="sm" />;
    }
    if (file.status === 'verified') {
      return <StatusBadge variant="verified" label="Verified into Return" size="sm" />;
    }
    if (file.status === 'processed') {
      return <StatusBadge variant="pending" label="Ready for Review" size="sm" />;
    }
    return <StatusBadge variant="failed" label="Failed" size="sm" />;
  };

  return (
    <IndividualLayout currentStep={5}>
      <div className="space-y-6">
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-8 shadow-xs">
          {/* Header */}
          <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[20px] text-app-accent">folder_open</span>
                <p className="text-[12px] font-semibold text-app-text-muted dark:text-gray-400 uppercase tracking-wider">Step 5 of 12</p>
              </div>
              <h1 className="font-serif text-[32px] text-app-text-primary dark:text-app-surface font-normal">Upload Documents</h1>
              <p className="text-[15px] text-app-text-secondary dark:text-gray-300 mt-1">
                Upload Form 16, Salary Slips, or Bank Statements. TaxPilot extracts fiscal records locally via Tesseract.js.
              </p>
            </div>

            <button
              onClick={() => navigate('/taxpreparationdocumentocr')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-app-border dark:border-app-dark-border bg-white dark:bg-app-dark-card hover:bg-app-bg text-app-text-primary dark:text-app-surface shadow-xs transition-colors self-start"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Two-Panel OCR Review Studio
            </button>
          </div>

          {/* Category selector */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-app-text-primary dark:text-app-surface mb-2">Document Type</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-[14px] bg-white dark:bg-app-dark-card text-app-text-primary dark:text-app-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {DOCUMENT_TYPES.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.label}{dt.required ? ' (Required)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragging ? 'border-primary bg-[#FDF9F7] dark:bg-app-dark scale-[1.01]' : 'border-app-border dark:border-app-dark-border hover:border-primary hover:bg-[#FDF9F7] dark:bg-app-dark'
            }`}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => handleFiles(e.target.files)}
              aria-label="Upload documents"
            />
            <span className="material-symbols-outlined text-[48px] text-app-text-muted dark:text-gray-400 block mb-3">
              {dragging ? 'file_download' : 'cloud_upload'}
            </span>
            <p className="text-[16px] font-medium text-app-text-primary dark:text-app-surface mb-1.5">
              {dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-[13px] text-app-text-muted dark:text-gray-400">
              Supports PDF (digital &amp; scanned), PNG, JPEG · Maximum 25MB per file
            </p>
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-app-text-primary dark:text-app-surface">Uploaded Documents Vault</h3>
                <span className="text-xs text-app-text-muted dark:text-gray-400">{uploadedFiles.length} documents</span>
              </div>
              <div className="space-y-2.5">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-lg border border-app-border dark:border-app-dark-border bg-app-bg dark:bg-app-dark">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-[24px] text-[#8B4513]">
                        {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-app-text-primary dark:text-app-surface truncate">{file.name}</p>
                        <p className="text-[12px] text-app-text-muted dark:text-gray-400">
                          {file.category.replace(/_/g, ' ')} · {formatSize(file.size)}
                          {file.fieldsCount ? ` · ${file.fieldsCount} fields extracted` : ''}
                        </p>
                        {file.error && <p className="text-[12px] text-app-error mt-0.5">{file.error}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {statusBadge(file)}
                      {!file.id.startsWith('temp-') && (
                        <button
                          type="button"
                          onClick={() => navigate(`/taxpreparationdocumentocr?docId=${file.id}`)}
                          className="px-3 py-1 text-xs font-semibold rounded-md bg-[#8B4513] text-white hover:bg-[#72380F] transition-colors"
                        >
                          Review &amp; Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-app-border dark:border-app-dark-border-light">
            <button
              onClick={() => navigate('/individual/eligibility')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border dark:border-app-dark-border text-app-text-secondary dark:text-gray-300 hover:bg-app-bg dark:bg-app-dark text-[14px] font-medium transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={() => navigate('/individual/income')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm"
              type="button"
            >
              Continue to Income &amp; Deductions
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Suggested documents grid */}
        <div className="bg-app-surface dark:bg-app-dark-card border border-app-border dark:border-app-dark-border rounded-xl p-6 shadow-xs">
          <h2 className="text-[17px] font-semibold text-app-text-primary dark:text-app-surface mb-4">Suggested Documents for AY 2026–27</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOCUMENT_TYPES.map(dt => (
              <div key={dt.id} className="flex items-start gap-3 p-3.5 rounded-lg border border-app-border dark:border-app-dark-border hover:border-primary hover:bg-[#FDF9F7] dark:bg-app-dark transition-all cursor-pointer"
                onClick={() => setSelectedCategory(dt.id)}>
                <span className="material-symbols-outlined text-[20px] text-app-accent mt-0.5">{dt.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-app-text-primary dark:text-app-surface">{dt.label}</p>
                    {dt.required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-app-warning-bg text-app-warning font-medium">Required</span>}
                  </div>
                  <p className="text-[12px] text-app-text-muted dark:text-gray-400 mt-0.5">{dt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </IndividualLayout>
  );
}
