import React, { useState } from 'react';
import styles from './FAQSection.module.css';
import { Plus, Minus, Search } from 'lucide-react';

const faqs = [
    {
        question: "How do I find a specialized advocate?",
        answer: "You can use our 'Browse Profiles' section to filter advocates by specialization, experience, location, and even consultation fee. Our AI-driven matching system can also suggest the best advocates for your specific case type."
    },
    {
        question: "Is my data and communication secure?",
        answer: "Absolutely. We use end-to-end encryption for all messages and video consultations. Your legal documents are stored in highly secure, encrypted cloud servers that comply with top-tier data protection standards."
    },
    {
        question: "How can I track my case status?",
        answer: "Once you hire an advocate through our platform, your dashboard will provide real-time updates on case filings, hearing schedules, and any communications from the opposite party or the court."
    },

    {
        question: "How are advocates verified?",
        answer:
            "Advocates are verified through Bar Council registration and internal checks.",
    },
    {
        question: "Is online consultation available?",
        answer:
            "Yes, chat, call, and video consultation options are supported.",
    },

];

const FAQSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section id="faq" className={styles.faqSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Frequently Asked Questions</h2>
                    <p className={styles.subtitle}>Find answers to common questions about using the E-Advocate platform.</p>
                </div>

                <div className={styles.searchWrapper}>
                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Search help topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.accordion}>
                    {filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`${styles.item} ${activeIndex === index ? styles.active : ''}`}
                        >
                            <button
                                className={styles.question}
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                            >
                                <span>{faq.question}</span>
                                {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                            </button>
                            <div className={styles.answerWrapper}>
                                <div className={styles.answer}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
