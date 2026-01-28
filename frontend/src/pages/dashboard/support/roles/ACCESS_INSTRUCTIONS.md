/**
 * ACCESS INSTRUCTIONS FOR ENTERPRISE SUPPORT DASHBOARDS
 * 
 * To activate these 4 new dashboards, follow these three simple steps:
 * 
 * 1. Import the components in your App.tsx:
 * 
 * import ChatSupport from './pages/dashboard/support/roles/ChatSupport';
 * import CallSupport from './pages/dashboard/support/roles/CallSupport';
 * import LiveChat from './pages/dashboard/support/roles/LiveChat';
 * import CustomerCare from './pages/dashboard/support/roles/CustomerCare';
 * 
 * 
 * 2. Add these routes into your <Routes> block (e.g., inside or after your existing /admin or /dashboard sections):
 * 
 * <Route path="/support/chat" element={<ChatSupport />} />
 * <Route path="/support/call" element={<CallSupport />} />
 * <Route path="/support/live" element={<LiveChat />} />
 * <Route path="/support/care" element={<CustomerCare />} />
 * 
 * 
 * 3. Access the Dashboards via these URLs in your browser:
 * 
 * Chat: http://localhost:5173/support/chat
 * Call: http://localhost:5173/support/call
 * Live: http://localhost:5173/support/live
 * Care: http://localhost:5173/support/care
 */

export const SUPPORT_ACCESS_LOG = "Strategic Support Hubs Initialized";
