import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translation object - in a real app, this would be more comprehensive
const translations: Record<Language, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'buy': 'Buy vGold',
    'earn': 'Earn',
    'borrow': 'Borrow',
    'portfolio': 'Portfolio',
    'connect_wallet': 'Connect Wallet',
    'algo_price': 'ALGO Price',
    'language': 'Language',
    'digital_gold': 'Digital Gold',
    'real_value': 'Real Value',
    'goldchain_description': 'GoldChain makes gold accessible to everyone. Buy, lend, and borrow digital gold (vGold) backed by real physical gold reserves.',
    'experience_benefits': 'Experience all the benefits of gold ownership without the hassle of storage and security.',
  },
  es: {
    'dashboard': 'Panel',
    'buy': 'Comprar vGold',
    'earn': 'Ganar',
    'borrow': 'Prestar',
    'portfolio': 'Portafolio',
    'connect_wallet': 'Conectar Billetera',
    'algo_price': 'Precio ALGO',
    'language': 'Idioma',
    'digital_gold': 'Oro Digital',
    'real_value': 'Valor Real',
    'goldchain_description': 'GoldChain hace que el oro sea accesible para todos. Compra, presta y toma prestado oro digital (vGold) respaldado por reservas de oro físico real.',
    'experience_benefits': 'Experimenta todos los beneficios de la propiedad del oro sin las molestias del almacenamiento y la seguridad.',
  },
  fr: {
    'dashboard': 'Tableau de bord',
    'buy': 'Acheter vGold',
    'earn': 'Gagner',
    'borrow': 'Emprunter',
    'portfolio': 'Portefeuille',
    'connect_wallet': 'Connecter le portefeuille',
    'algo_price': 'Prix ALGO',
    'language': 'Langue',
    'digital_gold': 'Or Numérique',
    'real_value': 'Valeur Réelle',
    'goldchain_description': 'GoldChain rend l\'or accessible à tous. Achetez, prêtez et empruntez de l\'or numérique (vGold) soutenu par de vraies réserves d\'or physique.',
    'experience_benefits': 'Profitez de tous les avantages de la propriété de l\'or sans les tracas du stockage et de la sécurité.',
  },
  de: {
    'dashboard': 'Dashboard',
    'buy': 'vGold kaufen',
    'earn': 'Verdienen',
    'borrow': 'Leihen',
    'portfolio': 'Portfolio',
    'connect_wallet': 'Wallet verbinden',
    'algo_price': 'ALGO Preis',
    'language': 'Sprache',
    'digital_gold': 'Digitales Gold',
    'real_value': 'Echter Wert',
    'goldchain_description': 'GoldChain macht Gold für alle zugänglich. Kaufen, verleihen und leihen Sie digitales Gold (vGold), das durch echte physische Goldreserven gedeckt ist.',
    'experience_benefits': 'Erleben Sie alle Vorteile des Goldbesitzes ohne die Unannehmlichkeiten von Lagerung und Sicherheit.',
  },
  zh: {
    'dashboard': '仪表板',
    'buy': '购买vGold',
    'earn': '赚取',
    'borrow': '借贷',
    'portfolio': '投资组合',
    'connect_wallet': '连接钱包',
    'algo_price': 'ALGO价格',
    'language': '语言',
    'digital_gold': '数字黄金',
    'real_value': '真实价值',
    'goldchain_description': 'GoldChain让每个人都能获得黄金。购买、借出和借入由真实实物黄金储备支持的数字化黄金(vGold)。',
    'experience_benefits': '体验黄金所有权的所有好处，无需存储和安全的麻烦。',
  },
  ja: {
    'dashboard': 'ダッシュボード',
    'buy': 'vGoldを購入',
    'earn': '稼ぐ',
    'borrow': '借りる',
    'portfolio': 'ポートフォリオ',
    'connect_wallet': 'ウォレットを接続',
    'algo_price': 'ALGO価格',
    'language': '言語',
    'digital_gold': 'デジタルゴールド',
    'real_value': '真の価値',
    'goldchain_description': 'GoldChainは、誰でも金にアクセスできるようにします。本物の物理的金準備に裏打ちされたデジタル金(vGold)を購入、貸出、借入してください。',
    'experience_benefits': '保管とセキュリティの面倒なしに、金所有のすべての利点を体験してください。',
  },
  ko: {
    'dashboard': '대시보드',
    'buy': 'vGold 구매',
    'earn': '벌기',
    'borrow': '빌리기',
    'portfolio': '포트폴리오',
    'connect_wallet': '지갑 연결',
    'algo_price': 'ALGO 가격',
    'language': '언어',
    'digital_gold': '디지털 골드',
    'real_value': '진짜 가치',
    'goldchain_description': 'GoldChain은 모든 사람이 금에 접근할 수 있게 합니다. 실제 물리적 금 준비금으로 뒷받침되는 디지털 금(vGold)을 구매, 대출, 차용하세요.',
    'experience_benefits': '보관과 보안의 번거로움 없이 금 소유의 모든 이점을 경험하세요.',
  },
  ar: {
    'dashboard': 'لوحة التحكم',
    'buy': 'شراء vGold',
    'earn': 'كسب',
    'borrow': 'اقتراض',
    'portfolio': 'المحفظة',
    'connect_wallet': 'ربط المحفظة',
    'algo_price': 'سعر ALGO',
    'language': 'اللغة',
    'digital_gold': 'الذهب الرقمي',
    'real_value': 'القيمة الحقيقية',
    'goldchain_description': 'GoldChain يجعل الذهب في متناول الجميع. اشترِ، أقرض، واستعر الذهب الرقمي (vGold) المدعوم باحتياطيات ذهب مادية حقيقية.',
    'experience_benefits': 'استمتع بجميع فوائد امتلاك الذهب دون عناء التخزين والأمان.',
  },
};

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
};

const languageFlags: Record<Language, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { languageNames, languageFlags };

