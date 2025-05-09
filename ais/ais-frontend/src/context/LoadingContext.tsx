import React, { createContext, useContext, useState, ReactNode } from 'react';
// Импортируем GIF-анимацию
import fishGif from '../assets/images/340.gif';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => {
    setIsLoading(true);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="flex items-center justify-center">
            <img 
              src={fishGif} 
              alt="" 
              style={{ width: '60px' }} // Еще меньший размер
              className="opacity-80" // Добавим небольшую прозрачность
            />
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading должен использоваться внутри LoadingProvider');
  }
  return context;
};