import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AuthModal from '../components/auth/AuthModal';
import FilterModal from '../components/layout/FilterModal';
import ChatWidget from '../components/layout/ChatWidget';
import HelpModal from '../components/layout/HelpModal';
import AdvocateRegistration from '../components/auth/AdvocateRegistration';
import ClientRegistration from '../components/auth/ClientRegistration';
import { useAuth } from '../context/AuthContext';

const HomeLayout: React.FC = () => {
    const { isAdvocateRegOpen, closeAdvocateReg, isClientRegOpen, closeClientReg } = useAuth();

    return (
        <div className="home-layout">
            <Navbar />
            <AuthModal />
            <FilterModal />
            <HelpModal />
            <main>
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
            {isAdvocateRegOpen && <AdvocateRegistration onClose={closeAdvocateReg} />}
            {isClientRegOpen && <ClientRegistration onClose={closeClientReg} />}
        </div>
    );
};

export default HomeLayout;
