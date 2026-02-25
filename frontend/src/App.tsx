import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CallProvider } from './context/CallContext';
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import BlogPage from './pages/BlogPage';
import SearchPage from './pages/SearchPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import ScrollToTop from './components/shared/ScrollToTop';
import FloatingScrollButton from './components/shared/FloatingScrollButton';
import ClientDashboard from './pages/dashboard/client/ClientDashboard';
import AdvocateDashboard from './pages/dashboard/advocate/AdvocateDashboard';
import AdvisorDashboard from './pages/dashboard/advisor/AdvisorDashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import Preservices from './components/footerpages/premiumservices.tsx';
import AboutUs from './pages/AboutPage';
import PublicProfile from './pages/PublicProfile';
import Careers from './components/footerpages/carrers.tsx';
import ResetPassword from './pages/auth/ResetPassword';
import AdvHowIt from './components/footerpages/advhowit.tsx';
import ClientHowIt from './components/footerpages/clienthowit.tsx';
import SiteHowItWorks from './components/footerpages/sitehowitworks.tsx';
import Credits from './components/footerpages/credits.tsx';
import SiteMap from './components/footerpages/sitemap.tsx';
import AdvCenters from './components/footerpages/advocenters.tsx';
import FraudAlert from './components/footerpages/fraudalert.tsx';
import TermsOfUse from './components/footerpages/termsofuse.tsx';
import ThirdPartyTerms from './components/footerpages/thirdparty.tsx';
import PrivacyPolicy from './components/footerpages/privacypolicy.tsx';
import CookiePolicy from './components/footerpages/cookiepolicy.tsx';
import Summons from './components/footerpages/summons.tsx';
import Grievances from './components/footerpages/grivence.tsx';
import RefundPolicy from './components/footerpages/refund.tsx';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';
import LegalDocumentationPage from './pages/LegalDocumentationPage';
import ClientLegalDocumentation from './pages/dashboard/client/LegalDocumentation';
import AdvocateLegalDocumentation from './pages/dashboard/advocate/LegalDocumentation';
import AdvisorLegalDocumentation from './pages/dashboard/advisor/LegalDocumentation';
import DashboardLegalDocs from './pages/DashboardLegalDocs';
import CallWindow from './components/shared/CallWindow';

// Admin Members
import MemberTable from './components/admin/MemberTable';
import SuperRegistration from './pages/admin/staffs/SuperRegistration';
import ForcePasswordChange from './pages/auth/ForcePasswordChange';
import FreeMembers from './pages/admin/members/FreeMembers';

// Shared Management Pages
import ProfessionalAudit from './pages/shared/ProfessionalAudit';
import StaffPayroll from './pages/shared/StaffPayroll';
import ResourcePlanning from './pages/shared/ResourcePlanning';
import PremiumMembers from './pages/admin/members/PremiumMembers';
import ApprovedMembers from './pages/admin/members/ApprovedMembers';
import PendingMembers from './pages/admin/members/PendingMembers';
import BulkMemberAdd from './pages/admin/members/BulkMemberAdd';
import DeactivatedMembers from './pages/admin/members/DeactivatedMembers';
import BlockedMembers from './pages/admin/members/BlockedMembers';
import DeletedMembers from './pages/admin/members/DeletedMembers';
import ReportedMembers from './pages/admin/members/ReportedMembers';
import UnapprovedPictures from './pages/admin/members/UnapprovedPictures';
import ProfileSections from './pages/admin/members/ProfileSections';
import MemberVerification from './pages/admin/members/MemberVerification';
import LoginMemberDetails from './pages/admin/members/LoginMemberDetails';

// Admin Attributes
import Country from './pages/admin/attributes/Country';
import State from './pages/admin/attributes/State';
import City from './pages/admin/attributes/City';
import MemberLanguage from './pages/admin/attributes/MemberLanguage';
import PracticeAreas from './pages/admin/attributes/PracticeAreas';
import Courts from './pages/admin/attributes/Courts';
import Specializations from './pages/admin/attributes/Specializations';
import CaseTypes from './pages/admin/attributes/CaseTypes';
import IdProofTypes from './pages/admin/attributes/IdProofTypes';
import ExperienceLevels from './pages/admin/attributes/ExperienceLevels';

