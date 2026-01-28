import React, { useState } from "react";
import styles from "./EmailTemplates.module.css";

type Template = {
    key: string;
    title: string;
    subject: string;
    body: string;
    active: boolean;
};

const templates: Template[] = [
    {
        key: "account_opening",
        title: "Account Opening Email",
        subject: "Account Opening",
        active: true,
        body: `Hi [[name]],

Thank you for registering at our site: [[sitename]].

Your account type is: [[account_type]]
Email is: [[email]]
Password is: [[password]]

You can login here: [[url]]

Thanks,
[[sitename]]`,
    },
    {
        key: "account_opening_admin",
        title: "Account Opening Email To Admin",
        subject: "New Account Created",
        active: true,
        body: "A new user [[name]] has registered.",
    },
    {
        key: "member_verification",
        title: "Member Verification Email",
        subject: "Verify Your Account",
        active: true,
        body: "Click here to verify your account: [[url]]",
    },
    {
        key: "staff_account_opening",
        title: "Staff Account Opening Email",
        subject: "Staff Account Created",
        active: true,
        body: "Staff account created for [[name]].",
    },
    {
        key: "package_purchase",
        title: "Package Purchase Email",
        subject: "Package Purchase Confirmation",
        active: true,
        body: "Your package [[package]] has been activated.",
    },
    {
        key: "manual_payment_approval",
        title: "Manual Payment Approval Email",
        subject: "Payment Approved",
        active: true,
        body: "Your manual payment has been approved.",
    },
    {
        key: "express_interest",
        title: "Email On Express Interest",
        subject: "Interest Expressed",
        active: true,
        body: "[[sender]] has expressed interest in your profile.",
    },
    {
        key: "accept_interest",
        title: "Email On Accepting Interest",
        subject: "Interest Accepted",
        active: true,
        body: "Your interest has been accepted.",
    },
    {
        key: "password_reset",
        title: "Password Reset Email",
        subject: "Reset Password",
        active: true,
        body: "Reset your password using this link: [[url]]",
    },
    {
        key: "profile_picture_request",
        title: "Profile Picture View Request Email",
        subject: "Profile Picture View Request",
        active: true,
        body: "Someone requested to view your profile picture.",
    },
    {
        key: "profile_picture_accepted",
        title: "Profile Picture View Request Accepted Email",
        subject: "Profile Picture View Approved",
        active: true,
        body: "Your profile picture view request was approved.",
    },
    {
        key: "gallery_image_request",
        title: "Gallery Image View Request Email",
        subject: "Gallery Image View Request",
        active: true,
        body: "Someone requested to view your gallery images.",
    },
    {
        key: "gallery_image_accepted",
        title: "Gallery Image View Request Accepted Email",
        subject: "Gallery Image View Approved",
        active: true,
        body: "Your gallery image request was approved.",
    },
    {
        key: "email_registration_verification",
        title: "Email Registration Verification",
        subject: "Verify Your Email",
        active: true,
        body: "Verify your email address using this link: [[url]]",
    },
];

const EmailTemplates: React.FC = () => {
    const [activeKey, setActiveKey] = useState(templates[0].key);
    const [data, setData] = useState(templates);

    const activeTemplate = data.find((t) => t.key === activeKey)!;

    const updateTemplate = (field: keyof Template, value: any) => {
        setData((prev) =>
            prev.map((t) =>
                t.key === activeKey ? { ...t, [field]: value } : t
            )
        );
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.header}>Email Templates</h2>

            <div className={styles.layout}>
                {/* LEFT SIDEBAR */}
                <div className={styles.sidebar}>
                    {data.map((t) => (
                        <button
                            key={t.key}
                            className={`${styles.templateItem} ${t.key === activeKey ? styles.active : ""
                                }`}
                            onClick={() => setActiveKey(t.key)}
                        >
                            {t.title}
                        </button>
                    ))}
                </div>

                {/* RIGHT PANEL */}
                <div className={styles.editor}>
                    {/* ACTIVATION */}
                    <div className={styles.row}>
                        <label>Activation</label>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={activeTemplate.active}
                                onChange={(e) =>
                                    updateTemplate("active", e.target.checked)
                                }
                            />
                            <span className={styles.slider} />
                        </label>
                    </div>

                    {/* SUBJECT */}
                    <div className={styles.field}>
                        <label>Subject</label>
                        <input
                            value={activeTemplate.subject}
                            onChange={(e) =>
                                updateTemplate("subject", e.target.value)
                            }
                        />
                    </div>

                    {/* EDITOR TOOLBAR */}
                    <div className={styles.toolbar}>
                        <button>B</button>
                        <button>U</button>
                        <button>I</button>
                        <button>≡</button>
                        <button>↺</button>
                        <button>↻</button>
                    </div>

                    {/* BODY */}
                    <textarea
                        className={styles.textarea}
                        value={activeTemplate.body}
                        onChange={(e) =>
                            updateTemplate("body", e.target.value)
                        }
                    />

                    <p className={styles.note}>
                        ** N.B: Do not change the variables like [[name]], [[email]],
                        [[url]]
                    </p>

                    <div className={styles.actions}>
                        <button className={styles.saveBtn}>
                            Update Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplates;
