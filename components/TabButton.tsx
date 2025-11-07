
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, isDisabled = false }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400";
  const activeClasses = "bg-cyan-500 text-white shadow";
  const inactiveClasses = "text-gray-300 bg-gray-700 hover:bg-gray-600";
  const disabledClasses = "bg-gray-800 text-gray-500 cursor-not-allowed";

  const getClasses = () => {
    if (isDisabled) return `${baseClasses} ${disabledClasses}`;
    return isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={getClasses()}
    >
      {label}
    </button>
  );
};