// Admin Finance & Premium
import PremiumPackages from './pages/admin/PremiumPackages';
import PackagePayments from './pages/admin/PackagePayments';
import WalletHistory from './pages/admin/wallet/WalletHistory';
import WalletRecharge from './pages/admin/wallet/WalletRecharge';

// Admin Content
import AllPosts from './pages/admin/blog/AllPosts';
import BlogCategories from './pages/admin/blog/BlogCategories';
import Newsletter from './pages/admin/marketing/Newsletter';
import MailAgentActivity from './pages/admin/marketing/MailAgentActivity';
import ContactQueries from './pages/admin/ContactQueries';

// Admin Referral & Support
import ReferralCommission from './pages/admin/referral/ReferralCommission';
import ReferralUsers from './pages/admin/referral/ReferralUsers';
import ReferralEarnings from './pages/admin/referral/ReferralEarnings';
import ReferralOffers from './pages/admin/referral/OfferManagement';
import WalletWithdraw from './pages/admin/referral/WalletWithdraw';
import ActiveTickets from './pages/admin/support/ActiveTickets';
import MyTickets from './pages/admin/support/MyTickets';
import SolvedTickets from './pages/admin/support/SolvedTickets';
import SupportCategory from './pages/admin/support/SupportCategory';
import AssignedAgent from './pages/admin/support/AssignedAgent';

// Admin Systems & Setup
import SmsTemplates from './pages/admin/otp/SmsTemplates';
import OtpCredentials from './pages/admin/otp/OtpCredentials';
import SendSms from './pages/admin/otp/SendSms';
import ManualPayments from './pages/admin/offline-payments/ManualPayments';
import UploadedFiles from './pages/admin/UploadedFiles';

// Admin Legal Documentation
import AgreementsList from './pages/admin/legal-docs/AgreementsList';
import AffidavitsList from './pages/admin/legal-docs/AffidavitsList';
import NoticesList from './pages/admin/legal-docs/NoticesList';
import DocumentationProviders from './pages/admin/legal-docs/DocumentationProviders';
import LegalDocumentServices from './pages/admin/legal-docs/LegalDocumentServices';
import HeaderSetup from './pages/admin/setup/HeaderSetup';
import FooterSetup from './pages/admin/setup/FooterSetup';
import PagesSetup from './pages/admin/setup/PagesSetup';
import AppearanceSetup from './pages/admin/setup/AppearanceSetup';
import EcosystemSetup from './pages/admin/setup/EcosystemSetup';

// Admin Settings
import GeneralSettings from './pages/admin/settings/GeneralSettings';
import LanguageSettings from './pages/admin/settings/LanguageSettings';
import CurrencySettings from './pages/admin/settings/CurrencySettings';
import PaymentMethods from './pages/admin/settings/PaymentMethods';
import SmtpSettings from './pages/admin/settings/SmtpSettings';
import EmailTemplates from './pages/admin/settings/EmailTemplates';
import ThirdPartySettings from './pages/admin/settings/ThirdPartySettings';
import SocialLogin from './pages/admin/settings/SocialLogin';
import PushNotification from './pages/admin/settings/PushNotification';

// Role-Based Dashboards
import RoleDashboardLayout from './layouts/RoleDashboardLayout';
import AdminDashHome from './pages/dashboard/admin/AdminDashHome';
import AdvocateApprovals from './pages/dashboard/admin/AdvocateApprovals';
import ClientsList from './pages/dashboard/admin/ClientsList';
import Verifications from './pages/dashboard/admin/Verifications';
import Cases from './pages/dashboard/admin/Cases';
import Disputes from './pages/dashboard/admin/Disputes';
import AdminTickets from './pages/dashboard/admin/AdminTickets';

