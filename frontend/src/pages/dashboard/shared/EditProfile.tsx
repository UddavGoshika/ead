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
  Layers
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
          idProofType: formData.idProofType
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
            country: 'India'
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

      default:
        return;
    }

    let dataToSend: any = payload;

    if (activeLayout === 'Personal Details' && selectedFile) {
      const fd = new FormData();
      Object.keys(payload).forEach(k => fd.append(k, payload[k]));
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
    } catch (err) {
      console.error(err);
      showToast?.('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'Personal Details', icon: <User />, text: 'Name, Contact, ID Proof' },
    { title: 'Location Details', icon: <MapPin />, text: 'Address, City, State' },
    ...(user?.role === 'client' ? [{ title: 'Legal Preferences', icon: <Briefcase />, text: 'Case Type, Language, Mode' }] : []),
    { title: 'Account & Settings', icon: <Settings />, text: 'Privacy, Password, Notifications' }
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
      initialData = {
        state: data.location?.state || data.address?.state || '',
        city: data.location?.city || data.address?.city || '',
        pincode: data.location?.pincode || data.address?.pincode || '',
        officeAddress: data.location?.officeAddress || data.address?.office || '',
        permanentAddress: data.location?.permanentAddress || data.address?.permanent || ''
      };
    } else if (layout === 'Legal Preferences') {
      initialData = {
        category: data.legalHelp?.category || '',
        specialization: data.legalHelp?.specialization || '',
        mode: data.legalHelp?.mode || '',
        languages: data.legalHelp?.languages || '',
        issueDescription: data.legalHelp?.issueDescription || ''
      };
    }

    setFormData(initialData);
    setActiveLayout(layout);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {backToHome && (
          <button onClick={backToHome} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
        )}
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
                  <InputGroup label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} />
                  <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                  <InputGroup label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} />
                  <InputGroup label="ID Proof Type" name="idProofType" type="select" options={['Aadhaar Card', 'PAN Card', 'Voter ID']} value={formData.idProofType} onChange={handleInputChange} />
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
                </>
              )}
              {activeLayout === 'Account & Settings' && (
                <p style={{ color: '#fff' }}>Account settings coming soon...</p>
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={() => setActiveLayout(null)}>Cancel</button>
              <button className={styles.save} onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;