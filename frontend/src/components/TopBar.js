import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const TopBar = () => {
  const { t, language, setLanguage } = useLanguage();

  const languages = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  return (
    <div className="sticky top-0 bg-card border-b border-muted z-40">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-nunito font-bold text-foreground truncate">
          {t('appName')}
        </h1>
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4 text-muted-foreground mr-1" />
          {languages.map((lang) => (
            <Button
              key={lang.code}
              data-testid={`language-${lang.code}`}
              onClick={() => setLanguage(lang.code)}
              variant={language === lang.code ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs font-semibold"
            >
              {lang.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;