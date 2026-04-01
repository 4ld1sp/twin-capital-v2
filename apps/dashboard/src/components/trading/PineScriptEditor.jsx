import React, { useRef, useEffect, useState } from 'react';

const PineScriptEditor = ({ 
  value, 
  onChange, 
  placeholder = '//@version=5\nstrategy("My Strategy", overlay=true)\n...',
  language = 'pine',
  className = '',
  height = '320px'
}) => {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = (value || '').split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  // Generate line numbers
  const lineNumbers = [];
  for (let i = 1; i <= lineCount + 5; i++) {
    lineNumbers.push(<div key={i} className="h-[20px]">{i}</div>);
  }

  return (
    <div className={`relative flex rounded-2xl bg-[#0b0b14] border border-glass overflow-hidden ${className}`} style={{ height }}>
      {/* Line Numbers Gutter */}
      <div 
        ref={lineNumbersRef}
        className="w-10 px-2 py-4 bg-black/40 border-r border-white/5 text-secondary/30 font-mono text-[10px] text-right select-none pointer-events-none overflow-hidden"
      >
        <div className="flex flex-col gap-0 leading-[20px]">
          {lineNumbers}
        </div>
      </div>

      {/* Code Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        className="flex-1 px-4 py-4 bg-transparent text-[#add8e6] text-xs font-mono outline-none resize-none leading-[20px] placeholder:text-secondary/20 custom-scrollbar"
        spellCheck={false}
        wrap="off" // Preclude line wrapping to keep numbering simple/tidy
      />

      {/* Language Badge */}
      <div className="absolute top-3 right-4 px-2 py-0.5 rounded-lg bg-white/5 border border-glass text-[9px] font-black uppercase tracking-widest text-secondary pointer-events-none">
        {language === 'pine' ? 'Pine v5' : 'Python 3'}
      </div>
    </div>
  );
};

export default PineScriptEditor;
