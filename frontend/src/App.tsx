import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SMETaxDashboard from './pages/SMETaxDashboard';
import TaxReviewValidation from './pages/TaxReviewValidation';
import ForSMEs from './pages/ForSMEs';
import TaxCalendarComplianceDeadlines from './pages/TaxCalendarComplianceDeadlines';
import TaxPreparationDocumentOCR from './pages/TaxPreparationDocumentOCR';
import IndividualTaxDashboard from './pages/IndividualTaxDashboard';
import TaxCopilotAIChatAssistant from './pages/TaxCopilotAIChatAssistant';
import PricingPlans from './pages/PricingPlans';
import UserTaxManagementDashboard2 from './pages/UserTaxManagementDashboard2';
import ForIndividuals from './pages/ForIndividuals';
import DocumentVaultEFilingHistory from './pages/DocumentVaultEFilingHistory';
import HowItWorks from './pages/HowItWorks';
import Home from './pages/Home';
import CAFirmPracticeDashboardMultiClientCockpit from './pages/CAFirmPracticeDashboardMultiClientCockpit';
import TaxCalculationEngineSlabsOldvsNewRegime from './pages/TaxCalculationEngineSlabsOldvsNewRegime';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardRouter from './pages/DashboardRouter';
import Onboarding from './pages/Onboarding';

// ── Individual filing workflow pages ──
import PersonalProfile from './pages/individual/PersonalProfile';
import PANVerification from './pages/individual/PANVerification.tsx';
import AadhaarPANStatus from './pages/individual/AadhaarPANStatus.tsx';
import ITREligibility from './pages/individual/ITREligibility.tsx';
import DocumentCollection from './pages/individual/DocumentCollection.tsx';
import IncomeDeductions from './pages/individual/IncomeDeductions.tsx';
import TaxCalculation from './pages/individual/TaxCalculation.tsx';
import ValidationPage from './pages/individual/ValidationPage.tsx';
import FinalReview from './pages/individual/FinalReview.tsx';
import FilingReady from './pages/individual/FilingReady.tsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Existing routes (PRESERVED) ── */}
        <Route path="/smetaxdashboard" element={<SMETaxDashboard />} />
        <Route path="/taxreviewvalidation" element={<TaxReviewValidation />} />
        <Route path="/smes" element={<ForSMEs />} />
        <Route path="/taxcalendarcompliancedeadlines" element={<TaxCalendarComplianceDeadlines />} />
        <Route path="/taxpreparationdocumentocr" element={<TaxPreparationDocumentOCR />} />
        <Route path="/individualtaxdashboard" element={<IndividualTaxDashboard />} />
        <Route path="/taxcopilotaichatassistant" element={<TaxCopilotAIChatAssistant />} />
        <Route path="/pricingplans" element={<PricingPlans />} />
        <Route path="/usertaxmanagementdashboard2" element={<UserTaxManagementDashboard2 />} />
        <Route path="/individuals" element={<ForIndividuals />} />
        <Route path="/documentvaultefilinghistory" element={<DocumentVaultEFilingHistory />} />
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/" element={<Home />} />
        <Route path="/cafirmpracticedashboardmulticlientcockpit" element={<CAFirmPracticeDashboardMultiClientCockpit />} />
        <Route path="/taxcalculationengineslabsoldvsnewregime" element={<TaxCalculationEngineSlabsOldvsNewRegime />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/dashboard-router" element={<DashboardRouter />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* ── Individual filing workflow (new) ── */}
        <Route path="/individual" element={<IndividualTaxDashboard />} />
        <Route path="/individual/profile" element={<PersonalProfile />} />
        <Route path="/individual/pan" element={<PANVerification />} />
        <Route path="/individual/aadhaar" element={<AadhaarPANStatus />} />
        <Route path="/individual/eligibility" element={<ITREligibility />} />
        <Route path="/individual/documents" element={<DocumentCollection />} />
        <Route path="/individual/income" element={<IncomeDeductions />} />
        <Route path="/individual/deductions" element={<IncomeDeductions />} />
        <Route path="/individual/tax" element={<TaxCalculation />} />
        <Route path="/individual/validation" element={<ValidationPage />} />
        <Route path="/individual/review" element={<FinalReview />} />
        <Route path="/individual/filing" element={<FilingReady />} />
        <Route path="/individual/everify" element={<FilingReady />} />
      </Routes>
    </Router>
  );
}

export default App;
