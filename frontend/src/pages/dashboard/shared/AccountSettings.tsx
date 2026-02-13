// import React, { useState } from 'react';
// import styles from './DashboardSection.module.css';
// import { Lock, Bell, Eye, Trash2 } from 'lucide-react';

// interface Props {
//     backToHome?: () => void;
//     showToast?: (msg: string) => void;
// }

// const AccountSettings: React.FC<Props> = ({ backToHome, showToast }) => {
//     const [loading, setLoading] = useState(false);
//     const [notifications, setNotifications] = useState({
//         email: true,
//         browser: false,
//         sms: true
//     });

//     const handleUpdate = () => {
//         setLoading(true);
//         setTimeout(() => {
//             setLoading(false);
//             if (showToast) showToast('Settings updated successfully!');
//         }, 1200);
//     };

//     return (
//         <div className={styles.sectionContainer}>
//             <div className={styles.header}>
//                 <h1>Account & Settings</h1>
//                 <p>Manage your account security, privacy, and notifications.</p>
//             </div>

//             <div className={styles.grid}>
//                 {/* Security Card */}
//                 <div className={styles.card}>
//                     <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <Lock size={20} color="#facc15" /> Change Password
//                     </h3>
//                     <div className={styles.formGroup}>
//                         <label>Current Password</label>
//                         <input className={styles.input} type="password" placeholder="••••••••" />
//                     </div>
//                     <div className={styles.formGroup}>
//                         <label>New Password</label>
//                         <input className={styles.input} type="password" placeholder="••••••••" />
//                     </div>
//                     <button className={styles.saveBtn} style={{ width: '100%' }} onClick={handleUpdate} disabled={loading}>
//                         {loading ? 'Updating...' : 'Update Password'}
//                     </button>
//                 </div>

//                 {/* Notifications Card */}
//                 <div className={styles.card}>
//                     <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <Bell size={20} color="#facc15" /> Notification Preferences
//                     </h3>
//                     {[
//                         { id: 'email', label: 'Email Notifications' },
//                         { id: 'browser', label: 'Push Notifications' },
//                         { id: 'sms', label: 'SMS Alerts' }
//                     ].map(item => (
//                         <div key={item.id} className={styles.itemCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//                             <span>{item.label}</span>
//                             <input
//                                 type="checkbox"
//                                 checked={(notifications as any)[item.id]}
//                                 onChange={() => setNotifications({ ...notifications, [item.id]: !(notifications as any)[item.id] })}
//                                 style={{ width: '20px', height: '20px', accentColor: '#facc15' }}
//                             />
//                         </div>
//                     ))}
//                 </div>

//                 {/* Privacy Card */}
//                 <div className={styles.card}>
//                     <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <Eye size={20} color="#facc15" /> Privacy Settings
//                     </h3>
//                     <div className={styles.itemCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//                         <div>
//                             <div style={{ fontWeight: '600' }}>Public Profile</div>
//                             <div style={{ fontSize: '12px', color: '#94a3b8' }}>Allow users to search for you.</div>
//                         </div>
//                         <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#facc15' }} />
//                     </div>
//                 </div>

//                 {/* Danger Zone */}
//                 <div className={styles.card} style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
//                     <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
//                         <Trash2 size={20} /> Deactivate Account
//                     </h3>
//                     <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Once you deactivate, your profile will be hidden.</p>
//                     <button className={styles.cancelBtn} style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>Deactivate Now</button>
//                 </div>
//             </div>

//             {backToHome && (
//                 <div className={styles.actionRow}>
//                     <button className={styles.cancelBtn} onClick={backToHome}>Back to Home</button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AccountSettings;

import React, { useState, useEffect } from 'react';
import styles from './AccountSettings.module.css';
import axios from 'axios';
import QRCode from 'react-qr-code';
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  Zap,
  CreditCard,
  Smartphone,
  Building2,
  Receipt,
  Check
} from 'lucide-react';
import { PaymentManager } from '../../../services/payment/PaymentManager';
import type { PaymentGateway, PaymentGatewayConfig } from '../../../types/payment';
import { useAuth } from '../../../context/AuthContext';

type Page =
  | 'account-settings'
  | 'editname'
  | 'privacy'
  | 'password'
  | 'delete'
  | 'messages'
  | 'notifications'
  | 'join'
  | 'find-clients'
  | 'pricing'
  | 'find-advocates'
  | 'resources'
  | 'how-it-works';

interface Props {
  backToHome?: () => void;
  showToast?: (msg: string) => void;
}

