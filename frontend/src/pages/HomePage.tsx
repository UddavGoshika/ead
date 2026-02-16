import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/home/HeroSection';
// import FindAdvocatesSection from '../components/home/FindAdvocatesSection';
import SearchSection from '../components/home/SearchSection';
import FileACaseSection from '../components/home/FileACaseSection';
import BlogSection from '../components/home/BlogSection';
import DraftingServicesGrid from '../components/home/DraftingServicesGrid';
import TestimonialSection from '../components/home/TestimonialSection';
import FAQSection from '../components/home/FAQSection';
import ContactSection from '../components/home/ContactSection';
// import AboutSection from '../components/home/AboutSection';
import OnboardingTour from '../components/shared/OnboardingTour';

const HomePage: React.FC = () => {
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn && user) {
            const role = (user.role || '').toLowerCase();
            const id = user.unique_id || user.id;

            if (role === 'admin' || role === 'super_admin') {
                navigate('/admin/dashboard');
            } else if (role === 'advocate') {
                navigate(`/dashboard/advocate/${id}`);
            } else if (role === 'client') {
                navigate(`/dashboard/client/${id}`);
            } else if (role === 'legal_provider') {
                navigate(`/dashboard/advisor/${id}`);
            } else if (role === 'verifier') {
                navigate('/dashboard/verifier');
            } else if (role === 'finance') {
                navigate('/dashboard/finance');
            } else if ([
                'manager', 'teamlead', 'hr', 'telecaller', 'support', 'customer_care',
                'chat_support', 'live_chat', 'call_support', 'data_entry',
                'personal_assistant', 'personal_agent', 'influencer', 'marketer', 'marketing_agency'
            ].includes(role)) {
                navigate('/staff/portal');
            } else if (role === 'email_support') {
                navigate(`/dashboard/email_support/${id}`);
            } else if (role === 'user') {
                navigate(`/dashboard/user/${id}`);
            } else {
                // Default fallback
                navigate(`/dashboard/client/${id}`);
            }
        }
    }, [isLoggedIn, user, navigate]);

    // Don't render homepage content if redirecting (optional, but cleaner)
    if (isLoggedIn) return null;

    return (
        <div className="home-page" style={{ overflowX: 'hidden' }}>
            <OnboardingTour />
            <div id="home">
                <HeroSection />
            </div>

            {/* <FindAdvocatesSection /> */}

            <section id="search">
                <SearchSection />
            </section>

            <section id="file-a-case">
                <FileACaseSection />
            </section>

            <section id="drafting-services">
                <DraftingServicesGrid />
            </section>

            <section id="blogs">
                <BlogSection />
            </section>

            <section id="testimonial">
                <TestimonialSection />
            </section>

            <section id="faq">
                <FAQSection />
            </section>

            {/* <section id="about">
                <AboutSection />
            </section> */}

            <section id="contact">
                <ContactSection />
            </section>
        </div>
    );
};

export default HomePage;
