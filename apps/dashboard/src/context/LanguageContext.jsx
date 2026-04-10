import React, { createContext, useContext, useState, useCallback } from 'react';
import { translate } from '../i18n';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTrans() {
  const { lang } = useContext(LanguageContext);
  return useCallback((key) => translate(key, lang), [lang]);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('tc_lang') || 'en';
  });

  const toggleLanguage = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'id' : 'en';
      localStorage.setItem('tc_lang', next);
      return next;
    });
  };

  const setLanguage = (newLang) => {
    localStorage.setItem('tc_lang', newLang);
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t: (key) => translate(key, lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}
