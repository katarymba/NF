import React, { ReactNode } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        {children}
        <button className="mt-4 bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

// Добавляем экспорт DialogContent
export const DialogContent = ({ children }: { children: ReactNode }) => {
  return <div className="p-4">{children}</div>;
};

// Добавляем экспорт DialogTrigger (если нужен)
export const DialogTrigger = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white px-4 py-2 rounded">
      {children}
    </button>
  );
};
