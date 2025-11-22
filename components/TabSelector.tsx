import React from 'react';
import { InputMode } from '../types';

interface TabSelectorProps {
  currentMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ currentMode, onModeChange }) => {
  const tabs = [
    { id: InputMode.FILE, label: 'رفع ملف', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
    )},
    { id: InputMode.TEXT, label: 'نص مباشر', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    )},
    { id: InputMode.LINK, label: 'رابط URL', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    )}
  ];

  return (
    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onModeChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            currentMode === tab.id
              ? 'bg-indigo-100 text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSelector;