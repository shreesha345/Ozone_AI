import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ko" | "hi";

interface Translations {
  // Navigation
  home: string;
  discover: string;
  spaces: string;
  finance: string;
  account: string;
  preferences: string;
  personalization: string;
  assistant: string;
  tasks: string;
  notifications: string;
  connectors: string;
  api: string;
  enterprise: string;
  back: string;
  upgrade: string;
  install: string;
  
  // Account page
  fullName: string;
  username: string;
  email: string;
  changeAvatar: string;
  changeFullName: string;
  changeUsername: string;
  yourSubscription: string;
  unlockPro: string;
  learnMore: string;
  upgradePlan: string;
  system: string;
  support: string;
  contact: string;
  signedInAs: string;
  signOut: string;
  signOutAllSessions: string;
  devicesOrBrowsers: string;
  deleteAccount: string;
  permanentlyDelete: string;
  
  // Preferences
  appearance: string;
  appearanceDesc: string;
  language: string;
  languageDesc: string;
  responseLanguage: string;
  responseLanguageDesc: string;
  autosuggest: string;
  autosuggestDesc: string;
  homepageWidgets: string;
  homepageWidgetsDesc: string;
  artificialIntelligence: string;
  model: string;
  imageGenModel: string;
  videoGenModel: string;
  aiDataRetention: string;
  aiDataRetentionDesc: string;
  sidebar: string;
  customizeSidebar: string;
  customize: string;
  upgradeToChoose: string;
  upgradeToSelect: string;
  upgradeToMax: string;
  
  // Theme
  light: string;
  dark: string;
  systemTheme: string;
  
  // Common
  default: string;
  automatic: string;
  comingSoon: string;
  settings: string;
}

