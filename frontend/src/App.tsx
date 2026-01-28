import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import HomeLayout from './layouts/HomeLayout';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import BlogPage from './pages/BlogPage';
import SearchPage from './pages/SearchPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ClientDashboard from './pages/dashboard/client/ClientDashboard';
import AdvocateDashboard from './pages/dashboard/advocate/AdvocateDashboard';
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
import ContactQueries from './pages/admin/ContactQueries';

// Admin Referral & Support
import ReferralCommission from './pages/admin/referral/ReferralCommission';
import ReferralUsers from './pages/admin/referral/ReferralUsers';
import ReferralEarnings from './pages/admin/referral/ReferralEarnings';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ImpersonationBanner />
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<HomeLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="blogs" element={<BlogPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="profile/:uniqueId" element={<PublicProfile />} />
              <Route path="file-a-case" element={<PlaceholderPage />} />
              <Route path="case-status" element={<PlaceholderPage />} />
              <Route path="premium-services" element={<Preservices />} />
              <Route path="careers" element={<Careers />} />
              <Route path="how-it-works" element={<SiteHowItWorks />} />
              <Route path="advocate-how-it-works" element={<AdvHowIt />} />
              <Route path="client-how-it-works" element={<ClientHowIt />} />
              <Route path="credits" element={<Credits />} />
              <Route path="site-map" element={<SiteMap />} />
              <Route path="find-clients" element={<PlaceholderPage />} />
              <Route path="find-advocates" element={<PlaceholderPage />} />
              <Route path="help" element={<PlaceholderPage />} />
              <Route path="centers" element={<AdvCenters />} />
              <Route path="fraud-alert" element={<FraudAlert />} />
              <Route path="terms" element={<TermsOfUse />} />
              <Route path="third-party-terms" element={<ThirdPartyTerms />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="cookie-policy" element={<CookiePolicy />} />
              <Route path="summons" element={<Summons />} />
              <Route path="grievances" element={<Grievances />} />
              <Route path="refund" element={<RefundPolicy />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* PROTECTED DASHBOARD ROUTES */}
            <Route path="/dashboard/client" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/advocate" element={
              <ProtectedRoute>
                <AdvocateDashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/user" element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={<Navigate to="/dashboard/client" replace />} />
            {/* AUTH ROUTES */}
            <Route path="/auth/force-password-change" element={<ForcePasswordChange />} />

            {/* SUPER ADMIN ROUTES */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />

              {/* Members Section */}
              <Route path="members/free" element={<FreeMembers />} />
              <Route path="members/premium" element={<PremiumMembers />} />
              <Route path="members/approved" element={<ApprovedMembers />} />
              <Route path="members/pending" element={<PendingMembers />} />
              <Route path="members/bulk-add" element={<BulkMemberAdd />} />
              <Route path="members/deactivated" element={<DeactivatedMembers />} />
              <Route path="members/blocked" element={<BlockedMembers />} />
              <Route path="members/deleted" element={<DeletedMembers />} />
              <Route path="members/reported" element={<ReportedMembers />} />
              <Route path="members/unapproved-pictures" element={<UnapprovedPictures />} />

              {/* Profile Attributes Section */}
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
              <Route path="members/verification" element={<MemberVerification />} />

              {/* Premium & Finance */}
              <Route path="premium-packages" element={<PremiumPackages />} />
              <Route path="package-payments" element={<PackagePayments />} />
              <Route path="wallet/history" element={<WalletHistory />} />
              <Route path="wallet/recharge" element={<WalletRecharge />} />

              {/* Content & Blog */}
              <Route path="blog/posts" element={<AllPosts />} />
              <Route path="blog/categories" element={<BlogCategories />} />
              <Route path="marketing/newsletter" element={<Newsletter />} />
              <Route path="contact-queries" element={<ContactQueries />} />

              {/* Referrals & Support */}
              <Route path="referral/commission" element={<ReferralCommission />} />
              <Route path="referral/users" element={<ReferralUsers />} />
              <Route path="referral/earnings" element={<ReferralEarnings />} />
              <Route path="referral/withdraw" element={<WalletWithdraw />} />

              <Route path="support/active" element={<ActiveTickets />} />
              <Route path="support/my" element={<MyTickets />} />
              <Route path="support/solved" element={<SolvedTickets />} />
              <Route path="support/settings/category" element={<SupportCategory />} />
              <Route path="support/settings/agent" element={<AssignedAgent />} />

              {/* Addons */}
              <Route path="otp/templates" element={<SmsTemplates />} />
              <Route path="otp/credentials" element={<OtpCredentials />} />
              <Route path="otp/send" element={<SendSms />} />
              <Route path="offline-payments/manual" element={<ManualPayments />} />
              <Route path="uploaded-files" element={<UploadedFiles />} />

              {/* Setup & Settings */}
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

            {/* NEW ROLE-BASED DASHBOARDS */}
            {/* ADMIN DASHBOARD */}
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashHome />} />
              <Route path="approvals" element={<AdvocateApprovals />} />
              <Route path="clients" element={<ClientsList />} />
              <Route path="verifications" element={<Verifications />} />
              <Route path="cases" element={<Cases />} />
              <Route path="disputes" element={<Disputes />} />
              <Route path="tickets" element={<AdminTickets />} />
            </Route>

            {/* VERIFIER DASHBOARD */}
            <Route path="/dashboard/verifier" element={
              <ProtectedRoute allowedRoles={['VERIFIER']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AssignedVerifications />} />
              <Route path="assigned" element={<AssignedVerifications />} />
              <Route path="history" element={<VerificationHistory />} />
            </Route>

            {/* FINANCE DASHBOARD */}
            <Route path="/dashboard/finance" element={
              <ProtectedRoute allowedRoles={['FINANCE']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Transactions />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="refunds" element={<Refunds />} />
              <Route path="reports" element={<FinanceReports />} />
            </Route>

            <Route path="/dashboard/support" element={
              <ProtectedRoute allowedRoles={['SUPPORT']}>
                <RoleDashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<TicketsInbox />} />
              <Route path="inbox" element={<TicketsInbox />} />
            </Route>

            {/* ========================================================================
                STAFF ROLE ARCHITECTURE ROUTES
                ======================================================================== */}

            {/* 1. PROFESSIONAL ADMINISTRATIVE ROLES (Standard Architecture) */}
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={
                <ManagerPermissionGuard permissionId="dashboard">
                  <ManagerDashboard />
                </ManagerPermissionGuard>
              } />

              {/* Members Section */}
              <Route path="members/free" element={<FreeMembers />} />
              <Route path="members/premium" element={<PremiumMembers />} />
              <Route path="members/approved" element={<ApprovedMembers />} />
              <Route path="members/pending" element={<PendingMembers />} />
              <Route path="members/bulk-add" element={<BulkMemberAdd />} />
              <Route path="members/deactivated" element={<DeactivatedMembers />} />
              <Route path="members/blocked" element={<BlockedMembers />} />
              <Route path="members/deleted" element={<DeletedMembers />} />
              <Route path="members/reported" element={<ReportedMembers />} />
              <Route path="members/unapproved-pictures" element={<UnapprovedPictures />} />

              {/* Profile Attributes Section */}
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
              <Route path="members/verification" element={<MemberVerification />} />

              {/* Premium & Finance */}
              <Route path="premium-packages" element={<PremiumPackages />} />
              <Route path="package-payments" element={<PackagePayments />} />
              <Route path="wallet/history" element={<WalletHistory />} />
              <Route path="wallet/recharge" element={<WalletRecharge />} />

              {/* Content & Blog */}
              <Route path="blog/posts" element={<AllPosts />} />
              <Route path="blog/categories" element={<BlogCategories />} />
              <Route path="marketing/newsletter" element={<Newsletter />} />
              <Route path="contact-queries" element={<ContactQueries />} />

              {/* Referrals & Support */}
              <Route path="referral/commission" element={<ReferralCommission />} />
              <Route path="referral/users" element={<ReferralUsers />} />
              <Route path="referral/earnings" element={<ReferralEarnings />} />
              <Route path="referral/withdraw" element={<WalletWithdraw />} />

              <Route path="support/active" element={<ActiveTickets />} />
              <Route path="support/my" element={<MyTickets />} />
              <Route path="support/solved" element={<SolvedTickets />} />
              <Route path="support/settings/category" element={<SupportCategory />} />
              <Route path="support/settings/agent" element={<AssignedAgent />} />

              {/* Addons & Restricted */}
              <Route path="otp/templates" element={<SmsTemplates />} />
              <Route path="otp/credentials" element={<OtpCredentials />} />
              <Route path="otp/send" element={<SendSms />} />
              <Route path="offline-payments/manual" element={<AdminOnlyPage />} />
              <Route path="uploaded-files" element={<UploadedFiles />} />

              {/* Setup & Settings - Restricted */}
              <Route path="website-setup" element={<AdminOnlyPage />} />
              <Route path="setup/header" element={<AdminOnlyPage />} />
              <Route path="setup/footer" element={<AdminOnlyPage />} />
              <Route path="setup/pages" element={<AdminOnlyPage />} />
              <Route path="setup/appearance" element={<AdminOnlyPage />} />
              <Route path="setup/ecosystem" element={<AdminOnlyPage />} />

              <Route path="settings" element={<AdminOnlyPage />} />
              <Route path="settings/general" element={<AdminOnlyPage />} />
              <Route path="settings/language" element={<AdminOnlyPage />} />
              <Route path="settings/currency" element={<AdminOnlyPage />} />
              <Route path="settings/payments" element={<AdminOnlyPage />} />
              <Route path="settings/smtp" element={<AdminOnlyPage />} />
              <Route path="settings/email-templates" element={<AdminOnlyPage />} />
              <Route path="settings/third-party" element={<AdminOnlyPage />} />
              <Route path="settings/social-login" element={<AdminOnlyPage />} />
              <Route path="settings/push-notification" element={<AdminOnlyPage />} />

              <Route path="staffs/all" element={<AllStaffs />} />
              <Route path="staffs/roles" element={<AdminOnlyPage />} />
              <Route path="staffs/outsourced" element={<Outsourcing />} />
              <Route path="staffs/registration" element={<SuperRegistration />} />

              <Route path="system" element={<AdminOnlyPage />} />
              <Route path="system/update" element={<AdminOnlyPage />} />
              <Route path="system/status" element={<AdminOnlyPage />} />
              <Route path="addon-manager" element={<AdminOnlyPage />} />

              {/* Oversight & Communications */}
              <Route path="oversight/team-lead" element={
                <ManagerPermissionGuard permissionId="tl-performance">
                  <TeamLeadPerformance />
                </ManagerPermissionGuard>
              } />
              <Route path="oversight/hr" element={
                <ManagerPermissionGuard permissionId="hr-progress">
                  <HRWorkProgress />
                </ManagerPermissionGuard>
              } />
              <Route path="oversight/reports" element={
                <ManagerPermissionGuard permissionId="role-reports">
                  <RoleReports />
                </ManagerPermissionGuard>
              } />
              <Route path="communications/inform-admin" element={
                <ManagerPermissionGuard permissionId="inform-admin">
                  <InformSuperAdmin />
                </ManagerPermissionGuard>
              } />

              {/* Original Manager Routes */}
              <Route path="workspace" element={<ManagerWorkspace />} />
              <Route path="hierarchy" element={<ManagerWorkspace />} />
              <Route path="analytics" element={<StaffPayroll />} />
              <Route path="resources" element={<ResourcePlanning />} />
              <Route path="reports" element={<ProfessionalAudit />} />
            </Route>

            <Route path="/team-lead" element={<TeamLeadLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<TeamLeadWorkspace />} />
              <Route path="monitoring" element={<TeamLeadWorkspace />} />
              <Route path="reports" element={<ProfessionalAudit />} />
              <Route path="queries" element={<ContactQueries />} />
              <Route path="members" element={<MemberTable title="Registry Audit" />} />
            </Route>

            <Route path="/hr" element={<HRLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<HRWorkspace />} />
              <Route path="recruitment" element={<RecruitmentHub />} />
              <Route path="staff" element={<MemberTable title="Staff Directory" />} />
              <Route path="roles" element={<ProfessionalAudit />} />
              <Route path="payroll" element={<StaffPayroll />} />
              <Route path="planning" element={<ResourcePlanning />} />
              <Route path="audit" element={<ProfessionalAudit />} />
            </Route>

            <Route path="/influencer" element={<TelecallerLayout />}> {/* Reusing TelecallerLayout for basic structure */}
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<InfluencerWorkspace />} />
            </Route>

            <Route path="/marketer" element={<TelecallerLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<MarketerWorkspace />} />
            </Route>

            <Route path="/marketing-agency" element={<TelecallerLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<MarketingAgencyWorkspace />} />
            </Route>


            {/* 2. E-ADVOCATE PACKAGE SUPPORT ROLES (Premium Dashboard Design) */}
            <Route path="/chat-support" element={<LiveChatLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<PremiumChat />} />
            </Route>

            <Route path="/call-support" element={<CallSupportLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<PremiumCall />} />
              <Route path="queries" element={<ContactQueries />} />
              <Route path="payments" element={<PackagePayments title="Call Support - Billing Audit" />} />
            </Route>

            <Route path="/live-chat" element={<LiveChatLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<PremiumLive />} />
              <Route path="queries" element={<ContactQueries />} />
              <Route path="payments" element={<PackagePayments title="Live Chat - Package Audit" />} />
            </Route>

            <Route path="/personal-agent" element={<PersonalAssistantLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<PremiumPersonalAgent />} />
            </Route>


            {/* 3. EXTENDED ECHO-SYSTEM ROLES (Standard Architecture) */}
            <Route path="/telecaller" element={<TelecallerLayout />}>
              <Route index element={<Navigate to="chat" replace />} />
              <Route path="chat" element={<TelecallerChat />} />
              <Route path="members/:status" element={<TelecallerMembers />} />
            </Route>

            <Route path="/customer-care" element={<CustomerCareLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<CustomerCareWorkspace />} />
              <Route path="queries" element={<ContactQueries />} />
              <Route path="members/:status" element={<CustomerCareMembers />} />
            </Route>

            <Route path="/data-entry" element={<DataEntryLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<DataEntryWorkspace />} />
              <Route path="bulk-add" element={<BulkMemberAdd />} />
              <Route path="manual-entry" element={<ManualEntry />} />
              <Route path="members/:status" element={<DataEntryMembers />} />
            </Route>

            <Route path="/personal-assistant" element={<PersonalAssistantLayout />}>
              <Route index element={<Navigate to="workspace" replace />} />
              <Route path="workspace" element={<AssistantWorkspace />} />
              <Route path="queries" element={<ContactQueries />} />
              <Route path="members/:status" element={<TelecallerMembers />} />
            </Route>

            {/* REDIRECT LEGACY SUPPORT LINKS TO NEW PROFESSIONAL DASHBOARDS */}
            <Route path="/dashboard/support/roles" element={<Navigate to="/telecaller" replace />} />
            <Route path="/support/chat" element={<Navigate to="/telecaller" replace />} />
            <Route path="/support/call" element={<Navigate to="/call-support" replace />} />
            <Route path="/support/live" element={<Navigate to="/live-chat" replace />} />
            <Route path="/support/care" element={<Navigate to="/customer-care" replace />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
