import React, { useState } from 'react';
import styles from './FAQPage.module.css';
import { ChevronDown, HelpCircle, Search as SearchIcon } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        question: "How do I find a qualified advocate?",
        answer: "You can find advocates by using our 'Browse Profiles' section or the search bar on the home page. You can filter by expertise, location, languages, and experience to find the best match for your case."
    },
    {
        question: "Is my data and case information secure?",
        answer: "Yes, we use industry-standard end-to-end encryption for all communications and document storage. Your case matters are handled with the highest level of confidentiality."
    },
    {
        question: "What are the costs involved in using the platform?",
        answer: "E-Advocate is free for basic searching and profile browsing. Detailed case management may involve fees decided independently between you and your advocate."
    },
    {
        question: "Can I file a case online through E-Advocate?",
        answer: "Absolutely. Our platform provides a direct link to the official e-Filing portals of District and High Courts, and our advocates can assist you in preparing and submitting the necessary digital documentation."
    },
    {
        question: "How do I track my case status?",
        answer: "Once logged in, your dashboard provides real-time updates on your cases. You can also use the 'Case Status' tool in our navigation bar with your case filing ID."
    },
    {
        question: "What is the 'Spotlight' feature for advocates?",
        answer: "Spotlight is a premium feature for advocates that places their profile at the top of search results, increasing their visibility to potential clients looking for their specific expertise."
    }
];

const FAQPage: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={styles.faqPage}>
            <section className={styles.hero}>
                <div className={styles.container}>
                    <HelpCircle className={styles.heroIcon} size={48} />
                    <h1 className={styles.title}>How can we help?</h1>
                    <p className={styles.subtitle}>Find answers to frequently asked questions about E-Advocate Services.</p>

                    <div className={styles.searchWrapper}>
                        <SearchIcon className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Search your question..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.accordion}>
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className={`${styles.accordionItem} ${activeIndex === index ? styles.active : ''}`}
                                >
                                    <button
                                        className={styles.accordionHeader}
                                        onClick={() => toggleAccordion(index)}
                                    >
                                        <span>{faq.question}</span>
                                        <ChevronDown size={20} className={styles.chevron} />
                                    </button>
                                    <div className={styles.accordionContent}>
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                <p>No results found for "{searchTerm}"</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.contactSupport}>
                        <h3>Still have questions?</h3>
                        <p>Our support team is available 24/7 to assist you with any legal or technical queries.</p>
                        <button className={styles.contactBtn}>Contact Support</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQPage;
