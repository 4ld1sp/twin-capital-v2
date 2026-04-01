import React, { useState, useRef, useEffect } from 'react';

const GlassSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select option...', 
  label,
  icon,
  className = '',
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
  const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;

  const filteredOptions = searchable 
    ? options.filter(opt => {
        const optLabel = typeof opt === 'object' ? opt.label : opt;
        return String(optLabel).toLowerCase().includes(search.toLowerCase());
      })
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1.5 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass text-main text-sm font-bold outline-none focus:border-primary transition-all hover:bg-white/10"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-lg text-primary">{icon}</span>}
          <span className={!value ? 'text-secondary/50' : 'text-main'}>
            {displayLabel || placeholder}
          </span>
        </div>
        <span className={`material-symbols-outlined text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d14] border border-glass rounded-xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {searchable && (
            <div className="p-2 border-b border-glass">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-glass text-main text-xs outline-none focus:border-primary/30 placeholder:text-secondary/50"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const isSelected = optValue === value;
                
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-all ${
                      isSelected ? 'bg-primary/10 text-primary' : 'text-main'
                    }`}
                  >
                    <span className="text-xs font-bold">{optLabel}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-3 text-secondary text-xs">No options found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassSelect;