import AssignedVerifications from './pages/dashboard/verifier/AssignedVerifications';
import VerificationHistory from './pages/dashboard/verifier/VerificationHistory';

import Transactions from './pages/dashboard/finance/Transactions';
import Payouts from './pages/dashboard/finance/Payouts';
import Refunds from './pages/dashboard/finance/Refunds';
import FinanceReports from './pages/dashboard/finance/FinanceReports';

import TicketsInbox from './pages/dashboard/support/TicketsInbox';

import UserDashboard from './pages/dashboard/user/user';

// Super Admin Staff & System
import AllStaffs from './pages/admin/staffs/AllStaffs';
import StaffRoles from './pages/admin/staffs/StaffRoles';
import Outsourcing from './pages/admin/staffs/Outsourcing';
import SystemUpdate from './pages/admin/system/SystemUpdate';
import ServerStatus from './pages/admin/system/ServerStatus';
import AddonManager from './pages/admin/AddonManager';
import ImpersonationBanner from './components/admin/ImpersonationBanner';

// Enterprise Support Dashboards
// TELECALLER IMPORTS
import TelecallerLayout from './layouts/TelecallerLayout';
import TelecallerChat from './pages/telecaller/chat/TelecallerChat';
import TelecallerMembers from './pages/telecaller/members/TelecallerMembers';

// CUSTOMER CARE IMPORTS
import CustomerCareLayout from './layouts/CustomerCareLayout';
import CustomerCareWorkspace from './pages/customercare/workspace/CustomerCareWorkspace';
import CustomerCareMembers from './pages/customercare/members/CustomerCareMembers';

// DATA ENTRY IMPORTS
import DataEntryLayout from './layouts/DataEntryLayout';
import DataEntryWorkspace from './pages/dataentry/workspace/DataEntryWorkspace';
import DataEntryMembers from './pages/dataentry/members/DataEntryMembers';
import ManualEntry from './pages/dataentry/ManualEntry';

import CallSupportLayout from './layouts/CallSupportLayout';
import LiveChatLayout from './layouts/LiveChatLayout';

// NEW PREMIUM SUPPORT DASHBOARD IMPORTS
import PremiumChat from './pages/dashboard/support/premiumpackagesuportroles/PremiumChat';
import PremiumCall from './pages/dashboard/support/premiumpackagesuportroles/PremiumCall';
import PremiumLive from './pages/dashboard/support/premiumpackagesuportroles/PremiumLive';
import PremiumPersonalAgent from './pages/dashboard/support/premiumpackagesuportroles/PremiumPersonalAgent';

import PersonalAssistantLayout from './layouts/PersonalAssistantLayout';

// PROFESSIONAL ADMINISTRATIVE IMPORTS
import InfluencerWorkspace from './pages/influencer/workspace/InfluencerWorkspace';
import MarketerWorkspace from './pages/marketer/workspace/MarketerWorkspace';
import MarketingAgencyWorkspace from './pages/marketing-agency/workspace/MarketingAgencyWorkspace';

// SUPPORT ROLE DATA (REFACTORED)
import AssistantWorkspace from './pages/personalassistant/workspace/AssistantWorkspace';

