import React from 'react';
import styles from './SafetyCenter.module.css';
import {
  ArrowLeft,
  Lightbulb,
  ShieldCheck,
  UserX,
  HeartPulse,
  Headset,
  FileCheck2
} from 'lucide-react';

interface Props {
  backToHome?: () => void;
  showToast?: (msg: string) => void;
  onNavigate?: (page: string) => void;
}

const SafetyCenter: React.FC<Props> = ({ backToHome, showToast, onNavigate }) => {
  const navigate = (page: string) => {
    if (onNavigate) onNavigate(page);
    else alert(`Navigate to: ${page}`);
  };

  const startVerification = () => {
    alert('Verification process started!');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {backToHome && <button onClick={backToHome} className={styles.backBtn}><ArrowLeft size={20} /></button>}
        <h2>Safety & Security Center</h2>
      </div>

      <div className={styles.heroBanner}>
        <div className={styles.bannerContent}>
          <h3>Your protection is our priority</h3>
          <p>E-Advocate Services is built on a foundation of trust. Explore our comprehensive safety tools and guidelines.</p>
        </div>
        <ShieldCheck className={styles.bannerIcon} size={80} />
      </div>

      <div className={styles.grid}>
        <div className={styles.card} onClick={() => navigate('tips')}>
          <div className={styles.iconBox}><Lightbulb size={24} /></div>
          <div className={styles.cardInfo}>
            <h4>Safety Guidelines</h4>
            <p>Best practices for online interactions</p>
          </div>
        </div>

        <div className={styles.card} onClick={() => navigate('privacy')}>
          <div className={styles.iconBox}><FileCheck2 size={24} /></div>
          <div className={styles.cardInfo}>
            <h4>Privacy Center</h4>
            <p>Manage who can see your information</p>
          </div>
        </div>

        <div className={styles.card} onClick={() => navigate('report')}>
          <div className={styles.iconBox}><UserX size={24} /></div>
          <div className={styles.cardInfo}>
            <h4>Report & Block</h4>
            <p>Flag suspicious or abusive behavior</p>
          </div>
        </div>

        <div className={styles.card} onClick={() => navigate('wellbeing')}>
          <div className={styles.iconBox}><HeartPulse size={24} /></div>
          <div className={styles.cardInfo}>
            <h4>Digital Wellbeing</h4>
            <p>Resources for healthy professional networking</p>
          </div>
        </div>
      </div>

      <div className={styles.verifySection}>
        <div className={styles.verifyText}>
          <h4>Get the Blue Tick</h4>
          <p>Verified profiles build 3x more trust in the community.</p>
        </div>
        <button onClick={startVerification}>Get Verified Now</button>
      </div>

      <div className={styles.supportFooter}>
        <div className={styles.supportCard}>
          <div className={styles.supportIcon}><Headset size={28} /></div>
          <div className={styles.supportInfo}>
            <h4>Need Immediate Help?</h4>
            <p>Our safety team is available 24/7 for critical issues.</p>
            <button onClick={() => navigate('contact')}>Contact Safety Team</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyCenter;