const translations: Record<Language, Translations> = {
  en: {
    home: "Home",
    discover: "Discover",
    spaces: "Spaces",
    finance: "Finance",
    account: "Account",
    preferences: "Preferences",
    personalization: "Personalization",
    assistant: "Assistant",
    tasks: "Tasks",
    notifications: "Notifications",
    connectors: "Connectors",
    api: "API",
    enterprise: "Enterprise",
    back: "Back",
    upgrade: "Upgrade",
    install: "Install",
    fullName: "Full Name",
    username: "Username",
    email: "Email",
    changeAvatar: "Change avatar",
    changeFullName: "Change full name",
    changeUsername: "Change username",
    yourSubscription: "Your Subscription",
    unlockPro: "Unlock the most powerful search experience with Ozone Pro",
    learnMore: "Learn more",
    upgradePlan: "Upgrade plan",
    system: "System",
    support: "Support",
    contact: "Contact",
    signedInAs: "You are signed in as",
    signOut: "Sign out",
    signOutAllSessions: "Sign out of all sessions",
    devicesOrBrowsers: "Devices or browsers where you are signed in",
    deleteAccount: "Delete account",
    permanentlyDelete: "Permanently delete your account and data",
    appearance: "Appearance",
    appearanceDesc: "How Ozone looks on your device",
    language: "Language",
    languageDesc: "The language used in the user interface",
    responseLanguage: "Preferred response language",
    responseLanguageDesc: "The language used for AI responses",
    autosuggest: "Autosuggest",
    autosuggestDesc: "Enable dropdown and tab-complete suggestions while typing a query",
    homepageWidgets: "Homepage widgets",
    homepageWidgetsDesc: "Enable personalized widgets on the homepage",
    artificialIntelligence: "Artificial Intelligence",
    model: "Model",
    imageGenModel: "Image generation model",
    videoGenModel: "Video generation model",
    aiDataRetention: "AI data retention",
    aiDataRetentionDesc: "AI Data Retention allows Ozone to use your searches to improve AI models. Turn this setting off if you wish to exclude your data from this process.",
    sidebar: "Sidebar",
    customizeSidebar: "Customize sidebar items",
    customize: "Customize",
    upgradeToChoose: "Upgrade to choose",
    upgradeToSelect: "Upgrade to select",
    upgradeToMax: "Upgrade to Max",
    light: "Light",
    dark: "Dark",
    systemTheme: "System",
    default: "Default",
    automatic: "Automatic (detect input)",
    comingSoon: "settings coming soon...",
    settings: "Settings",
  },
  es: {
    home: "Inicio",
    discover: "Descubrir",
    spaces: "Espacios",
    finance: "Finanzas",
    account: "Cuenta",
    preferences: "Preferencias",
    personalization: "Personalización",
    assistant: "Asistente",
    tasks: "Tareas",
    notifications: "Notificaciones",
    connectors: "Conectores",
    api: "API",
    enterprise: "Empresa",
    back: "Atrás",
    upgrade: "Mejorar",
    install: "Instalar",
    fullName: "Nombre completo",
    username: "Usuario",
    email: "Correo",
    changeAvatar: "Cambiar avatar",
    changeFullName: "Cambiar nombre",
    changeUsername: "Cambiar usuario",
    yourSubscription: "Tu suscripción",
    unlockPro: "Desbloquea la experiencia de búsqueda más potente con Ozone Pro",
    learnMore: "Más información",
    upgradePlan: "Mejorar plan",
    system: "Sistema",
    support: "Soporte",
    contact: "Contactar",
    signedInAs: "Has iniciado sesión como",
    signOut: "Cerrar sesión",
    signOutAllSessions: "Cerrar todas las sesiones",
    devicesOrBrowsers: "Dispositivos o navegadores donde has iniciado sesión",
    deleteAccount: "Eliminar cuenta",
    permanentlyDelete: "Eliminar permanentemente tu cuenta y datos",
    appearance: "Apariencia",
    appearanceDesc: "Cómo se ve Ozone en tu dispositivo",
    language: "Idioma",
    languageDesc: "El idioma usado en la interfaz",
    responseLanguage: "Idioma de respuesta preferido",
    responseLanguageDesc: "El idioma usado para respuestas de IA",
    autosuggest: "Autosugerencia",
    autosuggestDesc: "Habilitar sugerencias mientras escribes",
    homepageWidgets: "Widgets de inicio",
    homepageWidgetsDesc: "Habilitar widgets personalizados en inicio",
    artificialIntelligence: "Inteligencia Artificial",
    model: "Modelo",
    imageGenModel: "Modelo de generación de imágenes",
    videoGenModel: "Modelo de generación de video",
    aiDataRetention: "Retención de datos IA",
    aiDataRetentionDesc: "La retención de datos permite a Ozone usar tus búsquedas para mejorar modelos de IA.",
    sidebar: "Barra lateral",
    customizeSidebar: "Personalizar elementos",
    customize: "Personalizar",
    upgradeToChoose: "Mejorar para elegir",
    upgradeToSelect: "Mejorar para seleccionar",
    upgradeToMax: "Mejorar a Max",
    light: "Claro",
    dark: "Oscuro",
    systemTheme: "Sistema",
    default: "Predeterminado",
    automatic: "Automático (detectar entrada)",
    comingSoon: "configuración próximamente...",
    settings: "Configuración",
  },
  fr: {
    home: "Accueil",
    discover: "Découvrir",
    spaces: "Espaces",
    finance: "Finance",
    account: "Compte",
    preferences: "Préférences",
    personalization: "Personnalisation",
    assistant: "Assistant",
    tasks: "Tâches",
    notifications: "Notifications",
    connectors: "Connecteurs",
    api: "API",
    enterprise: "Entreprise",
    back: "Retour",
    upgrade: "Améliorer",
    install: "Installer",
    fullName: "Nom complet",
    username: "Utilisateur",
    email: "E-mail",
    changeAvatar: "Changer l'avatar",
    changeFullName: "Changer le nom",
    changeUsername: "Changer l'utilisateur",
    yourSubscription: "Votre abonnement",
    unlockPro: "Débloquez l'expérience de recherche la plus puissante avec Ozone Pro",
    learnMore: "En savoir plus",
    upgradePlan: "Améliorer le plan",
    system: "Système",
    support: "Support",
    contact: "Contact",
    signedInAs: "Vous êtes connecté en tant que",
    signOut: "Déconnexion",
    signOutAllSessions: "Déconnecter toutes les sessions",
    devicesOrBrowsers: "Appareils ou navigateurs où vous êtes connecté",
    deleteAccount: "Supprimer le compte",
    permanentlyDelete: "Supprimer définitivement votre compte et vos données",
    appearance: "Apparence",
    appearanceDesc: "Comment Ozone apparaît sur votre appareil",
    language: "Langue",
    languageDesc: "La langue utilisée dans l'interface",
    responseLanguage: "Langue de réponse préférée",
    responseLanguageDesc: "La langue utilisée pour les réponses IA",
    autosuggest: "Suggestion automatique",
    autosuggestDesc: "Activer les suggestions lors de la saisie",
    homepageWidgets: "Widgets d'accueil",
    homepageWidgetsDesc: "Activer les widgets personnalisés",
    artificialIntelligence: "Intelligence Artificielle",
    model: "Modèle",
    imageGenModel: "Modèle de génération d'images",
    videoGenModel: "Modèle de génération vidéo",
    aiDataRetention: "Rétention des données IA",
    aiDataRetentionDesc: "La rétention des données permet à Ozone d'utiliser vos recherches pour améliorer les modèles IA.",
    sidebar: "Barre latérale",
    customizeSidebar: "Personnaliser les éléments",
    customize: "Personnaliser",
    upgradeToChoose: "Améliorer pour choisir",
    upgradeToSelect: "Améliorer pour sélectionner",
    upgradeToMax: "Améliorer vers Max",
    light: "Clair",
    dark: "Sombre",
    systemTheme: "Système",
    default: "Par défaut",
    automatic: "Automatique (détecter l'entrée)",
    comingSoon: "paramètres bientôt disponibles...",
    settings: "Paramètres",
  },
  de: {
    home: "Startseite",
    discover: "Entdecken",
    spaces: "Bereiche",
    finance: "Finanzen",
    account: "Konto",
    preferences: "Einstellungen",
    personalization: "Personalisierung",
    assistant: "Assistent",
    tasks: "Aufgaben",
    notifications: "Benachrichtigungen",
    connectors: "Verbindungen",
    api: "API",
    enterprise: "Unternehmen",
    back: "Zurück",
    upgrade: "Upgrade",
    install: "Installieren",
    fullName: "Vollständiger Name",
    username: "Benutzername",
    email: "E-Mail",
    changeAvatar: "Avatar ändern",
    changeFullName: "Namen ändern",
    changeUsername: "Benutzernamen ändern",
    yourSubscription: "Ihr Abonnement",
    unlockPro: "Schalten Sie das leistungsstärkste Sucherlebnis mit Ozone Pro frei",
    learnMore: "Mehr erfahren",
    upgradePlan: "Plan upgraden",
    system: "System",
    support: "Support",
    contact: "Kontakt",
    signedInAs: "Sie sind angemeldet als",
    signOut: "Abmelden",
    signOutAllSessions: "Alle Sitzungen abmelden",
    devicesOrBrowsers: "Geräte oder Browser, bei denen Sie angemeldet sind",
    deleteAccount: "Konto löschen",
    permanentlyDelete: "Konto und Daten dauerhaft löschen",
    appearance: "Erscheinung",
    appearanceDesc: "Wie Ozone auf Ihrem Gerät aussieht",
    language: "Sprache",
    languageDesc: "Die in der Benutzeroberfläche verwendete Sprache",
    responseLanguage: "Bevorzugte Antwortsprache",
    responseLanguageDesc: "Die für KI-Antworten verwendete Sprache",
    autosuggest: "Automatische Vorschläge",
    autosuggestDesc: "Dropdown-Vorschläge beim Tippen aktivieren",
    homepageWidgets: "Startseiten-Widgets",
    homepageWidgetsDesc: "Personalisierte Widgets aktivieren",
    artificialIntelligence: "Künstliche Intelligenz",
    model: "Modell",
    imageGenModel: "Bildgenerierungsmodell",
    videoGenModel: "Videogenerierungsmodell",
    aiDataRetention: "KI-Datenspeicherung",
    aiDataRetentionDesc: "Die Datenspeicherung ermöglicht Ozone, Ihre Suchen zur Verbesserung von KI-Modellen zu verwenden.",
    sidebar: "Seitenleiste",
    customizeSidebar: "Elemente anpassen",
    customize: "Anpassen",
    upgradeToChoose: "Upgrade zum Auswählen",
    upgradeToSelect: "Upgrade zum Selektieren",
    upgradeToMax: "Upgrade auf Max",
    light: "Hell",
    dark: "Dunkel",
    systemTheme: "System",
    default: "Standard",
    automatic: "Automatisch (Eingabe erkennen)",
    comingSoon: "Einstellungen demnächst...",
    settings: "Einstellungen",
  },
  zh: {
    home: "首页",
    discover: "发现",
    spaces: "空间",
    finance: "财经",
    account: "账户",
    preferences: "偏好设置",
    personalization: "个性化",
    assistant: "助手",
    tasks: "任务",
    notifications: "通知",
    connectors: "连接器",
    api: "API",
    enterprise: "企业版",
    back: "返回",
    upgrade: "升级",
    install: "安装",
    fullName: "全名",
    username: "用户名",
    email: "邮箱",
    changeAvatar: "更换头像",
    changeFullName: "更改全名",
    changeUsername: "更改用户名",
    yourSubscription: "您的订阅",
    unlockPro: "使用 Ozone Pro 解锁最强大的搜索体验",
    learnMore: "了解更多",
    upgradePlan: "升级计划",
    system: "系统",
    support: "支持",
    contact: "联系",
    signedInAs: "您已登录为",
    signOut: "退出登录",
    signOutAllSessions: "退出所有会话",
    devicesOrBrowsers: "您已登录的设备或浏览器",
    deleteAccount: "删除账户",
    permanentlyDelete: "永久删除您的账户和数据",
    appearance: "外观",
    appearanceDesc: "Ozone 在您设备上的显示方式",
    language: "语言",
    languageDesc: "用户界面使用的语言",
    responseLanguage: "首选回复语言",
    responseLanguageDesc: "AI 回复使用的语言",
    autosuggest: "自动建议",
    autosuggestDesc: "输入时启用下拉建议",
    homepageWidgets: "首页小部件",
    homepageWidgetsDesc: "启用个性化小部件",
    artificialIntelligence: "人工智能",
    model: "模型",
    imageGenModel: "图像生成模型",
    videoGenModel: "视频生成模型",
    aiDataRetention: "AI 数据保留",
    aiDataRetentionDesc: "数据保留允许 Ozone 使用您的搜索来改进 AI 模型。",
    sidebar: "侧边栏",
    customizeSidebar: "自定义侧边栏项目",
    customize: "自定义",
    upgradeToChoose: "升级以选择",
    upgradeToSelect: "升级以选择",
    upgradeToMax: "升级到 Max",
    light: "浅色",
    dark: "深色",
    systemTheme: "系统",
    default: "默认",
    automatic: "自动（检测输入）",
    comingSoon: "设置即将推出...",
    settings: "设置",
  },
  ja: {
    home: "ホーム",
    discover: "発見",
    spaces: "スペース",
    finance: "ファイナンス",
    account: "アカウント",
    preferences: "設定",
    personalization: "パーソナライズ",
    assistant: "アシスタント",
    tasks: "タスク",
    notifications: "通知",
    connectors: "コネクタ",
    api: "API",
    enterprise: "エンタープライズ",
    back: "戻る",
    upgrade: "アップグレード",
    install: "インストール",
    fullName: "氏名",
    username: "ユーザー名",
    email: "メール",
    changeAvatar: "アバターを変更",
    changeFullName: "氏名を変更",
    changeUsername: "ユーザー名を変更",
    yourSubscription: "サブスクリプション",
    unlockPro: "Ozone Pro で最強の検索体験をアンロック",
    learnMore: "詳細",
    upgradePlan: "プランをアップグレード",
    system: "システム",
    support: "サポート",
    contact: "お問い合わせ",
    signedInAs: "ログイン中：",
    signOut: "ログアウト",
    signOutAllSessions: "すべてのセッションからログアウト",
    devicesOrBrowsers: "ログインしているデバイスまたはブラウザ",
    deleteAccount: "アカウントを削除",
    permanentlyDelete: "アカウントとデータを完全に削除",
    appearance: "外観",
    appearanceDesc: "デバイスでの Ozone の表示方法",
    language: "言語",
    languageDesc: "ユーザーインターフェースで使用される言語",
    responseLanguage: "優先応答言語",
    responseLanguageDesc: "AI 応答に使用される言語",
    autosuggest: "オートサジェスト",
    autosuggestDesc: "入力中にドロップダウン候補を有効にする",
    homepageWidgets: "ホームページウィジェット",
    homepageWidgetsDesc: "パーソナライズされたウィジェットを有効にする",
    artificialIntelligence: "人工知能",
    model: "モデル",
    imageGenModel: "画像生成モデル",
    videoGenModel: "動画生成モデル",
    aiDataRetention: "AIデータ保持",
    aiDataRetentionDesc: "データ保持により、Ozone は検索を使用して AI モデルを改善できます。",
    sidebar: "サイドバー",
    customizeSidebar: "サイドバー項目をカスタマイズ",
    customize: "カスタマイズ",
    upgradeToChoose: "アップグレードして選択",
    upgradeToSelect: "アップグレードして選択",
    upgradeToMax: "Max にアップグレード",
    light: "ライト",
    dark: "ダーク",
    systemTheme: "システム",
    default: "デフォルト",
    automatic: "自動（入力を検出）",
    comingSoon: "設定は近日公開...",
    settings: "設定",
  },
  ko: {
    home: "홈",
    discover: "탐색",
    spaces: "스페이스",
    finance: "금융",
    account: "계정",
    preferences: "환경설정",
    personalization: "개인화",
    assistant: "어시스턴트",
    tasks: "작업",
    notifications: "알림",
    connectors: "커넥터",
    api: "API",
    enterprise: "엔터프라이즈",
    back: "뒤로",
    upgrade: "업그레이드",
    install: "설치",
    fullName: "이름",
    username: "사용자명",
    email: "이메일",
    changeAvatar: "아바타 변경",
    changeFullName: "이름 변경",
    changeUsername: "사용자명 변경",
    yourSubscription: "구독",
    unlockPro: "Ozone Pro로 가장 강력한 검색 경험을 잠금 해제하세요",
    learnMore: "자세히",
    upgradePlan: "플랜 업그레이드",
    system: "시스템",
    support: "지원",
    contact: "문의",
    signedInAs: "로그인 중:",
    signOut: "로그아웃",
    signOutAllSessions: "모든 세션에서 로그아웃",
    devicesOrBrowsers: "로그인된 기기 또는 브라우저",
    deleteAccount: "계정 삭제",
    permanentlyDelete: "계정과 데이터를 영구적으로 삭제",
    appearance: "모양",
    appearanceDesc: "기기에서 Ozone이 표시되는 방식",
    language: "언어",
    languageDesc: "사용자 인터페이스에서 사용되는 언어",
    responseLanguage: "선호 응답 언어",
    responseLanguageDesc: "AI 응답에 사용되는 언어",
    autosuggest: "자동 제안",
    autosuggestDesc: "입력 시 드롭다운 제안 활성화",
    homepageWidgets: "홈페이지 위젯",
    homepageWidgetsDesc: "개인화된 위젯 활성화",
    artificialIntelligence: "인공지능",
    model: "모델",
    imageGenModel: "이미지 생성 모델",
    videoGenModel: "비디오 생성 모델",
    aiDataRetention: "AI 데이터 보존",
    aiDataRetentionDesc: "데이터 보존을 통해 Ozone은 검색을 사용하여 AI 모델을 개선할 수 있습니다.",
    sidebar: "사이드바",
    customizeSidebar: "사이드바 항목 사용자 지정",
    customize: "사용자 지정",
    upgradeToChoose: "업그레이드하여 선택",
    upgradeToSelect: "업그레이드하여 선택",
    upgradeToMax: "Max로 업그레이드",
    light: "라이트",
    dark: "다크",
    systemTheme: "시스템",
    default: "기본값",
    automatic: "자동 (입력 감지)",
    comingSoon: "설정 준비 중...",
    settings: "설정",
  },
  hi: {
    home: "होम",
    discover: "खोजें",
    spaces: "स्पेस",
    finance: "वित्त",
    account: "खाता",
    preferences: "प्राथमिकताएं",
    personalization: "वैयक्तिकरण",
    assistant: "सहायक",
    tasks: "कार्य",
    notifications: "सूचनाएं",
    connectors: "कनेक्टर",
    api: "API",
    enterprise: "एंटरप्राइज़",
    back: "वापस",
    upgrade: "अपग्रेड",
    install: "इंस्टॉल",
    fullName: "पूरा नाम",
    username: "उपयोगकर्ता नाम",
    email: "ईमेल",
    changeAvatar: "अवतार बदलें",
    changeFullName: "पूरा नाम बदलें",
    changeUsername: "उपयोगकर्ता नाम बदलें",
    yourSubscription: "आपकी सदस्यता",
    unlockPro: "Ozone Pro के साथ सबसे शक्तिशाली खोज अनुभव अनलॉक करें",
    learnMore: "और जानें",
    upgradePlan: "प्लान अपग्रेड करें",
    system: "सिस्टम",
    support: "सहायता",
    contact: "संपर्क",
    signedInAs: "के रूप में साइन इन:",
    signOut: "साइन आउट",
    signOutAllSessions: "सभी सत्रों से साइन आउट",
    devicesOrBrowsers: "जहां आपने साइन इन किया है वे डिवाइस या ब्राउज़र",
    deleteAccount: "खाता हटाएं",
    permanentlyDelete: "अपना खाता और डेटा स्थायी रूप से हटाएं",
    appearance: "दिखावट",
    appearanceDesc: "आपके डिवाइस पर Ozone कैसा दिखता है",
    language: "भाषा",
    languageDesc: "यूजर इंटरफेस में प्रयुक्त भाषा",
    responseLanguage: "पसंदीदा प्रतिक्रिया भाषा",
    responseLanguageDesc: "AI प्रतिक्रियाओं के लिए प्रयुक्त भाषा",
    autosuggest: "ऑटो सुझाव",
    autosuggestDesc: "टाइप करते समय ड्रॉपडाउन सुझाव सक्षम करें",
    homepageWidgets: "होमपेज विजेट",
    homepageWidgetsDesc: "वैयक्तिकृत विजेट सक्षम करें",
    artificialIntelligence: "कृत्रिम बुद्धिमत्ता",
    model: "मॉडल",
    imageGenModel: "छवि जनरेशन मॉडल",
    videoGenModel: "वीडियो जनरेशन मॉडल",
    aiDataRetention: "AI डेटा प्रतिधारण",
    aiDataRetentionDesc: "डेटा प्रतिधारण Ozone को AI मॉडल सुधारने के लिए आपकी खोजों का उपयोग करने की अनुमति देता है।",
    sidebar: "साइडबार",
    customizeSidebar: "साइडबार आइटम कस्टमाइज़ करें",
    customize: "कस्टमाइज़",
    upgradeToChoose: "चुनने के लिए अपग्रेड करें",
    upgradeToSelect: "चयन के लिए अपग्रेड करें",
    upgradeToMax: "Max में अपग्रेड करें",
    light: "लाइट",
    dark: "डार्क",
    systemTheme: "सिस्टम",
    default: "डिफ़ॉल्ट",
    automatic: "स्वचालित (इनपुट का पता लगाएं)",
    comingSoon: "सेटिंग्स जल्द आ रही हैं...",
    settings: "सेटिंग्स",
  },
};

const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  hi: "हिन्दी",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languageNames: Record<Language, string>;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("language") as Language;
    return stored || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  const t = translations[language];
  const availableLanguages = Object.keys(translations) as Language[];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export type { Language };