// MANAGEMENT & OPERATIONS IMPORTS
import TeamLeadLayout from './layouts/TeamLeadLayout';
import TeamLeadWorkspace from './pages/teamlead/workspace/TeamLeadWorkspace';
import ManagerLayout from './layouts/ManagerLayout';
import ManagerWorkspace from './pages/manager/workspace/ManagerWorkspace';
import HRLayout from './layouts/HRLayout';
import HRWorkspace from './pages/hr/workspace/HRWorkspace';
import RecruitmentHub from './pages/hr/recruitment/RecruitmentHub';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminOnlyPage from './pages/shared/AdminOnlyPage';
import TeamLeadPerformance from './pages/manager/oversight/TeamLeadPerformance';
import HRWorkProgress from './pages/manager/oversight/HRWorkProgress';
import RoleReports from './pages/manager/oversight/RoleReports';
import InformSuperAdmin from './pages/manager/communications/InformSuperAdmin';
import ManagerPermissions from './pages/admin/settings/ManagerPermissions';
import ManagerPermissionGuard from './components/auth/ManagerPermissionGuard';
import StaffGlobalDashboard from './pages/staff/StaffGlobalDashboard';
import RejectionOverlay from './components/auth/RejectionOverlay';
import LiveChatPage from './pages/staff/LiveChatPage';
import CallSupportPage from './pages/staff/CallSupportPage';
import TelecallerPage from './pages/staff/TelecallerPage';
import EmailSupportPage from './pages/staff/EmailSupportPage';
import EmailSupport from './pages/dashboard/support/roles/EmailSupport';

import { useAuth } from './context/AuthContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRelationshipSync } from './hooks/useRelationshipSync';

import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient();

import ReferralDashboard from './pages/dashboard/referral/ReferralDashboard';

// Helper component to redirect to the specific user's dashboard URL
const DashboardRedirect: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />;
  }

  const role = user.role.toLowerCase().replace(/-/g, '_');
  const id = user.unique_id || user.id;

  if (role === 'admin' || role === 'super_admin' || role === 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Referral Roles mapping
  const referralRoles = ['referral', 'influencer', 'marketer', 'marketing_agency'];
  if (referralRoles.includes(role)) {
    return <Navigate to="/dashboard/referral" replace />;
  }

  if (role === 'live_chat' || role === 'chat_support') {
    return <Navigate to="/dashboard/live-chat" replace />;
  }

  if (role === 'call_support') {
    return <Navigate to="/dashboard/call-support" replace />;
  }

  if (role === 'telecaller') {
    return <Navigate to="/dashboard/telecalling" replace />;
  }

  if (role === 'email_support') {
    return <Navigate to="/dashboard/email-desk" replace />;
  }

  if ([
    'manager', 'teamlead', 'hr', 'data_entry', 'personal_assistant', 'personal_agent', 'support', 'customer_care'
  ].includes(role)) {
    return <Navigate to="/staff/portal" replace />;
  }

  if (role === 'verifier') {
    return <Navigate to="/dashboard/verifier" replace />;
  }

  if (role === 'finance') {
    return <Navigate to="/dashboard/finance" replace />;
  }

  // Custom mapping for role-to-path
  let pathRole = role;
  if (role === 'legal_provider') pathRole = 'advisor';

  return <Navigate to={`/dashboard/${pathRole}/${id}`} replace />;
};

import GlobalUtilityHandler from './components/shared/GlobalUtilityHandler';

import IntroAnimation from './components/shared/IntroAnimation';

