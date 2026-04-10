import en from './en';
import id from './id';

const translations = { en, id };

export function translate(key, lang = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export { en, id, translations };
