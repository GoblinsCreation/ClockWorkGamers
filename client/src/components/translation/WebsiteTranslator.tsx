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
    
    // First collect all text to translate in a batch
    const textsToTranslate: {node: Node, text: string}[] = [];
    
    for (let child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        const text = child.textContent.trim();
        if (text && !node.hasAttribute('data-translated')) {
          textsToTranslate.push({node: child, text});
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Recursively translate child elements
        await translateNode(child as HTMLElement);
      }
    }
    
    // If we have any text to translate, do it all at once
    if (textsToTranslate.length > 0) {
      // In a real app with a translation API, we would batch these
      for (const item of textsToTranslate) {
        const translated = await translate(item.text);
        if (translated !== item.text) {
          // Store original text on the parent and mark as translated
          node.setAttribute('data-original-text', item.text);
          node.setAttribute('data-translated', 'true');
          
          // Safely replace text content
          if (item.node.textContent) {
            item.node.textContent = item.node.textContent.replace(item.text, translated);
          }
        }
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
  
  // Expanded mock translations for different languages
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
      'Welcome to': 'Bienvenido a',
      'Guild Highlights': 'Destacados del Gremio',
      'Join the premier Web3 gaming guild where players earn, compete, and thrive in the blockchain gaming revolution.': 
        'Únete al principal gremio de juegos Web3 donde los jugadores ganan, compiten y prosperan en la revolución de los juegos blockchain.',
      'Open Loot': 'Botín Abierto',
      'Community': 'Comunidad',
      'Boss Fighters': 'Luchadores de Jefes',
      'Showcasing our top accomplishments and achievements in the Web3 gaming space': 
        'Mostrando nuestros mejores logros y éxitos en el espacio de juegos Web3',
      'Connect Wallet': 'Conectar Billetera',
      'Sign In': 'Iniciar Sesión',
      'Live Streamers': 'Transmisores en Vivo',
      'Latest News': 'Últimas Noticias',
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
      'Welcome to': 'Bienvenue à',
      'Guild Highlights': 'Points forts de la Guilde',
      'Join the premier Web3 gaming guild where players earn, compete, and thrive in the blockchain gaming revolution.': 
        'Rejoignez la première guilde de jeu Web3 où les joueurs gagnent, rivalisent et prospèrent dans la révolution du jeu blockchain.',
      'Open Loot': 'Butin Ouvert',
      'Community': 'Communauté',
      'Boss Fighters': 'Combattants de Boss',
      'Showcasing our top accomplishments and achievements in the Web3 gaming space': 
        'Présentation de nos meilleures réalisations et accomplissements dans l\'espace de jeu Web3',
      'Connect Wallet': 'Connecter le Portefeuille',
      'Sign In': 'Se Connecter',
      'Live Streamers': 'Streamers en Direct',
      'Latest News': 'Dernières Nouvelles',
    },
    'de': {
      'Home': 'Startseite',
      'Streamers': 'Streamer',
      'Rentals': 'Vermietungen',
      'Courses': 'Kurse',
      'Games': 'Spiele',
      'Investments': 'Investitionen',
      'Contact': 'Kontakt',
      'Profile': 'Profil',
      'Chat': 'Chat',
      'Referrals': 'Empfehlungen',
      'Logout': 'Abmelden',
      'Welcome to': 'Willkommen bei',
      'Guild Highlights': 'Gildenhöhepunkte',
      'Join the premier Web3 gaming guild where players earn, compete, and thrive in the blockchain gaming revolution.': 
        'Tritt der führenden Web3-Gaming-Gilde bei, in der Spieler in der Blockchain-Gaming-Revolution verdienen, konkurrieren und gedeihen.',
      'Open Loot': 'Offene Beute',
      'Community': 'Gemeinschaft',
      'Boss Fighters': 'Boss-Kämpfer',
      'Showcasing our top accomplishments and achievements in the Web3 gaming space': 
        'Präsentation unserer Top-Leistungen und Erfolge im Web3-Gaming-Bereich',
      'Connect Wallet': 'Wallet verbinden',
      'Sign In': 'Anmelden',
      'Live Streamers': 'Live-Streamer',
      'Latest News': 'Neueste Nachrichten',
    },
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Check if we have a mock translation for this text in this language
  if (mockTranslations[targetLang]?.[text]) {
    return mockTranslations[targetLang][text];
  }
  
  // If no direct translation found in our dictionary
  // Try to find partial matches and replace them
  let translatedText = text;
  
  // Check each key in the mockTranslations for the target language
  if (mockTranslations[targetLang]) {
    const entries = Object.entries(mockTranslations[targetLang]);
    for (const [english, translated] of entries) {
      // Skip very short words to avoid replacing parts of other words
      if (english.length <= 3) continue;
      
      // Use regex with word boundaries for more accurate replacement
      const regex = new RegExp(`\\b${english}\\b`, 'g');
      translatedText = translatedText.replace(regex, translated);
    }
  }
  
  // If we actually made a translation, return it
  if (translatedText !== text) {
    return translatedText;
  }
  
  // For text we couldn't translate at all, don't add prefixes anymore
  return text;
}

// The visible translator component
export default function WebsiteTranslator() {
  const { language, setLanguage, translateAll } = useTranslation();
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };
  
  // Position it in the header area, not too far down
  return (
    <div className="fixed top-4 right-36 z-50">
      <div className="bg-[hsl(var(--cwg-dark))] border border-[hsl(var(--cwg-orange))] rounded-lg shadow-lg p-1.5 flex items-center gap-2">
        <Globe className="h-4 w-4 text-[hsl(var(--cwg-orange))]" />
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[100px] h-7 text-xs bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))]">
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
          className="h-7 text-xs bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))] hover:text-[hsl(var(--cwg-orange))] hover:border-[hsl(var(--cwg-orange))]"
          onClick={() => translateAll()}
        >
          Translate
        </Button>
      </div>
    </div>
  );
}