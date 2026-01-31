import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { Step, CallBackProps } from 'react-joyride';

const OnboardingTour: React.FC = () => {
    const [run, setRun] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenHomeTour');
        console.log('OnboardingTour: Initial hasSeenTour =', hasSeenTour);

        if (!hasSeenTour || hasSeenTour === 'null') {
            console.log('OnboardingTour: Preparing to start tour...');

            // Wait for everything to be truly stable (images, settings, animations)
            const timer = setTimeout(() => {
                const homeEl = document.querySelector('#home');
                if (homeEl) {
                    console.log('OnboardingTour: #home found, starting tour.');
                    setRun(true);
                } else {
                    console.error('OnboardingTour: #home NOT found in DOM. Retrying in 2s...');
                    // Second attempt if not found (maybe slow loading)
                    setTimeout(() => {
                        if (document.querySelector('#home')) {
                            console.log('OnboardingTour: #home found on retry.');
                            setRun(true);
                        } else {
                            console.error('OnboardingTour: #home still not found after retry.');
                        }
                    }, 2000);
                }
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            console.log('OnboardingTour: Tour already seen. Clear localStorage or click top-left to reset.');
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, action } = data;
        console.log('OnboardingTour Callback:', { status, type, action });

        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            localStorage.setItem('hasSeenHomeTour', 'true');
            console.log('OnboardingTour: Tour marked as seen. Redirecting hasBeenSeen -> true');
        }
    };

    const steps: Step[] = [
        {
            target: '#home',
            content: 'Welcome to e-Advocate! Let us show you around our premium legal platform.',
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '#nav-login-btn',
            content: 'Login here to access your account instantly from any page.',
            placement: 'bottom',
            disableScrolling: true,
        },
        {
            target: '#nav-register-btn',
            content: 'Not a member? Join e-Advocate as a Client or Advocate right here.',
            placement: 'bottom',
            disableScrolling: true,
        },
        {
            target: '#search',
            content: 'Easily browse and find top-rated legal professionals or clients.',
            placement: 'top',
        },
        {
            target: '#role-toggle-advocates',
            content: 'Switch this toggle to search specifically for verified advocates.',
            placement: 'bottom',
        },
        {
            target: '#role-toggle-clients',
            content: 'Switch this toggle to find clients looking for legal assistance.',
            placement: 'bottom',
        },
        {
            target: '#file-a-case',
            content: 'Need to start a legal process? File your case securely through this portal.',
            placement: 'top',
        },
        {
            target: '#blogs',
            content: 'Keep yourself updated with the latest legal news, insights, and blogs.',
            placement: 'top',
        },
        {
            target: '#faq',
            content: 'Have some queries? Our frequently asked questions might have the answer.',
            placement: 'top',
        },
        {
            target: '#contact',
            content: 'Still need help? Reach out to our dedicated support team here.',
            placement: 'top',
        }
    ];

    return (
        <>
            <Joyride
                callback={handleJoyrideCallback}
                continuous
                run={run}
                scrollToFirstStep
                showProgress
                showSkipButton
                steps={steps}
                spotlightClicks
                disableScrolling={false}
                debug={true}
                floaterProps={{
                    disableAnimation: true,
                }}
                spotlightPadding={5}
                styles={{
                    options: {
                        primaryColor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 10000,
                        arrowColor: 'rgba(5, 10, 30, 0.95)',
                        backgroundColor: 'rgba(5, 10, 30, 0.95)',
                        overlayColor: 'rgba(0, 0, 0, 0.75)',
                        textColor: '#ffffff',
                    },

                    tooltip: {
                        backdropFilter: 'blur(18px)',
                        background: 'linear-gradient(135deg, rgba(10, 15, 40, 0.95), rgba(2, 5, 20, 0.95))',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: `
      0 0 15px rgba(255, 255, 255, 0.15),
      0 0 40px rgba(120, 180, 255, 0.15),
      0 0 80px rgba(120, 180, 255, 0.08),
      0 20px 60px rgba(0, 0, 0, 0.8)
    `,
                    },

                    tooltipContainer: {
                        textAlign: 'left',
                        borderRadius: '18px',
                        padding: '14px 16px',
                        color: '#ffffff',
                        textShadow: `
      0 0 4px rgba(255, 255, 255, 0.6),
      0 0 10px rgba(120, 180, 255, 0.4),
      0 0 18px rgba(120, 180, 255, 0.25)
    `,
                    },

                    buttonNext: {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(120, 180, 255, 0.15))',
                        color: '#ffffff',
                        borderRadius: '12px',
                        padding: '10px 22px',
                        fontSize: '14px',
                        fontWeight: '700',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        boxShadow: `
      0 0 12px rgba(255, 255, 255, 0.3),
      0 0 24px rgba(120, 180, 255, 0.4),
      0 0 48px rgba(120, 180, 255, 0.25)
    `,
                    },

                    buttonBack: {
                        marginRight: '12px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'transparent',
                        textShadow: `
      0 0 6px rgba(255, 255, 255, 0.6),
      0 0 14px rgba(120, 180, 255, 0.4)
    `,
                    },

                    buttonSkip: {
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'transparent',
                        textShadow: `
      0 0 6px rgba(255, 255, 255, 0.6),
      0 0 14px rgba(120, 180, 255, 0.4)
    `,
                    },
                }}

            />
        </>
    );
};

export default OnboardingTour;
