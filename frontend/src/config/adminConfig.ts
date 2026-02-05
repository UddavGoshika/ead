export const DEFAULT_ATTRIBUTES = [
    {
        id: "practice_area",
        title: "Practice Area",
        options: [
            { id: "supreme", label: "Supreme Court", enabled: true },
            { id: "high", label: "High Court", enabled: true },
            { id: "district", label: "District Court", enabled: true },
            { id: "sessions", label: "Sessions Court", enabled: true },
            { id: "consumer", label: "Consumer Court", enabled: true },
            { id: "other", label: "Other", enabled: true }
        ]
    },
    {
        id: "specialization",
        title: "Specialization",
        options: [
            { id: "criminal", label: "Criminal Law", enabled: true },
            { id: "civil", label: "Civil Law", enabled: true },
            { id: "corporate", label: "Corporate Law", enabled: true },
            { id: "family", label: "Family Law", enabled: true },
            { id: "ip", label: "Intellectual Property", enabled: true },
            { id: "tax", label: "Taxation Law", enabled: true }
        ]
    },
    {
        id: "experience",
        title: "Experience Level",
        options: [
            { id: "0-2", label: "0–2 Years", enabled: true },
            { id: "3-5", label: "3–5 Years", enabled: true },
            { id: "6-10", label: "6–10 Years", enabled: true },
            { id: "10+", label: "10+ Years", enabled: true }
        ]
    },
    {
        id: "language",
        title: "Languages Spoken",
        options: [
            { id: "en", label: "English", enabled: true },
            { id: "hi", label: "Hindi", enabled: true },
            { id: "bn", label: "Bengali", enabled: true },
            { id: "mr", label: "Marathi", enabled: true },
            { id: "ta", label: "Tamil", enabled: true },
            { id: "te", label: "Telugu", enabled: true },
            { id: "gu", label: "Gujarati", enabled: true },
            { id: "kn", label: "Kannada", enabled: true },
            { id: "ml", label: "Malayalam", enabled: true }
        ]
    }
];

export const DEFAULT_SECTIONS = [
    "Personal Information",
    "Verification Status",
    "Password",
    "Education",
    "Professional Practice",
    "Location",
    "Professional Career",
    "Availability",
    "Review & Submit"
].map((name, index) => ({ id: (index + 1).toString(), name, enabled: true }));
