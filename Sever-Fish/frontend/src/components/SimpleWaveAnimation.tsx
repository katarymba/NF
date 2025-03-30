import React from 'react';

interface SimpleWaveAnimationProps {
    className?: string;
}

const SimpleWaveAnimation: React.FC<SimpleWaveAnimationProps> = ({ className = '' }) => {
    return (
        <div className={`relative w-full h-24 overflow-hidden ${className}`}>
            {/* Используем один SVG элемент с точно повторяющимся паттерном */}
            <div className="absolute w-full h-full">
                <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* Определяем паттерн, который будет повторяться без видимых швов */}
                        <pattern
                            id="wavePattern"
                            x="0"
                            y="0"
                            width="1200"
                            height="120"
                            patternUnits="userSpaceOnUse"
                            patternTransform="translate(0 0)"
                        >
                            <path
                                d="M0,120 V73.71C47.79,51.51,103.59,41.54,158,45.71c70.36,5.37,136.33,33.31,206.8,37.5C438.64,87.57,512.34,66.33,583,47.95c69.27-18,138.3-24.88,209.4-13.08,36.15,6,69.85,17.84,104.45,29.34C989.49,95,1113,134.29,1200,67.53V120Z"
                                fill="#f9fafb"
                            />
                        </pattern>
                    </defs>

                    {/* Используем анимацию паттерна вместо анимации элементов */}
                    <rect
                        x="0"
                        y="0"
                        width="2400"
                        height="120"
                        fill="url(#wavePattern)"
                        className="animated-pattern"
                    />
                </svg>
            </div>

            {/* Дополнительный элемент для заполнения возможных зазоров в углах */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#f9fafb]"></div>

            {/* Добавляем стандартный тег style без атрибута jsx */}
            <style>
                {`
                @keyframes movePattern {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-1200px); }
                }

                .animated-pattern {
                    animation: movePattern 20s linear infinite;
                    animation-fill-mode: forwards;
                    transform-origin: 0 0;
                }
                `}
            </style>
        </div>
    );
};

export default SimpleWaveAnimation;