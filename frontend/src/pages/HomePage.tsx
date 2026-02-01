import React from 'react';
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