const AccountSettings: React.FC<Props> = ({ backToHome, showToast }) => {
  const [page, setPage] = useState<Page>('account-settings');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | ''>('');
  const [enabledGateways, setEnabledGateways] = useState<PaymentGatewayConfig[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiUrl, setUpiUrl] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // Settings State
  const [privacy, setPrivacy] = useState<any>({ showProfile: true, showContact: false, showEmail: false });
  const [notifications, setNotifications] = useState<any>({ email: true, push: true, sms: false, activityAlerts: true });
  const [messaging, setMessaging] = useState<any>({ allowDirectMessages: true, readReceipts: true, filterSpam: true });
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const loadData = async () => {
      // Load Payment Gateways
      const gateways = await PaymentManager.getInstance().getEnabledGateways();
      setEnabledGateways(gateways);

      // Load User Settings
      if (user) {
        try {
          const { settingsService } = await import('../../../services/api');
          const res = await settingsService.getSettings();
          if (res.data.success) {
            setPrivacy(res.data.privacy || { showProfile: true, showContact: false, showEmail: false });
            setNotifications((res.data as any).notificationSettings || { email: true, push: true, sms: false, activityAlerts: true });
            setMessaging((res.data as any).messageSettings || { allowDirectMessages: true, readReceipts: true, filterSpam: true });
          }
        } catch (e) { console.error("Failed to load settings", e); }
      }
    };
    loadData();
  }, [user]);

  // Handlers
  const handlePassChange = async () => {
    if (passData.new !== passData.confirm) return showToast?.('Passwords do not match');
    if (passData.new.length < 6) return showToast?.('Password must be 6+ chars');
    setIsProcessing(true);
    try {
      const { authService } = await import('../../../services/api');
      await authService.changePassword({ email: user?.email, currentPassword: passData.current, newPassword: passData.new });
      showToast?.('Password updated successfully!');
      setPassData({ current: '', new: '', confirm: '' });
      setPage('account-settings');
    } catch (err: any) {
      showToast?.(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrivacyToggle = async (key: string, val: boolean) => {
    const newPrivacy = { ...privacy, [key]: val };
    setPrivacy(newPrivacy);
    try {
      const { settingsService } = await import('../../../services/api');
      await settingsService.updatePrivacy(newPrivacy);
      showToast?.('Privacy settings saved');
    } catch (err) {
      showToast?.('Failed to save privacy settings');
      setPrivacy(privacy);
    }
  };

  const handleNotificationToggle = async (key: string, val: boolean) => {
    const newNotifs = { ...notifications, [key]: val };
    setNotifications(newNotifs);
    try {
      const { settingsService } = await import('../../../services/api');
      await settingsService.updateNotifications(newNotifs);
      showToast?.('Notification settings saved');
    } catch (err) {
      showToast?.('Failed to save notification settings');
      setNotifications(notifications);
    }
  };

  const handleMessagingToggle = async (key: string, val: boolean) => {
    const newMsg = { ...messaging, [key]: val };
    setMessaging(newMsg);
    try {
      const { settingsService } = await import('../../../services/api');
      await settingsService.updateMessaging(newMsg);
      showToast?.('Messaging settings saved');
    } catch (err) {
      showToast?.('Failed to save messaging settings');
      setMessaging(messaging);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure? Your account will be hidden from everyone.")) return;
    try {
      const { settingsService } = await import('../../../services/api');
      await settingsService.deactivateAccount();
      showToast?.('Account deactivated.');
      logout();
    } catch (err) {
      showToast?.('Failed to deactivate account');
    }
  };

  const SUBSCRIPTION_PLANS = [
    {
      id: 'silver',
      name: 'Pro Silver',
      price: 999,
      features: ['Priority Support', 'Basic Analytics', '5 Case Listings'],
      color: '#94a3b8'
    },
    {
      id: 'gold',
      name: 'Pro Gold',
      price: 1999,
      features: ['24/7 Support', 'Advanced Analytics', '15 Case Listings', 'Profile Badge'],
      color: '#facc15'
    },
    {
      id: 'platinum',
      name: 'Pro Platinum',
      price: 4999,
      features: ['Direct Mentorship', 'Enterprise Analytics', 'Unlimited Listings', 'VIP Profile Highlight'],
      color: '#e2e8f0'
    }
  ];

  const BackHeader = ({ title }: { title: string }) => (
    <div className={styles.header}>
      <ArrowLeft onClick={() => setPage('account-settings')} style={{ cursor: 'pointer' }} />
      <h1>{title}</h1>
    </div>
  );

  /* ================= MAIN PAGE ================= */
  if (page === 'account-settings') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <ArrowLeft onClick={backToHome} style={{ cursor: 'pointer' }} />
          <h1>Account & Settings</h1>
        </div>

        <Section title="Manage Account">
          <Item label="Privacy Settings" onClick={() => setPage('privacy')} />
          <Item label="Change Password" onClick={() => setPage('password')} />
          <Item label="Hide / Delete Profile" onClick={() => setPage('delete')} />
        </Section>

        <Section title="Manage Messages">
          <Item label="Messages Settings" onClick={() => setPage('messages')} />
        </Section>

        <Section title="Notifications">
          <Item label="Notification Settings" onClick={() => setPage('notifications')} />
        </Section>

        {user?.role === 'advocate' && (
          <Section title="For Advocates">
            <Item label="Join Platform" onClick={() => setPage('join')} />
            <Item label="Find Clients" onClick={() => setPage('find-clients')} />
            <Item label="Pricing" onClick={() => setPage('pricing')} />
          </Section>
        )}

        {user?.role === 'client' && (
          <Section title="For Clients">
            <Item label="Find Advocates" onClick={() => setPage('find-advocates')} />
            <Item label="Legal Resources" onClick={() => setPage('resources')} />
            <Item label="How It Works" onClick={() => setPage('how-it-works')} />
          </Section>
        )}

        <button className={styles.logout} onClick={() => logout()}>
          <LogOut /> Logout
        </button>
      </div>
    );
  }

  /* ================= EDIT PERSONAL DETAILS ================= */
  if (page === 'editname') {
    return (
      <div className={styles.page}>
        <BackHeader title="Personal Details" />
        <div className={styles.cardGrid}>
          {['First Name', 'Last Name', 'Gender', 'Date of Birth', 'Mobile Number', 'Email'].map((label) => (
            <div key={label} className={styles.formGroup}>
              <label>{label}</label>
              <input placeholder={label} disabled />
            </div>
          ))}
        </div>
        <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '13px' }}>To edit details, please use the Edit Profile page.</p>
      </div>
    );
  }

  /* ================= PRIVACY ================= */
  if (page === 'privacy') {
    return (
      <div className={styles.page}>
        <BackHeader title="Privacy Settings" />
        <Toggle
          label="Show my profile to all members"
          checked={privacy.showProfile}
          onChange={(val: boolean) => handlePrivacyToggle('showProfile', val)}
        />
        <Toggle
          label="Show my contact number"
          checked={privacy.showContact}
          onChange={(val: boolean) => handlePrivacyToggle('showContact', val)}
        />
        <Toggle
          label="Show my email address"
          checked={privacy.showEmail}
          onChange={(val: boolean) => handlePrivacyToggle('showEmail', val)}
        />
        <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>Changes are saved automatically.</div>
      </div>
    );
  }

  /* ================= MESSAGES ================= */
  if (page === 'messages') {
    return (
      <div className={styles.page}>
        <BackHeader title="Messaging Settings" />
        <Toggle
          label="Allow direct messages from anyone"
          checked={messaging.allowDirectMessages}
          onChange={(val: boolean) => handleMessagingToggle('allowDirectMessages', val)}
        />
        <Toggle
          label="Show read receipts"
          checked={messaging.readReceipts}
          onChange={(val: boolean) => handleMessagingToggle('readReceipts', val)}
        />
        <Toggle
          label="Automatically filter spam / suspicious messages"
          checked={messaging.filterSpam}
          onChange={(val: boolean) => handleMessagingToggle('filterSpam', val)}
        />
        <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>These settings help you control who can contact you.</div>
      </div>
    );
  }

  /* ================= NOTIFICATIONS ================= */
  if (page === 'notifications') {
    return (
      <div className={styles.page}>
        <BackHeader title="Notification Settings" />
        <Toggle
          label="Email Notifications"
          checked={notifications.email}
          onChange={(val: boolean) => handleNotificationToggle('email', val)}
        />
        <Toggle
          label="Push Notifications"
          checked={notifications.push}
          onChange={(val: boolean) => handleNotificationToggle('push', val)}
        />
        <Toggle
          label="SMS Notifications"
          checked={notifications.sms}
          onChange={(val: boolean) => handleNotificationToggle('sms', val)}
        />
        <Toggle
          label="Real-time Activity Alerts"
          checked={notifications.activityAlerts}
          onChange={(val: boolean) => handleNotificationToggle('activityAlerts', val)}
        />
        <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>Stay updated with your case progress and new messages.</div>
      </div>
    );
  }

  /* ================= PASSWORD ================= */
  if (page === 'password') {
    return (
      <div className={styles.page}>
        <BackHeader title="Change Password" />
        <div className={styles.formGroup}>
          <label>Current Password</label>
          <input type="password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} />
        </div>
        <div className={styles.formGroup}>
          <label>New Password</label>
          <input type="password" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} />
        </div>
        <div className={styles.formGroup}>
          <label>Confirm Password</label>
          <input type="password" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} />
        </div>

        <div className={styles.actions}>
          <button onClick={() => setPage('account-settings')}>Cancel</button>
          <button className={styles.primary} onClick={handlePassChange} disabled={isProcessing}>
            {isProcessing ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    );
  }

  /* ================= DELETE ================= */
  if (page === 'delete') {
    return (
      <div className={styles.page}>
        <BackHeader title="Hide / Delete Profile" />

        <DangerCard
          title="Deactivate Account"
          text="Temporarily hide your profile from search results."
          button="Deactivate Now"
          onClick={handleDeactivate}
        />
        <DangerCard
          title="Delete Profile"
          text="This action is irreversible. All data will be lost."
          danger
          button="Delete Permanently"
          onClick={() => { if (window.confirm("CRITICAL: Are you absolutely sure?")) handleDeactivate(); }} // Reusing logic for now
        />
      </div>
    );
  }

  /* ================= RESOURCES ================= */
  if (page === 'resources') {
    return (
      <div className={styles.page}>
        <BackHeader title="Legal Resources" />
        <div style={{ padding: '20px' }}>
          <Section title="Quick Guides">
            <Item label="How to File a Case" onClick={() => window.open('https://filing.ecourts.gov.in/', '_blank')} />
            <Item label="Understanding IPC Sections" />
            <Item label="Legal Documentation Checklist" />
          </Section>
          <Section title="External Links">
            <Item label="eCourts Services" onClick={() => window.open('https://services.ecourts.gov.in/', '_blank')} />
            <Item label="Bar Council of India" onClick={() => window.open('http://www.barcouncilofindia.org/', '_blank')} />
          </Section>
        </div>
      </div>
    );
  }

  /* ================= HOW IT WORKS ================= */
  if (page === 'how-it-works') {
    return (
      <div className={styles.page}>
        <BackHeader title="How It Works" />
        <div style={{ padding: '20px', color: '#e2e8f0', lineHeight: '1.6' }}>
          <h3>1. Search for Experts</h3>
          <p>Browse through thousands of verified advocates based on your specific legal needs and location.</p>

          <h3>2. Send Interest</h3>
          <p>Click 'Send Interest' to let an advocate know you'd like to consult. They will accept or decline based on availability.</p>

          <h3>3. Secure Consultation</h3>
          <p>Once accepted, you can chat, call, or video consult in a private, encrypted environment.</p>

          <h3>4. Document Management</h3>
          <p>Use our portal to safely share and manage legal documents required for your case.</p>
        </div>
      </div>
    );
  }

  /* ================= PRICING ================= */
  if (page === 'pricing') {
    return (
      <div className={styles.page}>
        <BackHeader title="Subscription Plans" />

        <div className={styles.pricingGrid}>
          {SUBSCRIPTION_PLANS.map(plan => (
            <div key={plan.id} className={styles.priceCard}>
              <div className={styles.planHeader} style={{ borderColor: plan.color }}>
                <Zap size={24} color={plan.color} />
                <h3>{plan.name}</h3>
                <div className={styles.priceTag}>
                  <span className={styles.currency}>₹</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.period}>/mo</span>
                </div>
              </div>
              <ul className={styles.featureList}>
                {plan.features.map((f, i) => (
                  <li key={i}><Check size={14} color="#10b981" /> {f}</li>
                ))}
              </ul>

              <div className={styles.gatewaySelection}>
                <label>Select Payment Gateway</label>
                <div className={styles.gwGrid}>
                  {enabledGateways.map(gw => (
                    <button
                      key={gw.gateway}
                      className={`${styles.gwBtn} ${selectedGateway === gw.gateway ? styles.activeGw : ''}`}
                      onClick={() => setSelectedGateway(gw.gateway)}
                    >
                      {gw.gateway === 'razorpay' && <CreditCard size={14} />}
                      {gw.gateway === 'paytm' && <Smartphone size={14} />}
                      {gw.gateway === 'stripe' && <Building2 size={14} />}
                      {gw.gateway === 'invoice' && <Receipt size={14} />}
                      {gw.gateway}
                    </button>
                  ))}
                </div>
              </div>

              {upiUrl && selectedGateway === 'upi' ? (
                <div className={styles.qrSection}>
                  <div className={styles.qrBox}>
                    <QRCode value={upiUrl} size={140} bgColor="#fff" fgColor="#000" />
                  </div>
                  <p className={styles.qrInstruction}>Scan to pay ₹{plan.price}</p>
                  <button
                    className={styles.verifyBtn}
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        const token = localStorage.getItem('token');
                        const response = await axios.post('/api/payments/verify', {
                          orderId: currentOrderId,
                          paymentId: 'upi_' + Math.random().toString(36).substring(7),
                          gateway: 'upi'
                        }, {
                          headers: { Authorization: token || '' }
                        });

                        if (response.data.success) {
                          alert(`Subscribed to ${plan.name} successfully!`);
                          setUpiUrl(null);
                          setPage('account-settings');
                          window.location.reload();
                        } else {
                          alert("Verification failed: " + response.data.message);
                        }
                      } catch (err: any) {
                        alert("Error: " + err.message);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                  >
                    {isProcessing ? 'Verifying...' : 'Verify Payment'}
                  </button>
                  <button className={styles.cancelLink} onClick={() => setUpiUrl(null)}>Cancel</button>
                </div>
              ) : (
                <button
                  className={styles.subscribeBtn}
                  disabled={!selectedGateway || isProcessing}
                  onClick={async () => {
                    if (!selectedGateway) return;

                    if (user?.status === 'Pending' || user?.status === 'Reverify') {
                      alert("You are under verification, can't checkout");
                      return;
                    }

                    setIsProcessing(true);
                    try {
                      const result = await PaymentManager.getInstance().processPayment(
                        selectedGateway,
                        `pro_${plan.id}`, // consistent with backend mapping
                        plan.price,
                        'INR',
                        {
                          planId: plan.id,
                          userName: user?.name,
                          userEmail: user?.email,
                          description: `Subscription: ${plan.name}`
                        }
                      );

                      if (result.success) {
                        if (selectedGateway === 'upi' && result.metadata?.upiUrl) {
                          setUpiUrl(result.metadata.upiUrl);
                          setCurrentOrderId(result.orderId);
                        } else {
                          alert(`Subscribed to ${plan.name} successfully!`);
                          setPage('account-settings');
                          window.location.reload();
                        }
                      } else {
                        if (selectedGateway === 'cashfree') {
                          return; // cashfree payment is handled in redirect
                        }
                        alert(`Payment failed: ${result.error}`);
                      }
                    } catch (error: any) {
                      alert(`Error: ${error.message}`);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                >
                  {isProcessing ? 'Processing...' : `Get ${plan.name}`}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback for join, find-clients, find-advocates (redirect to relevant dashboard pages)
  if (['join', 'find-clients', 'find-advocates'].includes(page)) {
    if (backToHome) backToHome();
    return null;
  }

  return (
    <div className={styles.page}>
      <BackHeader title={page.replace('-', ' ')} />
      <div className={styles.placeholder}>
        {page.replace('-', ' ')} Page Content
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Section = ({ title, children }: any) => (
  <>
    <h3 className={styles.sectionTitle}>{title}</h3>
    <div className={styles.list}>{children}</div>
  </>
);

const Item = ({ label, onClick }: any) => (
  <div className={styles.item} onClick={onClick}>
    <span>{label}</span>
    <ChevronRight />
  </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
  <div className={styles.toggleRow}>
    <span>{label}</span>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange && onChange(e.target.checked)}
    />
  </div>
);

const Input = ({ label, type = 'text', value, onChange }: any) => (
  <div className={styles.formGroup}>
    <label>{label}</label>
    <input type={type} value={value} onChange={onChange} />
  </div>
);

const Actions = ({ primary = 'Save Changes', onPrimary, onCancel }: any) => (
  <div className={styles.actions}>
    <button onClick={onCancel}>Cancel</button>
    <button className={styles.primary} onClick={onPrimary}>{primary}</button>
  </div>
);

const DangerCard = ({ title, text, button, danger, onClick }: any) => (
  <div className={`${styles.dangerCard} ${danger ? styles.delete : ''}`}>
    <h3>{title}</h3>
    <p>{text}</p>
    <button onClick={onClick}>{button}</button>
  </div>
);

export default AccountSettings;

