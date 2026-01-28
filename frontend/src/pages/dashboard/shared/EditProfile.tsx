import React, { useState } from 'react';
import styles from './EditProfile.module.css';
import {
  ArrowLeft,
  Pencil,
  User,
  Briefcase,
  MapPin,
  BookOpen,
  GraduationCap,
  History,
  Languages,
  CheckCircle,
  Camera
} from 'lucide-react';

interface Props {
  backToHome?: () => void;
  showToast?: (msg: string) => void;
}

const EditProfile: React.FC<Props> = ({ backToHome }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const sections = [
    { title: 'Personal Information', icon: <User size={20} />, description: 'Name, Contact, Gender, etc.' },
    { title: 'Practice Areas', icon: <Briefcase size={20} />, description: 'Criminal, Civil, Corporate, etc.' },
    { title: 'Courts & Jurisdictions', icon: <LandmarkIcon size={20} />, description: 'Supreme Court, High Court, etc.' },
    { title: 'Bar Council Details', icon: <ShieldIcon size={20} />, description: 'Registration Number, ID Proof' },
    { title: 'Education & Training', icon: <GraduationCap size={20} />, description: 'Degrees, Certifications' },
    { title: 'Professional Experience', icon: <History size={20} />, description: 'Years of practice, Past cases' },
    { title: 'Location & Office', icon: <MapPin size={20} />, description: 'Address, Availability' },
    { title: 'Languages', icon: <Languages size={20} />, description: 'English, Hindi, etc.' },
    { title: 'Verification Status', icon: <CheckCircle size={20} />, description: 'Manage blue tick verification' },
  ];

  const openModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {backToHome && <button onClick={backToHome} className={styles.backBtn}><ArrowLeft size={20} /></button>}
        <h2>Edit My Premium Profile</h2>
      </div>

      <div className={styles.profileHero}>
        <div className={styles.avatarWrapper}>
          <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className={styles.avatar} />
          <button className={styles.cameraBtn}><Camera size={16} /></button>
        </div>
        <div className={styles.heroInfo}>
          <h3>Alex Doe <span className={styles.verifiedTag}><CheckCircle size={14} /> Verified</span></h3>
          <p>Senior Advocate • ID: BAR789456</p>
          <div className={styles.completeness}>
            <div className={styles.label}>Completeness: 85%</div>
            <div className={styles.bar}><div className={styles.fill} style={{ width: '85%' }} /></div>
          </div>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        {sections.map((section) => (
          <div key={section.title} className={styles.sectionCard} onClick={() => openModal(section.title)}>
            <div className={styles.iconBox}>{section.icon}</div>
            <div className={styles.cardContent}>
              <h4>{section.title}</h4>
              <p>{section.description}</p>
            </div>
            <div className={styles.editBtn}><Pencil size={14} /></div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update {modalTitle}</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Primary Field</label>
                <input type="text" placeholder="Enter updated information" />
              </div>
              <div className={styles.inputGroup}>
                <label>Secondary Field (Optional)</label>
                <input type="text" placeholder="Enter additional details" />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={styles.save} onClick={() => setIsModalOpen(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icons because Landmark and Shield are slightly different in newer lucide versions sometimes
const LandmarkIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

const ShieldIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

export default EditProfile;
