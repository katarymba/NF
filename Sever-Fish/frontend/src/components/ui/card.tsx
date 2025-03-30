import React from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-white p-6 rounded-lg shadow-lg">{children}</div>;
};

// Добавляем экспорт CardContent
export const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-4">{children}</div>;
};
