import React, { useState, useEffect } from 'react';
import styles from './EditProfile.module.css';
import {
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Layers,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { advocateService, authService, clientService } from '../../../services/api';
import { LOCATION_DATA_RAW } from '../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../data/legalDomainData';

interface Props {
  backToHome?: () => void;
  showToast?: (msg: string) => void;
}

// Fixed: Moved InputGroup outside to prevent focus loss re-render issues
const InputGroup = ({ label, name, type = 'text', options = [], disabled = false, width = '100%', value = '', onChange }: any) => (
  <div className={styles.inputGroup} style={{ width }}>
    <label>{label}</label>
    {type === 'select' ? (
      <select name={name} value={value} onChange={onChange} disabled={disabled}>
        <option value="">Select {label}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : type === 'file' ? (
      <div className={styles.fileInputMock}>
        <span>{value?.name || "No file chosen"}</span>
        <button type="button">Choose File</button>
      </div>
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
  const [subSection, setSubSection] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (user?.role === 'client') {
          // Client Fetching
          if (user.id) {
            console.log(`[FRONTEND DEBUG] Fetching Client Profile for ID: ${user.id}`);
            const res = await clientService.getClientById(String(user.id));
            if (res.data.success) {
              setProfileData(res.data.client);
              console.log(`[FRONTEND DEBUG] Profile Fetched. UniqueID: ${res.data.client.unique_id}`);
            }
          }
        } else {
          // Advocate Fetching
          // Try fetching me first (more robust)
          const res = await advocateService.getMe();
          if (res.data.success) {
            setProfileData(res.data.advocate);
          }
        }
      } catch (err) {
        // Fallback to ID if me fails (e.g. not implemented or something)
        if (user?.role !== 'client' && user?.unique_id) {
          try {
            const res = await advocateService.getAdvocateById(user.unique_id);
            if (res.data.success) setProfileData(res.data.advocate);
          } catch (e) { console.error("ID fetch failed", e); }
        }
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const openModal = (layout: string) => {
    // Pre-fill form data based on layout and current profileData
    const data = profileData || {};
    let initialData = {};

    switch (layout) {
      case 'Personal Details':
        initialData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          gender: data.gender || '',
          dob: data.dob ? data.dob.split('T')[0] : '', // Format Date for input
          mobile: data.mobile || user?.phone || '',
          email: data.email || user?.email || '',
          idProofType: data.idProofType || 'Aadhaar Card',
          profilePic: null
        };
        break;
      case 'Educational Details':
        initialData = {
          degree: data.education?.degree || '',
          course: data.education?.course || '',
          state: data.education?.state || '',
          university: data.education?.university || '',
          college: data.education?.college || '',
          gradYear: data.education?.gradYear || '',
          enrollmentNo: data.education?.enrollmentNo || '',
          barState: data.practice?.barState || '',
          enrollmentYear: data.education?.enrollmentYear || '',
          certificate: null
        };
        break;
      case 'Location Details':
        initialData = {
          country: 'India',
          state: data.location?.state || data.address?.state || '',
          city: data.location?.city || data.address?.city || '',
          pincode: data.location?.pincode || data.address?.pincode || '',
          officeAddress: data.location?.officeAddress || data.address?.office || '',
          permanentAddress: data.location?.permanentAddress || data.address?.permanent || ''
        };
        break;
      case 'Legal Preferences':
        initialData = {
          category: data.legalHelp?.category || '',
          specialization: data.legalHelp?.specialization || '',
          mode: data.legalHelp?.mode || '',
          languages: data.legalHelp?.languages || '',
          issueDescription: data.legalHelp?.issueDescription || ''
        };
        break;
      case 'Practice Information':
        initialData = {
          court: data.practice?.court || '',
          specialization: data.practice?.specialization || '',
          subSpecialization: data.practice?.subSpecialization || '',
          experience: data.practice?.experience || '',
          barAssociation: data.practice?.barAssociation || '',
          license: null
        };
        break;
      case 'Career & Info':
        initialData = {
          firm: data.career?.firm || '',
          position: data.career?.position || '',
          workType: data.career?.workType || 'Full-time',
          languages: data.career?.languages || ''
        };
        break;
      case 'Account & Settings':
        initialData = {};
        break;
    }
    setFormData(initialData);
    setActiveLayout(layout);
    setSubSection(null); // Reset sub-section
  };

  const closeModal = () => {
    setActiveLayout(null);
    setSubSection(null);
    setFormData({});
    setPassData({ current: '', new: '', confirm: '' });
  };

  // NEW: State to hold selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Check if it's a file input
    if (e.target.type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    // Priority: Use fetched profile data ID first (most reliable), then fallback to auth user ID
    let targetId = profileData?.unique_id || user?.unique_id;

    console.log(`[FRONTEND DEBUG] Saving. Initial TargetID: ${targetId}`);

    // Emergency Recovery: If targetId is missing but we have a user.id (Mongo ID), try to fetch profile now
    if (!targetId && user?.id && user.role === 'client') {
      console.log(`[FRONTEND DEBUG] TargetID missing. Attempting emergency fetch using User ID: ${user.id}`);
      try {
        const res = await clientService.getClientById(String(user.id));
        if (res.data.success && res.data.client?.unique_id) {
          targetId = res.data.client.unique_id;
          setProfileData(res.data.client); // Save for future
          console.log(`[FRONTEND DEBUG] Emergency fetch successful. Recovered TargetID: ${targetId}`);
        }
      } catch (err) {
        console.error('[FRONTEND DEBUG] Emergency fetch failed:', err);
      }
    }

    if (!targetId) {
      const msg = `Error: User Unique ID missing. (User ID: ${user?.id || 'Missing'}, Role: ${user?.role || 'Missing'}). Please refresh.`;
      console.error(msg);
      if (showToast) showToast(msg);
      else alert(msg);
      return;
    }

    // Construct Payload based on Active Layout
    let payload: any = {};

    switch (activeLayout) {
      case 'Personal Details':
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          gender: formData.gender,
          dob: formData.dob,
          mobile: formData.mobile,
          idProofType: formData.idProofType // Ensure documentType is updated
        };
        break;
      case 'Educational Details':
        payload = {
          education: {
            degree: formData.degree,
            course: formData.course,
            state: formData.state,
            university: formData.university,
            college: formData.college,
            gradYear: formData.gradYear,
            enrollmentNo: formData.enrollmentNo,
            enrollmentYear: formData.enrollmentYear
          },
          practice: { barState: formData.barState }
        };
        break;
      case 'Location Details':
        payload = {
          location: {
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            officeAddress: formData.officeAddress,
            permanentAddress: formData.permanentAddress,
            country: formData.country || 'India'
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
          },
          // Some backend implementations expect direct fields too
          category: formData.category,
          specialization: formData.specialization
        };
        break;
      case 'Practice Information':
        payload = {
          practice: {
            court: formData.court,
            specialization: formData.specialization,
            subSpecialization: formData.subSpecialization,
            experience: formData.experience,
            barAssociation: formData.barAssociation
          }
        };
        break;
      case 'Career & Info':
        payload = {
          career: {
            firm: formData.firm,
            position: formData.position,
            workType: formData.workType,
            languages: formData.languages
          }
        };
        break;
      default:
        // Account settings handled separately
        return;
    }

    const isClient = user?.role === 'client';

    // Prepare final data to send
    let dataToSend: any = payload;

    // Use FormData if a file is selected (Only supported for Personal Details currently where profile pic is)
    if (activeLayout === 'Personal Details' && selectedFile) {
      const fd = new FormData();
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
          fd.append(key, payload[key]);
        }
      });
      fd.append('profilePic', selectedFile);
      dataToSend = fd;
      console.log('[FRONTEND DEBUG] Sending FormData with File:', selectedFile.name);
    } else {
      console.log('[FRONTEND DEBUG] Sending JSON payload');
    }

    try {
      let res: any;
      if (isClient) {
        console.log(`[FRONTEND DEBUG] Updating Client Profile: ${targetId}`);
        console.log(`[FRONTEND DEBUG] Client Payload:`, dataToSend);
        res = await clientService.updateClient(targetId, dataToSend);
        if (res.data.success) {
          setProfileData(res.data.client);
          console.log('[FRONTEND DEBUG] Client Update Success. Returned Name:', res.data.client.firstName, res.data.client.lastName);
        }
      } else {
        console.log(`[FRONTEND DEBUG] Updating Advocate Profile: ${targetId}`);
        res = await advocateService.updateAdvocate(targetId, dataToSend);
        if (res.data.success) {
          setProfileData(res.data.advocate);
        }
      }

      console.log(`[FRONTEND DEBUG] Update Response:`, res.data);

      if (res.data.success) {
        // Refresh Auth Context IMMEDIATELY if name changed
        if (activeLayout === 'Personal Details') {
          const updatedEntity = isClient ? res.data.client : res.data.advocate;

          let newName = '';
          if (updatedEntity.name) {
            newName = updatedEntity.name;
          } else if (updatedEntity.firstName) {
            newName = `${updatedEntity.firstName} ${updatedEntity.lastName}`.trim();
          }

          if (newName) {
            console.log(`[FRONTEND DEBUG] Triggering refreshUser with name: ${newName}`);
            refreshUser({ name: newName });
          }
          // Refresh Image URL in context if it changed
          if (updatedEntity.profilePicPath) {
            // Assuming backend returns relative path
            const newImg = `/${updatedEntity.profilePicPath.replace(/\\/g, '/')}`;
            refreshUser({ image_url: newImg });
          }
        }

        if (showToast) showToast('Profile updated!');
        setSelectedFile(null); // Reset file
        closeModal();
      }
    } catch (err: any) {
      console.error("Update failed", err);
      if (err.response) {
        console.error('[FRONTEND DEBUG] Error Response:', err.response.data);
      }
      if (showToast) showToast('Failed to update profile. Please try again.');
    }
  };

  const handlePassChange = async () => {
    if (passData.new !== passData.confirm) return showToast?.('Passwords do not match');
    if (passData.new.length < 6) return showToast?.('Password must be at least 6 characters');

    try {
      await authService.changePassword({ email: user?.email, currentPassword: passData.current, newPassword: passData.new });
      showToast?.('Password changed successfully');
      setSubSection(null);
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Failed to change password');
    }
  };

  const renderModalContent = () => {
    switch (activeLayout) {
      case 'Personal Details':
        return (
          <div className={styles.modalGrid}>
            <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            <InputGroup label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} />
            <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
            <InputGroup label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} />
            <InputGroup label="Email" name="email" value={formData.email} onChange={handleInputChange} disabled />
            <InputGroup label="Document / Proof Type" name="idProofType" type="select" options={['Aadhaar Card', 'PAN Card', 'Voter ID']} width="100%" value={formData.idProofType} onChange={handleInputChange} />
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Profile Picture</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#ccc' }}>{selectedFile ? selectedFile.name : (profileData?.profilePicPath ? 'Current Image Set' : 'No image set')}</span>
                <label style={{ marginLeft: 'auto', background: 'none', border: '1px solid #555', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  Choose File
                  <input type="file" onChange={handleInputChange} style={{ display: 'none' }} accept="image/*" />
                </label>
              </div>
            </div>
          </div>
        );
      case 'Educational Details':
        return (
          <div className={styles.modalGrid}>
            <InputGroup label="Graduate Degree" name="degree" type="select" options={['LL.B.', 'B.A. LL.B.', 'B.B.A. LL.B.', 'Ph.D.']} value={formData.degree} onChange={handleInputChange} />
            <InputGroup label="Degree Course" name="course" type="select" options={['3 Year Course', '5 Year Course']} value={formData.course} onChange={handleInputChange} />
            <InputGroup label="State" name="state" type="select" options={Object.keys(LOCATION_DATA_RAW)} value={formData.state} onChange={handleInputChange} />
            <InputGroup label="University Name" name="university" value={formData.university} onChange={handleInputChange} />
            <InputGroup label="College" name="college" width="100%" value={formData.college} onChange={handleInputChange} />
            <InputGroup label="Graduation Year" name="gradYear" type="number" value={formData.gradYear} onChange={handleInputChange} />
            <InputGroup label="Bar Council Enrolment Number" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleInputChange} />
            <InputGroup label="State Bar Council" name="barState" value={formData.barState} onChange={handleInputChange} />
            <InputGroup label="Enrollment Year" name="enrollmentYear" type="number" value={formData.enrollmentYear} onChange={handleInputChange} />
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Enrollment Certificate</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#ccc' }}>Current: enrollment.pdf</span>
                <button style={{ marginLeft: 'auto', background: 'none', border: '1px solid #555', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Choose File</button>
              </div>
            </div>
          </div>
        );
      case 'Location Details':
        return (
          <div className={styles.modalGrid}>
            <InputGroup label="Country" name="country" disabled value={formData.country} onChange={handleInputChange} />
            <InputGroup label="State" name="state" type="select" options={Object.keys(LOCATION_DATA_RAW)} value={formData.state} onChange={handleInputChange} />
            <InputGroup label="City / Town" name="city" value={formData.city} onChange={handleInputChange} />
            <InputGroup label="Pin Code" name="pincode" value={formData.pincode} onChange={handleInputChange} />
            <div style={{ gridColumn: '1 / -1' }}><InputGroup label="Current Office Address" name="officeAddress" value={formData.officeAddress} onChange={handleInputChange} /></div>
            <div style={{ gridColumn: '1 / -1' }}><InputGroup label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} /></div>
          </div>
        );
      case 'Legal Preferences':
        return (
          <div className={styles.modalGrid}>
            <InputGroup label="Case Category" name="category" type="select" options={['Civil', 'Criminal', 'Corporate', 'Family', 'Property']} width="100%" value={formData.category} onChange={handleInputChange} />
            <InputGroup label="Specialization Needed" name="specialization" type="select" options={Object.keys(LEGAL_DOMAINS)} width="100%" value={formData.specialization} onChange={handleInputChange} />
            <InputGroup label="Preferred Consultation Mode" name="mode" type="select" options={['Video', 'Audio', 'Chat', 'In-Person']} value={formData.mode} onChange={handleInputChange} />
            <InputGroup label="Preferred Languages" name="languages" value={formData.languages} onChange={handleInputChange} />
            <div style={{ gridColumn: '1 / -1' }}>
              <div className={styles.inputGroup}>
                <label>Issue Description</label>
                <input type="text" name="issueDescription" value={formData.issueDescription || ''} onChange={handleInputChange} style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        );
      case 'Practice Information':
        return (
          <div className={styles.modalGrid}>
            <InputGroup label="Court of Practice" name="court" type="select" options={['Supreme Court', 'High Court', 'District Court']} width="100%" value={formData.court} onChange={handleInputChange} />
            <InputGroup label="Specialization/Department" name="specialization" type="select" options={Object.keys(LEGAL_DOMAINS)} width="100%" value={formData.specialization} onChange={handleInputChange} />
            <InputGroup label="Sub-Department" name="subSpecialization" type="select" options={formData.specialization ? LEGAL_DOMAINS[formData.specialization] : []} width="100%" value={formData.subSpecialization} onChange={handleInputChange} />
            <InputGroup label="Years of Experience" name="experience" value={formData.experience} onChange={handleInputChange} />
            <div style={{ gridColumn: '1 / -1' }}><InputGroup label="Bar Association Name (If any)" name="barAssociation" value={formData.barAssociation} onChange={handleInputChange} /></div>
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Practice License Upload</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#ccc' }}>Current: license.pdf</span>
                <button style={{ marginLeft: 'auto', background: 'none', border: '1px solid #555', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Choose File</button>
              </div>
            </div>
          </div>
        );
      case 'Career & Info':
        return (
          <div className={styles.modalGrid}>
            <InputGroup label="Current Firm / Organization" name="firm" value={formData.firm} onChange={handleInputChange} />
            <InputGroup label="Position / Designation" name="position" value={formData.position} onChange={handleInputChange} />
            <InputGroup label="Work Type" name="workType" type="select" options={['Full-time', 'Part-time', 'Contract', 'Freelance']} value={formData.workType} onChange={handleInputChange} />
            <InputGroup label="Languages Known" name="languages" value={formData.languages} onChange={handleInputChange} />
          </div>
        );
      case 'Account & Settings':
        if (subSection === 'change-password') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setSubSection(null)} style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                <ArrowLeft size={16} /> Back to Main Settings
              </button>
              <h3 style={{ margin: '0', color: '#fff' }}>Change Password</h3>

              <div className={styles.inputGroup}>
                <label>Current Password</label>
                <input type="password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }} placeholder="Enter current password" />
              </div>
              <div className={styles.inputGroup}>
                <label>New Password</label>
                <input type="password" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }} placeholder="Enter new password (min 6 chars)" />
              </div>
              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input type="password" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }} placeholder="Confirm new password" />
              </div>
              <button className={styles.save} onClick={handlePassChange}>Update Password</button>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <h4 style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Manage Account</h4>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => { if (showToast) showToast('Privacy settings not yet available.') }}>
                  <span style={{ color: '#fff', fontSize: '14px' }}>Privacy Settings</span>
                </div>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => setSubSection('change-password')}>
                  <span style={{ color: '#fff', fontSize: '14px' }}>Change Password</span>
                </div>
                <div style={{ padding: '15px 20px', cursor: 'pointer' }} onClick={() => { if (showToast) showToast('Feature coming soon: Hide/Delete Profile') }}>
                  <span style={{ color: '#fb7185', fontSize: '14px' }}>Hide/Delete Profile</span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Notifications</h4>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '14px' }}>Notification Settings</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>On</span>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const getMenuItems = () => {
    const common = [
      { title: 'Personal Details', icon: <User size={20} />, text: 'Name, Contact, ID Proof' },
      { title: 'Location Details', icon: <MapPin size={20} />, text: 'Address, City, State' },
      { title: 'Account & Settings', icon: <Settings size={20} />, text: 'Privacy, Password, Notifications' },
    ];

    if (user?.role === 'client') {
      return [
        common[0], // Personal
        common[1], // Location
        { title: 'Legal Preferences', icon: <Briefcase size={20} />, text: 'Case Type, Language, Mode' },
        common[2]  // Account
      ];
    }

    return [
      { title: 'Personal Details', icon: <User size={20} />, text: 'Name, Contact, ID Proof' },
      { title: 'Educational Details', icon: <GraduationCap size={20} />, text: 'Degrees, College, Enrollment' },
      { title: 'Location Details', icon: <MapPin size={20} />, text: 'Address, City, State' },
      { title: 'Practice Information', icon: <Briefcase size={20} />, text: 'Court, Specialization, Bar' },
      { title: 'Career & Info', icon: <Layers size={20} />, text: 'Firm, Position, Languages' },
      { title: 'Account & Settings', icon: <Settings size={20} />, text: 'Privacy, Password, Notifications' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {backToHome && <button onClick={backToHome} className={styles.backBtn}><ArrowLeft size={20} /></button>}
        <h2>Edit Profile</h2>
      </div>

      <div className={styles.profileHero}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className={styles.avatarWrapper}>
            <img src={profileData?.image_url || profileData?.img || user?.image_url || "https://i.pravatar.cc/150?img=12"} alt="" className={styles.avatar} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#fff' }}>
              {profileData?.name ||
                (profileData?.firstName ? `${profileData.firstName} ${profileData.lastName}` : null) ||
                user?.name ||
                'Loading...'}
            </h3>
            <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>
              {profileData?.unique_id || user?.unique_id || 'ID: Loading...'}
            </p>
          </div>
        </div>
        <div className={styles.completeness}>
          <span style={{ fontSize: '12px', color: '#facc15' }}>85% Complete</span>
          <div className={styles.bar}><div className={styles.fill} style={{ width: '85%' }}></div></div>
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
            <div className={styles.modalHeader}>
              <h3>{activeLayout}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              {renderModalContent()}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={closeModal} disabled={loading}>Cancel</button>
              <button
                className={styles.save}
                onClick={handleSave}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