const AppContent: React.FC = () => {
  useRelationshipSync();
  const [showIntro, setShowIntro] = React.useState(() => {
    return !sessionStorage.getItem('intro_played');
  });

  const handleIntroFinish = () => {
    setShowIntro(false);
    sessionStorage.setItem('intro_played', 'true');
  };

  return (
    <>
      {showIntro && <IntroAnimation onFinish={handleIntroFinish} />}
      <GlobalUtilityHandler />
      <CallWindow />
      <RejectionOverlay />
      <ScrollToTop />
      <FloatingScrollButton />
      <ImpersonationBanner />
      <Routes>
        {/* ROUTES CONTENT */}
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="blogs" element={<BlogPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile/:uniqueId" element={<PublicProfile />} />
          <Route path="premium-services" element={<Preservices />} />
          <Route path="how-it-works" element={<SiteHowItWorks />} />
          <Route path="advocate-how-it-works" element={<AdvHowIt />} />
          <Route path="client-how-it-works" element={<ClientHowIt />} />
          <Route path="terms" element={<TermsOfUse />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="careers" element={<Careers />} />
          <Route path="site-map" element={<SiteMap />} />
          <Route path="documentation-how-it-works" element={<LegalDocumentationPage />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="legal-documentation" element={<LegalDocumentationPage />} />
          <Route path="summons-and-notices" element={<Summons />} />
          <Route path="grievance-redressal" element={<Grievances />} />
          <Route path="refund" element={<RefundPolicy />} />
          <Route path="centers" element={<AdvCenters />} />
          <Route path="fraud-alert" element={<FraudAlert />} />
          <Route path="third-party-terms" element={<ThirdPartyTerms />} />
          <Route path="cookie-policy" element={<CookiePolicy />} />
        </Route>

        {/* DASHBOARD ROUTES */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/dashboard/client/:uniqueId" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/advocate/:uniqueId" element={<ProtectedRoute allowedRoles={['advocate']}><AdvocateDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/advisor/:uniqueId" element={<ProtectedRoute allowedRoles={['legal_provider']}><AdvisorDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/user/:uniqueId" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/email_support/:uniqueId" element={<ProtectedRoute allowedRoles={['email_support']}><EmailSupport /></ProtectedRoute>} />
        <Route path="/dashboard/verifier" element={<ProtectedRoute allowedRoles={['verifier']}><AssignedVerifications /></ProtectedRoute>} />
        <Route path="/dashboard/finance" element={<ProtectedRoute allowedRoles={['finance']}><Transactions /></ProtectedRoute>} />
        <Route path="/dashboard/referral" element={<ProtectedRoute allowedRoles={['referral', 'influencer', 'marketer', 'marketing_agency']}><ReferralDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/legal-docs" element={<DashboardLegalDocs />} />

        <Route path="/dashboard/live-chat" element={<ProtectedRoute allowedRoles={['live_chat', 'chat_support']}><LiveChatPage /></ProtectedRoute>} />
        <Route path="/dashboard/call-support" element={<ProtectedRoute allowedRoles={['call_support']}><CallSupportPage /></ProtectedRoute>} />
        <Route path="/dashboard/telecalling" element={<ProtectedRoute allowedRoles={['telecaller']}><TelecallerPage /></ProtectedRoute>} />
        <Route path="/dashboard/email-desk" element={<ProtectedRoute allowedRoles={['email_support']}><EmailSupportPage /></ProtectedRoute>} />

        {/* STAFF ROUTES */}
        <Route path="/staff/portal" element={<ProtectedRoute allowedRoles={['manager', 'teamlead', 'hr', 'support', 'customer_care', 'personal_assistant', 'personal_agent', 'influencer', 'marketer', 'marketing_agency', 'data_entry']}><StaffGlobalDashboard /></ProtectedRoute>} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="members/free" element={<FreeMembers />} />
          <Route path="members/premium" element={<PremiumMembers />} />
          <Route path="members/approved" element={<ApprovedMembers />} />
          <Route path="members/pending" element={<PendingMembers />} />
          <Route path="members/verification" element={<MemberVerification />} />
          <Route path="members/unapproved-pictures" element={<UnapprovedPictures />} />
          <Route path="members/reported" element={<ReportedMembers />} />
          <Route path="members/blocked" element={<BlockedMembers />} />
          <Route path="members/deactivated" element={<DeactivatedMembers />} />
          <Route path="members/deleted" element={<DeletedMembers />} />
          <Route path="members/login-details" element={<LoginMemberDetails />} />

          <Route path="members/bulk-add" element={<BulkMemberAdd />} />
          <Route path="members/attributes" element={<Navigate to="attributes/practice-areas" replace />} />
          <Route path="attributes/practice-areas" element={<PracticeAreas />} />
          <Route path="attributes/courts" element={<Courts />} />
          <Route path="attributes/specializations" element={<Specializations />} />
          <Route path="attributes/case-types" element={<CaseTypes />} />
          <Route path="attributes/language" element={<MemberLanguage />} />
          <Route path="attributes/country" element={<Country />} />
          <Route path="attributes/state" element={<State />} />
          <Route path="attributes/city" element={<City />} />
          <Route path="attributes/id-proof" element={<IdProofTypes />} />
          <Route path="attributes/experience" element={<ExperienceLevels />} />
          <Route path="members/profile-sections" element={<ProfileSections />} />

          <Route path="premium-packages" element={<PremiumPackages />} />
          <Route path="package-payments" element={<PackagePayments />} />

          <Route path="legal-docs/providers" element={<DocumentationProviders />} />
          <Route path="legal-docs/providers/:statusFilter" element={<DocumentationProviders />} />
          <Route path="legal-docs/agreements" element={<AgreementsList />} />
          <Route path="legal-docs/affidavits" element={<AffidavitsList />} />
          <Route path="legal-docs/notices" element={<NoticesList />} />
          <Route path="legal-docs/services" element={<LegalDocumentServices />} />

          <Route path="wallet/history" element={<WalletHistory />} />
          <Route path="wallet/recharge" element={<WalletRecharge />} />

          <Route path="blog/posts" element={<AllPosts />} />
          <Route path="blog/categories" element={<BlogCategories />} />

          <Route path="marketing/newsletter" element={<Newsletter />} />
          <Route path="marketing/activity" element={<MailAgentActivity />} />
          <Route path="contact-queries" element={<ContactQueries />} />

          <Route path="referral/commission" element={<ReferralCommission />} />
          <Route path="referral/users" element={<ReferralUsers />} />
          <Route path="referral/offers" element={<ReferralOffers />} />
          <Route path="referral/earnings" element={<ReferralEarnings />} />
          <Route path="referral/withdraw" element={<WalletWithdraw />} />

          <Route path="support/active" element={<ActiveTickets />} />
          <Route path="support/settings/category" element={<SupportCategory />} />
          <Route path="support/settings/agent" element={<AssignedAgent />} />

          <Route path="otp/templates" element={<SmsTemplates />} />
          <Route path="otp/credentials" element={<OtpCredentials />} />
          <Route path="otp/send" element={<SendSms />} />

          <Route path="offline-payments/manual" element={<ManualPayments />} />
          <Route path="uploaded-files" element={<UploadedFiles />} />

          <Route path="setup/header" element={<HeaderSetup />} />
          <Route path="setup/footer" element={<FooterSetup />} />
          <Route path="setup/pages" element={<PagesSetup />} />
          <Route path="setup/appearance" element={<AppearanceSetup />} />
          <Route path="setup/ecosystem" element={<EcosystemSetup />} />

          <Route path="settings/general" element={<GeneralSettings />} />
          <Route path="settings/language" element={<LanguageSettings />} />
          <Route path="settings/currency" element={<CurrencySettings />} />
          <Route path="settings/payments" element={<PaymentMethods />} />
          <Route path="settings/smtp" element={<SmtpSettings />} />
          <Route path="settings/email-templates" element={<EmailTemplates />} />
          <Route path="settings/third-party" element={<ThirdPartySettings />} />
          <Route path="settings/social-login" element={<SocialLogin />} />
          <Route path="settings/push-notification" element={<PushNotification />} />

          <Route path="staffs/all" element={<AllStaffs />} />
          <Route path="staffs/roles" element={<StaffRoles />} />
          <Route path="staffs/outsourced" element={<Outsourcing />} />
          <Route path="staffs/registration" element={<SuperRegistration />} />

          <Route path="system/update" element={<SystemUpdate />} />
          <Route path="system/status" element={<ServerStatus />} />

          <Route path="manager-permissions" element={<ManagerPermissions />} />
          <Route path="addon-manager" element={<AddonManager />} />
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

import { AccessibilityProvider } from './context/AccessibilityContext';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <AccessibilityProvider>
            <CallProvider>
              <ToastProvider>
                <Router>
                  <AppContent />
                </Router>
              </ToastProvider>
            </CallProvider>
          </AccessibilityProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
