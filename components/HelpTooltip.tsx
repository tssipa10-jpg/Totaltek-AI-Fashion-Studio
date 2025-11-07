
import React, { useState } from 'react';

interface HelpTooltipProps {
  content: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        className="text-gray-400 border border-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        aria-label="Show help"
      >
        ?
      </button>
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-72 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg p-3 shadow-lg z-10 -translate-x-1/2 left-1/2">
          <div className="prose prose-sm prose-invert text-left">
            {content}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};
