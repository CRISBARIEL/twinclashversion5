import { Languages } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../lib/i18n';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'pt-BR', label: 'PT' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLabel = languages.find(l => l.code === language)?.label || 'ES';

  return (
    <div ref={dropdownRef} className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl rounded-full px-4 py-2 flex items-center gap-2 transition-all font-bold text-gray-800"
      >
        <Languages size={20} />
        <span className="text-sm">{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-[80px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors font-bold text-sm ${
                language === lang.code ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
