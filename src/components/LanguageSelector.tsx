import { Languages } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../lib/i18n';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl rounded-full px-4 py-2 flex items-center gap-2 transition-all font-bold text-gray-800"
      title={language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
    >
      <Languages size={20} />
      <span className="text-sm">{language.toUpperCase()}</span>
    </button>
  );
};
