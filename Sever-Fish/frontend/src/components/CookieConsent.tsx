import { useState, useEffect } from 'react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('cookieConsent');
        if (!hasAccepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        // Save the consent in localStorage
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-50">
            <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
                <p className="mb-4 sm:mb-0">
                    Этот сайт использует файлы cookie для обеспечения наилучшего взаимодействия.
                </p>
                <button
                    className="bg-white text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
                    onClick={handleAccept}
                >
                    Я СОГЛАСЕН
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;