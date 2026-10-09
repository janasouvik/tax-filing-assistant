import React from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { FilingStepper, LoadingSpinner, InlineError } from '../../components/individual/SharedComponents';
import { individualApi, type TaxpayerProfile } from '../../services/individual.service';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Puducherry', 'Chandigarh', 'Andaman & Nicobar', 'Lakshadweep',
];

export function IndividualLayout({ children, currentStep }: { children: React.ReactNode; currentStep: number }) {
  const navigate = useNavigate();
  return (
    <div className="bg-app-bg text-app-text-primary min-h-screen">
      <Navbar />
      <div className="pt-16 min-h-screen flex flex-col">
        <main className="flex-1 w-full py-10 px-6 md:px-12">
          <div className="max-w-[900px] mx-auto space-y-8">
            {/* Stepper */}
            <div className="bg-app-surface border border-app-border rounded-xl p-5 shadow-xs overflow-x-auto">
              <FilingStepper
                currentStep={currentStep}
                completedSteps={Array.from({ length: currentStep - 1 }, (_, i) => i + 1)}
                onStepClick={(step) => step.path && navigate(step.path)}
              />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PersonalProfile() {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Partial<TaxpayerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasFetched = React.useRef(false);

  useEffect(() => {
    let mounted = true;
    if (!isAuthLoaded || !isUserLoaded || !isSignedIn || hasFetched.current) return;
    hasFetched.current = true;
    
    (async () => {
      console.log('PROFILE_GET_START');
      try {
        const p = await individualApi.getProfile(getToken);
        if (!mounted) return;
        
        console.log('PROFILE_GET_SUCCESS', { method: 'GET', status: 200 });
        
        // Pre-fill from Clerk if no profile data
        if (!p.fullName && user?.fullName) {
          setProfile({ ...p, fullName: user.fullName || undefined, email: user.primaryEmailAddress?.emailAddress });
        } else {
          setProfile(p);
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('PROFILE_GET_ERROR', err);
        if (err.code !== 'WORKSPACE_NOT_FOUND') setError(err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user?.id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.fullName?.trim()) errs.fullName = 'Full name is required';
    if (!profile.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!profile.mobileNumber?.trim()) errs.mobileNumber = 'Mobile number is required';
    if (!profile.email?.trim()) errs.email = 'Email is required';
    if (!profile.state) errs.state = 'State is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    console.log('PROFILE_SAVE_START', { method: 'PUT', route: '/individual/profile' });
    try {
      const updated = await individualApi.updateProfile(getToken, profile);
      console.log('PROFILE_SAVE_SUCCESS', { method: 'PUT', status: 200 });
      setProfile(updated);
      navigate('/individual/pan');
    } catch (err: any) {
      console.error('PROFILE_SAVE_ERROR', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof TaxpayerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (loading) {
    return (
      <IndividualLayout currentStep={1}>
        <LoadingSpinner message="Loading your profile..." />
      </IndividualLayout>
    );
  }

  return (
    <IndividualLayout currentStep={1}>
      <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-xs">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[20px] text-app-accent">person</span>
            <p className="text-[12px] font-semibold text-app-text-muted uppercase tracking-wider">Step 1 of 12</p>
          </div>
          <h1 className="font-serif text-[32px] text-app-text-primary font-normal">Personal Profile</h1>
          <p className="text-[15px] text-app-text-secondary mt-1">
            Provide your personal information as it appears on official documents.
          </p>
        </div>

        {/* Info banner — distinguish TaxPilot account vs taxpayer info */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-[13px] text-blue-800 mb-7">
          <span className="material-symbols-outlined text-[18px] text-blue-600 mt-0.5 shrink-0">info</span>
          <div>
            <span className="font-semibold">Taxpayer Information</span>
            <p className="mt-0.5 text-blue-700">
              This information is used for your tax return. Your TaxPilot account details (login, email) are managed separately via your account settings.
            </p>
          </div>
        </div>

        {error && <div className="mb-6"><InlineError message={error} onRetry={() => setError('')} /></div>}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="fullName">
              Full Name <span className="text-app-error">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={profile.fullName || ''}
              onChange={e => handleChange('fullName', e.target.value)}
              placeholder="As on PAN card"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.fullName ? 'border-app-error' : 'border-app-border'}`}
            />
            {errors.fullName && <p className="mt-1 text-[12px] text-app-error">{errors.fullName}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="dateOfBirth">
              Date of Birth <span className="text-app-error">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : ''}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white text-app-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.dateOfBirth ? 'border-app-error' : 'border-app-border'}`}
            />
            {errors.dateOfBirth && <p className="mt-1 text-[12px] text-app-error">{errors.dateOfBirth}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="mobileNumber">
              Mobile Number <span className="text-app-error">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-app-border bg-app-bg text-[13px] text-app-text-muted">+91</span>
              <input
                id="mobileNumber"
                type="tel"
                value={profile.mobileNumber || ''}
                onChange={e => handleChange('mobileNumber', e.target.value)}
                placeholder="10-digit mobile"
                maxLength={10}
                className={`flex-1 px-3.5 py-2.5 rounded-r-lg border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.mobileNumber ? 'border-app-error' : 'border-app-border'}`}
              />
            </div>
            {errors.mobileNumber && <p className="mt-1 text-[12px] text-app-error">{errors.mobileNumber}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="email">
              Email Address <span className="text-app-error">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={profile.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.email ? 'border-app-error' : 'border-app-border'}`}
            />
            {errors.email && <p className="mt-1 text-[12px] text-app-error">{errors.email}</p>}
          </div>

          {/* Residential Status */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="residentialStatus">
              Residential Status
            </label>
            <select
              id="residentialStatus"
              value={profile.residentialStatus || 'RESIDENT'}
              onChange={e => handleChange('residentialStatus', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-app-border text-[14px] bg-white text-app-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="RESIDENT">Resident Indian</option>
              <option value="NON_RESIDENT">Non-Resident Indian (NRI)</option>
              <option value="RESIDENT_BUT_NOT_ORDINARILY_RESIDENT">Resident but Not Ordinarily Resident (RNOR)</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="state">
              State <span className="text-app-error">*</span>
            </label>
            <select
              id="state"
              value={profile.state || ''}
              onChange={e => handleChange('state', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[14px] bg-white text-app-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.state ? 'border-app-error' : 'border-app-border'}`}
            >
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="mt-1 text-[12px] text-app-error">{errors.state}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="city">
              City
            </label>
            <input
              id="city"
              type="text"
              value={profile.city || ''}
              onChange={e => handleChange('city', e.target.value)}
              placeholder="Your city"
              className="w-full px-3.5 py-2.5 rounded-lg border border-app-border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* PIN Code */}
          <div>
            <label className="block text-[13px] font-medium text-app-text-primary mb-1.5" htmlFor="pinCode">
              PIN Code
            </label>
            <input
              id="pinCode"
              type="text"
              value={profile.pinCode || ''}
              onChange={e => handleChange('pinCode', e.target.value)}
              placeholder="6-digit PIN"
              maxLength={6}
              className="w-full px-3.5 py-2.5 rounded-lg border border-app-border text-[14px] bg-white text-app-text-primary placeholder-app-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-app-border-light">
          <button
            onClick={() => navigate('/individualtaxdashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-app-border text-app-text-secondary hover:bg-app-bg text-[14px] font-medium transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Dashboard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-[#52321c] text-white text-[14px] font-medium transition-all shadow-sm disabled:opacity-60"
            type="button"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save & Continue
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </IndividualLayout>
  );
}

