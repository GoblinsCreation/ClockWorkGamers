import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Available languages for translation
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
];

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => Promise<string>;
  translateNode: (node: HTMLElement) => Promise<void>;
  translateAll: () => Promise<void>;
}

// Create a context for sharing the translation state
const TranslationContext = createContext<TranslationContextType | null>(null);

// Hook for accessing translation functions throughout the app
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Translation provider component
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en');
  const { toast } = useToast();
  
  // Function to translate a single text string
  const translate = async (text: string): Promise<string> => {
    if (language === 'en' || !text.trim()) return text;
    
    try {
      // In a real app, you would make an API call to a translation service
      // For this example, we'll simulate with a mock translation
      const response = await simulateTranslation(text, language);
      return response;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };
  
  // Translate the text content of a DOM node and its children
  const translateNode = async (node: HTMLElement): Promise<void> => {
    if (language === 'en') return;
    
    // Skip translating these elements
    const skipElements = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'CODE', 'PRE'];
    if (skipElements.includes(node.tagName)) return;
    
    // Check for special data attribute to skip translation
    if (node.getAttribute('data-no-translate') === 'true') return;
    
    // Process text nodes
    let childNodes = Array.from(node.childNodes);
    for (let child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        // Only translate if not already translated
        const originalText = child.textContent.trim();
        if (originalText && !node.hasAttribute('data-translated')) {
          const translated = await translate(originalText);
          if (translated !== originalText) {
            // Store original text and mark as translated
            node.setAttribute('data-original-text', originalText);
            node.setAttribute('data-translated', 'true');
            child.textContent = translated;
          }
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Recursively translate child elements
        await translateNode(child as HTMLElement);
      }
    }
  };
  
  // Translate all translatable content on the page
  const translateAll = async (): Promise<void> => {
    if (language === 'en') {
      // Revert to original text if stored
      document.querySelectorAll('[data-translated="true"]').forEach((el) => {
        const originalText = el.getAttribute('data-original-text');
        if (originalText) {
          el.textContent = originalText;
          el.removeAttribute('data-translated');
        }
      });
      return;
    }
    
    try {
      // Find all text-containing elements to translate
      const mainContent = document.querySelector('main') || document.body;
      await translateNode(mainContent as HTMLElement);
      
      toast({
        title: 'Translation Complete',
        description: `Website translated to ${LANGUAGES.find(l => l.code === language)?.name || language}`,
      });
    } catch (error) {
      console.error('Error during translation:', error);
      toast({
        title: 'Translation Error',
        description: 'Failed to translate the website content',
        variant: 'destructive',
      });
    }
  };
  
  // Apply translation when language changes
  useEffect(() => {
    if (language !== 'en') {
      translateAll();
    }
  }, [language]);
  
  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate, translateNode, translateAll }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Mock translation function (would be replaced by real API call)
async function simulateTranslation(text: string, targetLang: string): Promise<string> {
  // In a real implementation, this would call an API like Google Translate
  // For now, we'll just add a prefix to show it's "translated"
  
  const mockTranslations: Record<string, Record<string, string>> = {
    'es': {
      'Home': 'Inicio',
      'Streamers': 'Transmisores',
      'Rentals': 'Alquileres',
      'Courses': 'Cursos',
      'Games': 'Juegos',
      'Investments': 'Inversiones',
      'Contact': 'Contacto',
      'Profile': 'Perfil',
      'Chat': 'Charla',
      'Referrals': 'Referencias',
      'Logout': 'Cerrar sesión',
    },
    'fr': {
      'Home': 'Accueil',
      'Streamers': 'Streamers',
      'Rentals': 'Locations',
      'Courses': 'Cours',
      'Games': 'Jeux',
      'Investments': 'Investissements',
      'Contact': 'Contact',
      'Profile': 'Profil',
      'Chat': 'Discussion',
      'Referrals': 'Parrainages',
      'Logout': 'Déconnexion',
    },
  };
  
  // Wait a short time to simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Check if we have a mock translation for this text in this language
  if (mockTranslations[targetLang]?.[text]) {
    return mockTranslations[targetLang][text];
  }
  
  // Otherwise return with a language prefix to simulate translation
  const langPrefix = {
    'es': '[ES] ',
    'fr': '[FR] ',
    'de': '[DE] ',
    'zh': '[ZH] ',
    'ja': '[JA] ',
    'ko': '[KO] ',
    'ru': '[RU] ',
  };
  
  return `${langPrefix[targetLang as keyof typeof langPrefix] || ''}${text}`;
}

// The visible translator component
export default function WebsiteTranslator() {
  const { language, setLanguage, translateAll } = useTranslation();
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };
  
  return (
    <div className="fixed top-20 right-4 z-40">
      <div className="bg-background border rounded-lg shadow-md p-2 flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8"
          onClick={() => translateAll()}
        >
          Translate
        </Button>
      </div>
    </div>
  );
}