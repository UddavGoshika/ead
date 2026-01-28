import styles from "./mycases.module.css";
//import { FileText, PlusSquare, Briefcase } from "lucide-react"; // or any icon lib

const cases = [
    {
        title: "Property Dispute in Mumbai",
        caseId: "CASE -001",
        status: "In Progress",
        lastUpdate: "2 days ago",
        name: "Samantha",
        code: "NYC98765",
    },
    {
        title: "Contract Breach Litigation",
        caseId: "CASE -002",
        status: "Awaiting Documents",
        lastUpdate: "5 days ago",
        name: "Ben",
        code: "TEXAS1234",
    },
];

const Cases = () => {
    return (




        <div className={styles.container}>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by Advocate's ID......"
                        className={styles.dashboardSearchInput}
                    />
                    <button className={styles.searchBtnInside}>Search</button>
                </div>

                <select className={styles.filterSelect}>
                    <option>Department</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Sub-Department</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Select Court</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Location</option>
                </select>
                <select className={styles.filterSelect}>
                    <option>Experience</option>
                </select>

                <button className={styles.submitBtnDashboard}>Submit</button>
            </div>




            {cases.map((item, idx) => (
                <div key={idx} className={styles.card}>
                    {/* Left */}
                    <div className={styles.left}>
                        <h2>{item.title}</h2>
                        <p className={styles.caseId}>{item.caseId}</p>
                        <span className={styles.status}>{item.status}</span>

                        <p className={styles.update}>Last update: {item.lastUpdate}</p>

                        <div className={styles.actions}>
                            <button>Chat</button>
                            <button>Call</button>
                            <button>Docs</button>
                        </div>
                    </div>

                    {/* Right */}
                    <div className={styles.right}>
                        <div className={styles.avatar}>400 × 400</div>
                        <div className={styles.profile}>
                            <strong>{item.name}</strong>
                            <div className={styles.code}>
                                🛡️ {item.code}
                            </div>
                        </div>
                        <span className={styles.view}>View Details</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Cases;
