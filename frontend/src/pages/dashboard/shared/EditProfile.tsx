import React, { useState, useEffect } from 'react';
import styles from './EditProfile.module.css';
import {
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  X,
  Settings,
  GraduationCap,
  Layers,
  Shield,
  Clock,
  Lock,
  Upload
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { advocateService, authService, clientService } from '../../../services/api';
import { formatImageUrl } from '../../../utils/imageHelper';

interface Props {
  backToHome?: () => void;
  showToast?: (msg: string) => void;
}

const InputGroup = ({ label, name, type = 'text', options = [], disabled = false, width = '100%', value = '', onChange }: any) => (
  <div className={styles.inputGroup} style={{ width }}>
    <label>{label}</label>
    {type === 'select' ? (
      <select name={name} value={value} onChange={onChange} disabled={disabled}>
        <option value="">Select {label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} disabled={disabled} />
    )}
  </div>
);

const EditProfile: React.FC<Props> = ({ backToHome, showToast }) => {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeLayout, setActiveLayout] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.unique_id) return;
      setLoading(true);
      try {
        if (user.role === 'client') {
          // Note: getClientById handles unique_id as well in the backend
          const res = await clientService.getClientById(user.unique_id);
          if (res.data.success) setProfileData(res.data.client);
        } else {
          const res = await advocateService.getAdvocateById(user.unique_id);
          if (res.data.success) setProfileData(res.data.advocate);
        }
      } catch (err) {
        console.error('Profile fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (e: any) => {
    if (e.target.type === 'file') {
      setSelectedFile(e.target.files[0]);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!profileData?.unique_id || !user) {
      showToast?.('Profile not loaded properly. Please refresh.');
      return;
    }

    const targetId = profileData.unique_id;
    let payload: any = {};

    switch (activeLayout) {
      case 'Personal Details':
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          dob: formData.dob,
          mobile: formData.mobile,
          idProofType: formData.idProofType,
          email: formData.email
        };
        break;

      case 'Location Details':
        payload = {
          location: {
            state: formData.state,
            city: formData.city,
            district: formData.district,
            pincode: formData.pincode,
            officeAddress: formData.officeAddress,
            permanentAddress: formData.permanentAddress,
            country: 'India'
          }
        };
        break;

      case 'Professional Practice':
        payload = {
          practice: {
            court: formData.court,
            experience: formData.experience,
            specialization: formData.specialization,
            subSpecialization: formData.subSpecialization,
            barState: formData.barState,
            barAssociation: formData.barAssociation,
          }
        };
        break;

      case 'Education & Background':
        payload = {
          education: {
            degree: formData.degree,
            university: formData.university,
            college: formData.college,
            gradYear: formData.gradYear,
            enrollmentNo: formData.enrollmentNo,
          }
        };
        break;

      case 'Career & Bio':
        payload = {
          career: {
            bio: formData.bio,
            languages: formData.languages,
            skills: formData.skills,
          }
        };
        break;

      case 'Availability & Schedule':
        payload = {
          availability: {
            consultationFee: formData.consultationFee,
            days: formData.days?.split(',').map((s: string) => s.trim()).filter(Boolean),
            timeSlots: formData.timeSlots?.split(',').map((s: string) => s.trim()).filter(Boolean),
          }
        };
        break;

      case 'Legal Preferences':
        payload = {
          legalHelp: {
            category: formData.category,
            specialization: formData.specialization,
            mode: formData.mode,
            languages: formData.languages,
            issueDescription: formData.issueDescription
          }
        };
        break;

      case 'Change Password':
        if (formData.newPassword !== formData.confirmPassword) {
          showToast?.('Passwords do not match');
          return;
        }
        setLoading(true);
        try {
          const res = await authService.changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          });
          if (res.data.success) {
            showToast?.('Password changed successfully');
            setActiveLayout(null);
          }
        } catch (err: any) {
          showToast?.(err.response?.data?.error || 'Password change failed');
        } finally {
          setLoading(false);
        }
        return;

      default:
        return;
    }

    let dataToSend: any = payload;

    if (activeLayout === 'Personal Details' && selectedFile) {
      const fd = new FormData();
      Object.keys(payload).forEach(k => {
        if (typeof payload[k] === 'object' && payload[k] !== null) {
          fd.append(k, JSON.stringify(payload[k]));
        } else {
          fd.append(k, payload[k]);
        }
      });
      fd.append('profilePic', selectedFile);
      dataToSend = fd;
    }

    setLoading(true);
    try {
      let res: any;
      if (user.role === 'client') {
        res = await clientService.updateClient(targetId, dataToSend);
      } else {
        res = await advocateService.updateAdvocate(targetId, dataToSend);
      }

      if (res.data.success) {
        const updated = user.role === 'client' ? res.data.client : res.data.advocate;
        setProfileData(updated);

        // Update context
        const newName = updated.name || (updated.firstName ? `${updated.firstName} ${updated.lastName}` : '');
        if (newName) refreshUser({ name: newName });
        if (updated.profilePicPath) {
          refreshUser({ image_url: formatImageUrl(updated.profilePicPath) });
        }

        showToast?.('Profile updated successfully');
        setActiveLayout(null);
        setSelectedFile(null);
      }
    } catch (err: any) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'Personal Details', icon: <User />, text: 'Name, Contact, ID Proof' },
    { title: 'Location Details', icon: <MapPin />, text: 'Address, City, State' },
    ...(user?.role === 'client' ? [{ title: 'Legal Preferences', icon: <Briefcase />, text: 'Case Type, Language, Mode' }] : [
      { title: 'Education & Background', icon: <GraduationCap />, text: 'Degree, University, Graduation' },
      { title: 'Professional Practice', icon: <Briefcase />, text: 'Court, Specialization, License' },
      { title: 'Career & Bio', icon: <Layers />, text: 'Bio, Languages, Skills' },
      { title: 'Availability & Schedule', icon: <Clock size={16} />, text: 'Fee, Slots, Working Days' }
    ]),
    { title: 'Change Password', icon: <Lock size={16} />, text: 'Update login credentials' },
    { title: 'Account Settings', icon: <Settings />, text: 'Privacy & Notifications' }
  ];

  const openModal = (layout: string) => {
    const data = profileData || {};
    let initialData: any = {};

    if (layout === 'Personal Details') {
      initialData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        gender: data.gender || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        mobile: data.mobile || '',
        idProofType: data.idProofType || 'Aadhaar Card'
      };
    } else if (layout === 'Location Details') {
      const addr = data.location || data.address || {};
      initialData = {
        state: addr.state || '',
        city: addr.city || '',
        district: addr.district || '',
        pincode: addr.pincode || '',
        officeAddress: addr.officeAddress || addr.office || '',
        permanentAddress: addr.permanentAddress || addr.permanent || ''
      };
    } else if (layout === 'Professional Practice') {
      const practice = data.practice || {};
      initialData = {
        court: practice.court || '',
        experience: practice.experience || '',
        specialization: practice.specialization || '',
        subSpecialization: practice.subSpecialization || '',
        barState: practice.barState || '',
        barAssociation: practice.barAssociation || '',
      };
    } else if (layout === 'Education & Background') {
      const edu = data.education || {};
      initialData = {
        degree: edu.degree || '',
        university: edu.university || '',
        college: edu.college || '',
        gradYear: edu.gradYear || '',
        enrollmentNo: edu.enrollmentNo || '',
      };
    } else if (layout === 'Career & Bio') {
      const career = data.career || {};
      initialData = {
        bio: career.bio || '',
        languages: career.languages || '',
        skills: career.skills || '',
      };
    } else if (layout === 'Availability & Schedule') {
      const avail = data.availability || {};
      initialData = {
        consultationFee: avail.consultationFee || '',
        days: (avail.days || []).join(', '),
        timeSlots: (avail.timeSlots || []).join(', '),
      };
    } else if (layout === 'Legal Preferences') {
      initialData = {
        category: data.legalHelp?.category || '',
        specialization: data.legalHelp?.specialization || '',
        mode: data.legalHelp?.mode || '',
        languages: data.legalHelp?.languages || '',
        issueDescription: data.legalHelp?.issueDescription || ''
      };
    } else if (layout === 'Change Password') {
      initialData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }

    setFormData(initialData);
    setActiveLayout(layout);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {/* {backToHome && (
          <button onClick={backToHome} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
        )} */}
        <h2>Edit Profile</h2>
      </div>

      <div className={styles.profileHero}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className={styles.avatarWrapper}>
            <img
              src={formatImageUrl(profileData?.image_url || user?.image_url)}
              className={styles.avatar}
              alt="Profile"
            />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#fff' }}>{profileData?.name || (profileData?.firstName ? `${profileData.firstName} ${profileData.lastName}` : user?.name)}</h3>
            <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>{profileData?.unique_id || user?.unique_id}</p>
          </div>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        {menuItems.map((item) => (
          <div key={item.title} className={styles.sectionCard} onClick={() => openModal(item.title)}>
            <div className={styles.iconBox}>{item.icon}</div>
            <div className={styles.cardContent}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
            <div className={styles.editBtn}>Edit</div>
          </div>
        ))}
      </div>

      {activeLayout && (
        <div className={styles.modalOverlay} onClick={() => setActiveLayout(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{activeLayout}</h3>
              <button onClick={() => setActiveLayout(null)} className={styles.closeBtn}><X /></button>
            </div>

            <div className={styles.modalBody}>
              {activeLayout === 'Personal Details' && (
                <>
                  <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  {/* <InputGroup label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} /> */}
                  <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                  <InputGroup label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} />
                  <InputGroup label="Email" name="email" value={formData.email} onChange={handleInputChange} />
                  {/* <InputGroup label="ID Proof Type" name="idProofType" type="select" options={['Aadhaar Card', 'PAN Card', 'Voter ID']} value={formData.idProofType} onChange={handleInputChange} /> */}
                  <div className={styles.inputGroup}>
                    <label>Profile Picture</label>
                    <input type="file" onChange={handleInputChange} accept="image/*" />
                  </div>
                </>
              )}
              {activeLayout === 'Location Details' && (
                <>
                  <InputGroup label="State" name="state" value={formData.state} onChange={handleInputChange} />
                  <InputGroup label="City" name="city" value={formData.city} onChange={handleInputChange} />
                  <InputGroup label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} />
                  <InputGroup label="Office Address" name="officeAddress" value={formData.officeAddress} onChange={handleInputChange} />
                  <InputGroup label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} />
                </>
              )}
              {activeLayout === 'Legal Preferences' && (
                <>
                  <InputGroup label="Category" name="category" type="select" options={['Civil', 'Criminal', 'Corporate', 'Family', 'Property']} value={formData.category} onChange={handleInputChange} />
                  <InputGroup label="Specialization" name="specialization" type="select" options={['Divorce', 'Murder', 'IPR', 'Real Estate']} value={formData.specialization} onChange={handleInputChange} />
                  <InputGroup label="Consultation Mode" name="mode" type="select" options={['Video', 'Audio', 'Chat', 'In-Person']} value={formData.mode} onChange={handleInputChange} />
                  <InputGroup label="Preferred Languages" name="languages" value={formData.languages} onChange={handleInputChange} />
                  <div className={styles.inputGroup}>
                    <label>Brief Issue Description</label>
                    <textarea name="issueDescription" value={formData.issueDescription} onChange={handleInputChange} className={styles.textArea} />
                  </div>
                </>
              )}
              {activeLayout === 'Education & Background' && (
                <>
                  <InputGroup label="Degree" name="degree" value={formData.degree} onChange={handleInputChange} />
                  <InputGroup label="University" name="university" value={formData.university} onChange={handleInputChange} />
                  <InputGroup label="College" name="college" value={formData.college} onChange={handleInputChange} />
                  <InputGroup label="Graduation Year" name="gradYear" type="number" value={formData.gradYear} onChange={handleInputChange} />
                  <InputGroup label="Enrollment Number" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleInputChange} />
                </>
              )}
              {activeLayout === 'Professional Practice' && (
                <>
                  <InputGroup label="Court of Practice" name="court" value={formData.court} onChange={handleInputChange} />
                  <InputGroup label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={handleInputChange} />
                  <InputGroup label="Primary Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />
                  <InputGroup label="Sub Specialization" name="subSpecialization" value={formData.subSpecialization} onChange={handleInputChange} />
                  <InputGroup label="Bar Council State" name="barState" value={formData.barState} onChange={handleInputChange} />
                  <InputGroup label="Bar Association" name="barAssociation" value={formData.barAssociation} onChange={handleInputChange} />
                </>
              )}
              {activeLayout === 'Career & Bio' && (
                <>
                  <div className={styles.inputGroup}>
                    <label>Professional Biography</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} className={styles.textArea} />
                  </div>
                  <InputGroup label="Languages Spoken" name="languages" value={formData.languages} onChange={handleInputChange} />
                  <InputGroup label="Core Skills" name="skills" value={formData.skills} onChange={handleInputChange} />
                </>
              )}
              {activeLayout === 'Availability & Schedule' && (
                <>
                  {/* <InputGroup label="Consultation Fee (₹)" name="consultationFee" type="number" value={formData.consultationFee} onChange={handleInputChange} /> */}
                  <InputGroup label="Available Days (e.g. Mon, Tue, Fri)" name="days" value={formData.days} onChange={handleInputChange} />
                  <InputGroup label="Time Slots (e.g. 10AM-12PM)" name="timeSlots" value={formData.timeSlots} onChange={handleInputChange} />
                </>
              )}
              {activeLayout === 'Change Password' && (
                <>
                  <InputGroup label="Current Password" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} />
                  <InputGroup label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} />
                  <InputGroup label="Confirm New Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
                </>
              )}
              {(activeLayout === 'Account & Settings' || activeLayout === 'Account Settings') && (
                <div className={styles.settingsWrapper}>
                  {!formData.settingsView ? (
                    <div className={styles.settingsGrid}>
                      {[
                        { id: 'privacy', label: 'Privacy Settings', icon: <Shield size={18} /> },
                        { id: 'notifications', label: 'Notification Settings', icon: <Settings size={18} /> },
                        { id: 'messaging', label: 'Messaging Settings', icon: <Layers size={18} /> }
                      ].map(s => (
                        <div key={s.id} className={styles.settingItem} onClick={() => setFormData({ ...formData, settingsView: s.id })}>
                          <div className={styles.sIcon}>{s.icon}</div>
                          <span>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.settingsSubView}>
                      <button className={styles.backToGrid} onClick={() => setFormData({ ...formData, settingsView: null })}>
                        <ArrowLeft size={14} /> Back to Settings
                      </button>
                      <h4 style={{ color: '#facc15', marginBottom: '15px' }}>{formData.settingsView.toUpperCase()}</h4>

                      {formData.settingsView === 'privacy' && (
                        <div className={styles.toggleList}>
                          {[
                            { key: 'showProfile', label: 'Public Profile' },
                            { key: 'showContact', label: 'Show Contact Number' },
                            { key: 'showEmail', label: 'Show Email' }
                          ].map(t => (
                            <div key={t.key} className={styles.modalToggle}>
                              <span>{t.label}</span>
                              <input
                                type="checkbox"
                                checked={!!profileData?.privacySettings?.[t.key]}
                                onChange={async (e) => {
                                  const newPrivacy = { ...profileData.privacySettings, [t.key]: e.target.checked };
                                  try {
                                    const { settingsService } = await import('../../../services/api');
                                    await settingsService.updatePrivacy(newPrivacy);
                                    setProfileData({ ...profileData, privacySettings: newPrivacy });
                                    showToast?.('Settings updated');
                                  } catch (e) { showToast?.('Update failed'); }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {formData.settingsView === 'notifications' && (
                        <div className={styles.toggleList}>
                          {[
                            { key: 'email', label: 'Email Alerts' },
                            { key: 'push', label: 'Push Notifications' },
                            { key: 'sms', label: 'SMS Alerts' }
                          ].map(t => (
                            <div key={t.key} className={styles.modalToggle}>
                              <span>{t.label}</span>
                              <input
                                type="checkbox"
                                checked={!!profileData?.notificationSettings?.[t.key]}
                                onChange={async (e) => {
                                  const newNotifs = { ...profileData.notificationSettings, [t.key]: e.target.checked };
                                  try {
                                    const { settingsService } = await import('../../../services/api');
                                    await settingsService.updateNotifications(newNotifs);
                                    setProfileData({ ...profileData, notificationSettings: newNotifs });
                                    showToast?.('Settings updated');
                                  } catch (e) { showToast?.('Update failed'); }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {formData.settingsView === 'messaging' && (
                        <div className={styles.toggleList}>
                          {[
                            { key: 'allowDirectMessages', label: 'Allow Direct Messages' },
                            { key: 'readReceipts', label: 'Read Receipts' }
                          ].map(t => (
                            <div key={t.key} className={styles.modalToggle}>
                              <span>{t.label}</span>
                              <input
                                type="checkbox"
                                checked={!!profileData?.messageSettings?.[t.key]}
                                onChange={async (e) => {
                                  const newMsg = { ...profileData.messageSettings, [t.key]: e.target.checked };
                                  try {
                                    const { settingsService } = await import('../../../services/api');
                                    await settingsService.updateMessaging(newMsg);
                                    setProfileData({ ...profileData, messageSettings: newMsg });
                                    showToast?.('Settings updated');
                                  } catch (e) { showToast?.('Update failed'); }
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={() => setActiveLayout(null)}>
                {activeLayout === 'Account & Settings' ? 'Close' : 'Cancel'}
              </button>



              {activeLayout !== 'Account & Settings' && (
                <button className={styles.save} onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;