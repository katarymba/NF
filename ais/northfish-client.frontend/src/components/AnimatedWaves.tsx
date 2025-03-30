import React from 'react';

interface AnimatedWavesProps {
    className?: string;
}

const AnimatedWaves: React.FC<AnimatedWavesProps> = ({ className = '' }) => {
    return (
        <div className={`relative w-full h-24 overflow-hidden ${className}`}>
            {/* Градиентный переход к белому фону */}
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white z-10"></div>

            {/* Верхняя белая волна */}
            <div className="absolute bottom-0 left-0 w-full">
                <div className="relative">
                    <svg
                        className="w-full animate-wave-slow"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,53.75,50,53.75S208.1,78.55,321.39,56.44Z"
                            className="fill-white opacity-50"
                        />
                    </svg>
                </div>
            </div>

            {/* Нижняя синяя волна */}
            <div className="absolute bottom-0 left-0 w-full">
                <div className="relative">
                    <svg
                        className="w-full animate-wave-fast"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                            className="fill-blue-600 opacity-70"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default AnimatedWaves;