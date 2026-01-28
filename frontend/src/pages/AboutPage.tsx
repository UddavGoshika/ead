import React from 'react';
import styles from './AboutPage.module.css';
// import { Shield, Users, MessageSquare, LineChart } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className={styles.aboutPage}>
            <div className={styles.aboutContainer}>
                {/* Header */}
                <div className={styles.aboutHeader}>
                    <h1>ABOUT E-ADVOCATE</h1>
                    <p className={styles.tagline}>
                        Revolutionizing Legal Services through Digital Innovation, Connecting Clients with Expert
                        Advocates Seamlessly
                    </p>
                </div>

                {/* Main Grid */}
                <div className={styles.aboutContent}>

                    {/* Card 1: About E-Advocate Services */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-balance-scale"></i>
                            </div>
                            <div className={styles.sectionTitleWrap}>
                                <h2 className={styles.sectionTitle}>About E-Advocate Services</h2>
                                <div className={styles.sectionSubtitle}>Digital Legal Platform</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <p>
                                E-Advocate is a premium digital platform that bridges the gap between clients seeking legal assistance
                                and qualified advocates offering expert services. We provide a comprehensive ecosystem for legal
                                consultation, case management, and professional networking.
                            </p>

                            <h3>What We Provide:</h3>
                            <ul>
                                <li><strong>Digital Case Filing:</strong> File legal cases online with complete documentation support</li>
                                <li><strong>Advocate Matching:</strong> AI-powered matching with specialized advocates based on case type</li>
                                <li><strong>Secure Communication:</strong> Encrypted chat, call, and video consultation features</li>
                                <li><strong>Case Tracking:</strong> Real-time updates on case status and hearing schedules</li>
                                <li><strong>Document Management:</strong> Secure cloud storage for all legal documents</li>
                                <li><strong>Legal Resources:</strong> Access to legal blogs, templates, and guidance materials</li>
                            </ul>

                            <p>
                                <strong>Purpose:</strong> To democratize access to legal services, making them affordable, transparent,
                                and accessible to everyone regardless of location or economic status.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: About Browse Profiles */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-user-tie"></i>
                            </div>
                            <div>
                                <h2>Browse Profiles</h2>
                                <div className={styles.sectionSubtitle}>Find Your Perfect Legal Match</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <p>
                                Our advanced profile browsing system allows you to find the perfect legal expert based on multiple
                                criteria including specialization, experience, location, and consultation mode.
                            </p>

                            <div className={styles.featureGrid}>
                                <div className={styles.featureItem}>
                                    <h4>For Clients</h4>
                                    <p>
                                        Search advocates by department, experience, location, language, and consultation preference. View
                                        detailed profiles, ratings, and case success rates.
                                    </p>
                                </div>
                                <div className={styles.featureItem}>
                                    <h4>For Advocates</h4>
                                    <p>
                                        Showcase your expertise, specialization, achievements, and availability. Get matched with relevant
                                        cases and build your professional reputation.
                                    </p>
                                </div>
                            </div>

                            <h3>How to Use:</h3>
                            <ul>
                                <li><strong>Filter System:</strong> Use our 8-layer filtering (Department, Sub-Department, Experience,
                                    State, District, City, Language, Consultation Mode)</li>
                                <li><strong>Advanced Search:</strong> Search by advocate ID, name, or specialization keywords</li>
                                <li><strong>Profile Preview:</strong> View advocate details, success rates, client reviews, and fees</li>
                                <li><strong>Direct Contact:</strong> Initiate chat, schedule calls, or send consultation requests</li>
                                <li><strong>Save Favorites:</strong> Bookmark advocates for future reference</li>
                            </ul>
                        </div>
                    </div>

                    {/* Card 3: About File a Case */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-file-contract"></i>
                            </div>
                            <div>
                                <h2>File a Case</h2>
                                <div className={styles.sectionSubtitle}>Digital Case Submission System</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.legalInfoContent}>
                                <p>
                                    The Case Status Project was conceptualized on the basis of the
                                    <strong>National Policy and Action Plan for Implementation of Information and Communication Technology
                                        (ICT) in the Indian Judiciary - 2005</strong>
                                    submitted by eCommittee, Supreme Court of India with a vision to transform the Indian Judiciary by ICT
                                    enablement of Courts.
                                </p>

                                <p>
                                    eCommittee is a body constituted by the Government of India in pursuance of a proposal received from
                                    Hon'ble the Chief Justice of India to constitute an eCommittee to assist him in formulating a National
                                    policy on computerization of Indian Judiciary and advise on technological communication and management
                                    related changes.
                                </p>

                                <p>
                                    The Case Status Mission Mode Project, is a Pan-India Project, monitored and funded by Department of
                                    Justice, Ministry of Law and Justice, Government of India for the District Courts across the country.
                                </p>

                                <h3>THE PROJECT ENVISAGES</h3>
                                <ul>
                                    <li>To provide efficient & time-bound citizen centric services delivery as detailed in Case Status Project
                                        Litigant's Charter.</li>
                                    <li>To develop, install & implement decision support systems in courts.</li>
                                    <li>To automate the processes to provide transparency in accessibility of information to its stakeholders.</li>
                                    <li>
                                        To enhance judicial productivity, both qualitatively & quantitatively, to make the justice delivery
                                        system affordable, accessible, cost effective, predictable, reliable and transparent.
                                    </li>
                                </ul>

                                <h3>Phase-I :</h3>
                                <p>
                                    In Phase-I of the Case Status Project beginning from 2007, a large number of Court Complexes,
                                    Computer Server Rooms and Judicial Service Centres were readied for computerization of the District
                                    Courts. The District and Taluka Court Complexes covered in Phase-I were computerized with installation
                                    of hardware, LAN and Case Information Software (CIS), for providing basic case related services to the
                                    litigants and the lawyers.
                                </p>

                                <p>
                                    A large number of District Courts launched their websites for the convenience of the different
                                    stakeholders. The Change Management exercise was undertaken to train the Judicial Officers and Court
                                    Staff in the use of computers and Case Information System (CIS) was successfully implemented.
                                </p>

                                <p>
                                    The Judicial Officers were trained by the Master Trainers trained from amongst them for continuing
                                    training programme. The CIS Master trainers have trained District System Administrators (DSAs) in the
                                    use of CIS. The DSAs have trained all the Court Staff in the use of CIS.
                                </p>

                                <p>
                                    The data entry for all pending cases has reached an advanced stage of completion. The Process
                                    Re-Engineering exercise was initiated to have a fresh look on the process, procedures, systems and
                                    Court Rules in force in the different District Courts under High Courts. The Phase-I concluded with
                                    extended timelines upto 30th March 2015.
                                </p>

                                <h3>Phase II:</h3>
                                <p>
                                    The Policy and Action Plan Document Phase-II of the Case Status Project, received approval of Hon'ble
                                    the Chief Justice of India on 8th January 2014. The Government of India sanctioned the project on 4th
                                    August 2015.
                                </p>

                                <p>
                                    In Phase-II, the covered courts are provisioned for additional hardware with (1+3) systems per Court
                                    Room, the uncovered Courts of Phase-I and the newly established Courts with (2+6) systems per Court
                                    Room and the Court Complexes are provisioned for hardware, LAN etc.
                                </p>

                                <p>
                                    The dynamic implementation structure provides for greater participation and cooperation between the
                                    eCommittee, the Department of Justice (Government of India), NIC, DietY and Ministry of Finance. It
                                    provides for High Courts as Implementing Agency of the project under its jurisdiction.
                                </p>

                                <p>
                                    The Infrastructure Model provides for adopting Cloud Computing Architecture which is efficient and cost
                                    effective, while retaining the present Server Rooms as Network Rooms and Judicial Service Centres as
                                    Centralized Filing Centres.
                                </p>

                                <p>
                                    Provision has been made for computerization of offices of District Legal Services Authority, Taluka
                                    Legal Services Committee, the National Judicial Academy and the State Judicial Academies for efficient
                                    delivery of services and training.
                                </p>

                                <p>
                                    Continuing with the implementation of Free and Open Source Solutions (FOSS), Phase-II has adopted the
                                    Core-Periphery model of Case Information Software, the core being Unified as National Core, while the
                                    periphery developed according to requirement of each High Court.
                                </p>

                                <p>
                                    In Phase-II, all the remaining Court Complexes are provisioned to be connected with Jails and Desktop
                                    based Video Conferencing to go beyond routine remands and production of under-trial prisoners. It will
                                    also be used for recording evidence in sensitive cases and gradually extended to cover as many types
                                    of cases as possible.
                                </p>

                                <p>
                                    With an emphasis on Capacity Building of Judicial Officers and Process Re-Engineering, Phase-II
                                    provides for Judicial Knowledge Management System including Integrated Library Management System and
                                    use of Digital Libraries.
                                </p>

                                <p>
                                    The Phase-II of the project lays great emphasis on service delivery to the litigants, lawyers and other
                                    stakeholders. The websites will be Accessible Compliant and to the extent possible, the information
                                    will be available in the local languages.
                                </p>

                                <p>
                                    Mobile applications, SMS and emails are extensively used as platforms for dissemination of information.
                                    Kiosks will be provided for every Court Complex. Certified copies of documents will be given online and
                                    ePayment Gateways will be provided for making deposits, payment of court fees, fines etc.
                                </p>

                                <p>
                                    The National Judicial Data Grid (NJDG) will be further improvised to facilitate more qualitative
                                    information for Courts, Government and Public.
                                </p>

                                <h3>Case Status Portal :</h3>
                                <p>
                                    On 7th August 2013, Hon'ble the Chief Justice of India launched the Case Status National Portal. More
                                    than 2852 District and Taluka Court Complexes have secured their presence on the NJDG portal and are
                                    providing Case Status, Cause lists online with many of them also uploading orders and judgments.
                                </p>

                                <p>
                                    The data of more than <strong>7 crore pending and disposed of cases</strong> and
                                    <strong>3.3 crore orders and judgments</strong> of District Courts in India is available on NJDG at
                                    present.
                                </p>

                                <p>
                                    With dynamic real time data generated and updated continuously, the NJDG is serving as a source of
                                    information of judicial delivery system for all the stakeholders. It is regularly analyzed for
                                    meaningful assistance in policy formation and decision making.
                                </p>

                                <p>
                                    The Online Analytical Processing and Business Intelligence Tools help in preparation of dashboards,
                                    judicial performance analysis, litigation trends, impact assessment of legal amendments, and effective
                                    Court and Case Management for decision support systems.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: About Case Status */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div>
                                <h2>Case Status & Tracking</h2>
                                <div className={styles.sectionSubtitle}>Real-Time Monitoring</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <p>
                                Stay informed about every aspect of your case with our comprehensive tracking system. From initial filing
                                to final resolution, monitor progress in real-time.
                            </p>

                            <h3>Tracking Features:</h3>
                            <ul>
                                <li><strong>Real-Time Updates:</strong> Instant notifications for case status changes, hearings, and
                                    document submissions</li>
                                <li><strong>Hearing Schedule:</strong> View upcoming court dates, times, and locations</li>
                                <li><strong>Document Timeline:</strong> Track all submitted documents and their status</li>
                                <li><strong>Advocate Communication:</strong> Direct messaging with your assigned advocate</li>
                                <li><strong>Milestone Tracking:</strong> Monitor key case milestones and achievements</li>
                                <li><strong>History Log:</strong> Complete audit trail of all case activities</li>
                            </ul>

                            <div className={styles.legalInfoContent}>
                                <p>
                                    The eCourts Project was conceptualized on the basis of the
                                    <strong>National Policy and Action Plan for Implementation of Information and Communication Technology
                                        (ICT) in the Indian Judiciary – 2005</strong>
                                    submitted by the eCommittee, Supreme Court of India, with a vision to transform the Indian Judiciary
                                    through ICT enablement of courts.
                                </p>

                                <p>
                                    The eCommittee is a body constituted by the Government of India pursuant to a proposal from the Hon'ble
                                    Chief Justice of India to assist in formulating a national policy on computerization of the Indian
                                    Judiciary and to advise on technological, communication, and management-related reforms.
                                </p>

                                <p>
                                    The eCourts Mission Mode Project is a Pan-India initiative, monitored and funded by the Department of
                                    Justice, Ministry of Law and Justice, Government of India, for District Courts across the country.
                                </p>

                                <h3>Project Objectives</h3>
                                <p>
                                    The project envisages efficient and time-bound citizen-centric service delivery as detailed in the
                                    eCourts Project Litigant's Charter. It aims to develop and implement decision support systems in
                                    courts, automate processes to enhance transparency, and improve accessibility of judicial information
                                    for stakeholders.
                                </p>

                                <p>
                                    The project seeks to enhance judicial productivity both qualitatively and quantitatively, making the
                                    justice delivery system affordable, accessible, cost-effective, predictable, reliable, and transparent.
                                </p>

                                <h3>Phase I</h3>
                                <p>
                                    Phase I of the eCourts Project commenced in 2007 and focused on preparing court complexes, server
                                    rooms, and judicial service centres for computerization. District and Taluka Courts were equipped with
                                    hardware, LAN, and Case Information Software (CIS) to provide basic case-related services to litigants
                                    and lawyers.
                                </p>

                                <p>
                                    Extensive training programs were conducted for judicial officers and court staff through a structured
                                    master trainer model. Data entry of pending cases progressed significantly, and process re-engineering
                                    initiatives were undertaken to review court procedures and rules. Phase I concluded with extended
                                    timelines up to 30th March 2015.
                                </p>

                                <h3>Phase II</h3>
                                <p>
                                    Phase II received approval from the Hon'ble Chief Justice of India on 8th January 2014 and was
                                    sanctioned by the Government of India on 4th August 2015. This phase expanded hardware provisioning,
                                    introduced cloud computing architecture, and strengthened infrastructure across covered and newly
                                    established courts.
                                </p>

                                <p>
                                    Phase II emphasizes Free and Open Source Software (FOSS), adoption of a unified national core for CIS,
                                    enhanced video conferencing facilities, judicial knowledge management systems, digital libraries, and
                                    extensive capacity building for judicial officers.
                                </p>

                                <p>
                                    Service delivery improvements include multilingual accessible websites, mobile applications, SMS and
                                    email alerts, kiosks in court complexes, online certified copies, ePayment gateways, and an enhanced
                                    National Judicial Data Grid (NJDG).
                                </p>

                                <h3>eCourts National Portal (ecourts.gov.in)</h3>
                                <p>
                                    On 7th August 2013, the Hon'ble Chief Justice of India launched the eCourts National Portal,
                                    ecourts.gov.in. Over 2,852 District and Taluka Court Complexes are now integrated with the portal,
                                    providing online case status, cause lists, and access to orders and judgments.
                                </p>

                                <p>
                                    Currently, data relating to more than 7 crore cases and over 3.3 crore orders and judgments of District
                                    Courts across India is available on the National Judicial Data Grid.
                                </p>

                                <p>
                                    With real-time data updates, NJDG serves as a national data warehouse supporting policy formulation,
                                    decision-making, judicial performance analysis, and effective court and case management through
                                    analytical and business intelligence tools.
                                </p>
                            </div>

                            <div className={styles.featureGrid}>
                                <div className={styles.featureItem}>
                                    <h4>For Clients</h4>
                                    <p>
                                        Track case progress, receive alerts, access documents, and communicate with your advocate anytime.
                                    </p>
                                </div>
                                <div className={styles.featureItem}>
                                    <h4>For Advocates</h4>
                                    <p>
                                        Manage multiple cases, update statuses, upload documents, and communicate with clients efficiently.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 5: About Blogs */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-blog"></i>
                            </div>
                            <div>
                                <h2>Legal Blogs & Resources</h2>
                                <div className={styles.sectionSubtitle}>Knowledge Sharing Platform</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <p>
                                Our legal blog platform serves as a comprehensive knowledge base for both legal professionals and
                                clients, featuring expert insights, case studies, and legal guidance.
                            </p>

                            <h3>For Advocates:</h3>
                            <ul>
                                <li><strong>Content Creation:</strong> Write and publish articles on legal topics, case studies, and
                                    expert opinions</li>
                                <li><strong>Professional Visibility:</strong> Establish thought leadership and attract potential clients</li>
                                <li><strong>Knowledge Sharing:</strong> Share insights with peers and contribute to legal education</li>
                                <li><strong>Monetization:</strong> Earn through premium content and consultations</li>
                            </ul>

                            <h3>For Clients:</h3>
                            <ul>
                                <li><strong>Educational Resources:</strong> Access free legal information and guidance</li>
                                <li><strong>Expert Insights:</strong> Learn from experienced advocates' articles and case analyses</li>
                                <li><strong>Latest Updates:</strong> Stay informed about legal changes and precedents</li>
                                <li><strong>Interactive Learning:</strong> Comment on articles and ask questions to authors</li>
                            </ul>

                            <p>
                                <strong>Content Categories:</strong> Case Law Analysis, Legal Procedures, Rights & Duties, Recent
                                Judgments, Practice Tips, Legislative Updates.
                            </p>
                        </div>
                    </div>

                    {/* Card 6: Mission & Vision */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-bullseye"></i>
                            </div>
                            <div>
                                <h2>Mission & Vision</h2>
                                <div className={styles.sectionSubtitle}>Driving Legal Innovation</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.featureGrid}>
                                <div className={styles.featureItem}>
                                    <h4>Our Mission</h4>
                                    <p>
                                        To democratize access to quality legal services through technology, making legal assistance
                                        affordable, transparent, and accessible to every individual and business regardless of their
                                        geographical or economic constraints.
                                    </p>
                                </div>
                                <div className={styles.featureItem}>
                                    <h4>Our Vision</h4>
                                    <p>
                                        To become the world's most trusted digital legal ecosystem, transforming how legal services are
                                        delivered and experienced globally through innovation, integrity, and inclusivity.
                                    </p>
                                </div>
                            </div>

                            <h3>Core Values:</h3>
                            <ul>
                                <li><strong>Accessibility:</strong> Making legal help available to all</li>
                                <li><strong>Transparency:</strong> Clear processes and communication</li>
                                <li><strong>Excellence:</strong> Maintaining highest professional standards</li>
                                <li><strong>Innovation:</strong> Continuously improving through technology</li>
                                <li><strong>Confidentiality:</strong> Ensuring client privacy and data security</li>
                                <li><strong>Integrity:</strong> Upholding ethical standards in all operations</li>
                            </ul>
                        </div>
                    </div>

                    {/* Card 7: Approvals & Partnerships */}
                    <div className={styles.fullWidthCard}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>
                                <i className="fas fa-handshake"></i>
                            </div>
                            <div>
                                <h2>Approvals & Partnerships</h2>
                                <div className={styles.sectionSubtitle}>Trusted Platform</div>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.approvalsContent}>
                                <p>
                                    E-Advocate operates with full legal compliance and has established strategic partnerships to enhance
                                    service quality, reliability, and security.
                                </p>

                                {/* ACCORDION CARDS */}
                                <div className={styles.accordionContainer}>

                                    {/* Card 1 */}
                                    <details className={styles.accordionCard}>
                                        <summary className={styles.accordionHeader}>
                                            <div className={styles.iconWrapper}>
                                                <i className="fas fa-gavel"></i>
                                            </div>
                                            <h3> Approved By</h3>
                                            <span className={styles.arrow}>▼</span>
                                        </summary>
                                        <div className={styles.accordionContent}>
                                            <p>
                                                Registered and regulated under recognized Bar Council authorities, ensuring advocate verification,
                                                ethical practice, and legal authenticity. All advocates on the platform undergo mandatory
                                                verification of Bar Council enrollment certificates, identity proof, and professional standing.
                                            </p>
                                            <img
                                                src="Digital-india-White.webp"
                                                alt="Bar Council document"
                                                className={styles.approvalImage}
                                            />
                                            <ul>
                                                <li>Real-time verification with Bar Council database</li>
                                                <li>Annual renewal check</li>
                                                <li>Disciplinary record screening</li>
                                            </ul>
                                        </div>
                                    </details>

                                    {/* Card 2 */}
                                    <details className={styles.accordionCard}>
                                        <summary className={styles.accordionHeader}>
                                            <div className={styles.iconWrapper}>
                                                <i className="fas fa-university"></i>
                                            </div>
                                            <h3>Legal Collaboration</h3>
                                            <span className={styles.arrow}>▼</span>
                                        </summary>
                                        <div className={styles.accordionContent}>
                                            <p>
                                                Strategic collaborations with leading law firms and legal institutions to deliver expert legal
                                                solutions across multiple domains including corporate, criminal, family, property, and cyber law.
                                            </p>
                                            <img
                                                src="india_code.webp"
                                                alt="Law firm collaboration"
                                                className={styles.approvalImage}
                                            />
                                            <ul>
                                                <li>Access to senior counsels for complex matters</li>
                                                <li>Domain-specific expert panels</li>
                                                <li>Regular knowledge-sharing sessions</li>
                                            </ul>
                                        </div>
                                    </details>

                                    {/* Card 3 */}
                                    <details className={styles.accordionCard}>
                                        <summary className={styles.accordionHeader}>
                                            <div className={styles.iconWrapper}>
                                                <i className="fas fa-shield-alt"></i>
                                            </div>
                                            <h3>Partnership</h3>
                                            <span className={styles.arrow}>▼</span>
                                        </summary>
                                        <div className={styles.accordionContent}>
                                            <p>
                                                ISO/IEC 27001:2013 certified security infrastructure ensuring encrypted communication,
                                                data protection, and full privacy compliance (GDPR + Indian DPDP Act aligned).
                                            </p>
                                            <img
                                                src="ecomitte.webp"
                                                alt="Cybersecurity lock"
                                                className={styles.approvalImage}
                                            />
                                            <ul>
                                                <li>End-to-end encryption (AES-256)</li>
                                                <li>Regular penetration testing</li>
                                                <li>Zero-knowledge architecture for sensitive data</li>
                                            </ul>
                                        </div>
                                    </details>

                                    {/* Card 4 */}
                                    <details className={styles.accordionCard}>
                                        <summary className={styles.accordionHeader}>
                                            <div className={styles.iconWrapper}>
                                                <i className="fas fa-hand-holding-heart"></i>
                                            </div>
                                            <h3>Association with</h3>
                                            <span className={styles.arrow}>▼</span>
                                        </summary>
                                        <div className={styles.accordionContent}>
                                            <p>
                                                Partnerships with government bodies and legal aid organizations to support accessible
                                                and affordable justice for all citizens, including pro-bono consultations for eligible cases.
                                            </p>
                                            <img
                                                src="Digital-india-White.webp"
                                                alt="Legal aid support"
                                                className={styles.approvalImage}
                                            />
                                            <ul>
                                                <li>Free initial consultation for underprivileged</li>
                                                <li>Tie-ups with District Legal Services Authorities</li>
                                                <li>NGO collaboration for awareness drives</li>
                                            </ul>
                                        </div>
                                    </details>
                                </div>

                                {/* Certifications */}
                                <div className={styles.certifications}>
                                    <h3>Certifications & Compliance</h3>
                                    <ul>
                                        <li><strong>Data Protection:</strong> GDPR & Data Privacy Compliant</li>
                                        <li><strong>Legal Compliance:</strong> Bar Council Registration No. L-12345/2023</li>
                                        <li><strong>Security Standards:</strong> ISO/IEC 27001:2013 Certified</li>
                                        <li><strong>Payment Security:</strong> PCI DSS Level 1 Compliant</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section (Commented out in original) */}
                {/* <div className={styles.contactSection}>
          <h2>Need Assistance?</h2>
          <p>
            Our support team is available 24/7 to help you with any questions, technical issues, or guidance you may need.
          </p>
          
          <div className={styles.contactGrid}>
            <a href="mailto:support@e-advocate.com" className={styles.contactBtn}>
              <i className="fas fa-envelope"></i>
              <span>Email Support</span>
              <small>support@e-advocate.com</small>
            </a>
            
            <a href="tel:+911234567890" className={styles.contactBtn}>
              <i className="fas fa-phone-alt"></i>
              <span>Call Us</span>
              <small>+91 12345 67890</small>
            </a>
            
            <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>
              <i className="fab fa-whatsapp"></i>
              <span>WhatsApp</span>
              <small>Chat with Support</small>
            </a>
          </div>
          
          <p className={styles.operatingHours}>
            <i className="fas fa-clock"></i>
            Operating Hours: 24/7 Support | Response Time: Under 15 minutes
          </p>
        </div> */}
            </div>
        </div>
    );
};


// Helper for image placeholder till we get real assets
const Scale = ({ size, className }: { size: number, className: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
);

export default AboutPage;
