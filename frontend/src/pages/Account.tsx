import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { ChevronLeft, User, Settings, Calendar, Bell, GitFork, Cloud, Building, ArrowUpRight, Moon, Sun, Monitor, ChevronDown, Info } from "lucide-react";

type AccountSection = "account" | "preferences" | "tasks" | "notifications" | "connectors" | "api" | "enterprise";

// Country list for the dropdown
const countries = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" }, { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "KH", name: "Cambodia" }, { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" }, { code: "CV", name: "Cape Verde" }, { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" }, { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "DK", name: "Denmark" }, { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" }, { code: "TL", name: "East Timor" }, { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" }, { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "CI", name: "Ivory Coast" }, { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" }, { code: "XK", name: "Kosovo" }, { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" }, { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" }, { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" }, { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" },
  { code: "KP", name: "North Korea" }, { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "CG", name: "Republic of the Congo" },
  { code: "RO", name: "Romania" }, { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" }, { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" }, { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" }, { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" }, { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" }, { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" },
  { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" }, { code: "VA", name: "Vatican City" }, { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" }, { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
];

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t, languageNames, availableLanguages } = useLanguage();
  const [activeSection, setActiveSection] = useState<AccountSection>("account");
  
  // Preferences state
  const [autosuggest, setAutosuggest] = useState(true);
  const [homepageWidgets, setHomepageWidgets] = useState(true);
  const [aiDataRetention, setAiDataRetention] = useState(true);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [responseLanguageMenuOpen, setResponseLanguageMenuOpen] = useState(false);
  const [selectedResponseLanguage, setSelectedResponseLanguage] = useState(t.automatic);

  // API Group form state
  const [apiGroupName, setApiGroupName] = useState("");
  const [apiDescription, setApiDescription] = useState("");
  const [apiAddress1, setApiAddress1] = useState("");
  const [apiAddress2, setApiAddress2] = useState("");
  const [apiCity, setApiCity] = useState("");
  const [apiState, setApiState] = useState("");
  const [apiZip, setApiZip] = useState("");
  const [apiCountry, setApiCountry] = useState("US");
  const [apiFormTouched, setApiFormTouched] = useState(false);
  const [mcpOpen, setMcpOpen] = useState(false);

  // Notification settings state
  const [deepResearchNotif, setDeepResearchNotif] = useState(true);
  const [financeDigestNotif, setFinanceDigestNotif] = useState(false);
  // Connectors toggles
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [gmailEnabled, setGmailEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ozone_whatsapp_number');
    } catch (e) {
      return null;
    }
  });
  const [whatsappEditing, setWhatsappEditing] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  // Gmail connector state
  const [gmailEditing, setGmailEditing] = useState(false);
  const [gmailInput, setGmailInput] = useState('');
  const [gmailEmail, setGmailEmail] = useState<string | null>(() => {
    try { return localStorage.getItem('ozone_gmail_email'); } catch { return null; }
  });

  // Tasks
  interface ScheduledTask {
    id: string;
    connector: 'whatsapp' | 'gmail';
    to: string;
    message: string;
    scheduledAtISO: string; // ISO in UTC (actual instant)
    createdAtISO: string;
    sent?: boolean;
  }

  const [tasks, setTasks] = useState<ScheduledTask[]>(() => {
    try {
      const raw = localStorage.getItem('ozone_scheduled_tasks');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Create task form state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskMessage, setNewTaskMessage] = useState('');
  const [newTaskDatetimeLocalIST, setNewTaskDatetimeLocalIST] = useState('');
  const [newTaskConnector, setNewTaskConnector] = useState<'whatsapp' | 'gmail'>(() => (whatsappEnabled ? 'whatsapp' : (gmailEnabled ? 'gmail' : 'whatsapp')));
  const [newTaskTo, setNewTaskTo] = useState('');

  // Timers map to clear timeouts if needed
  const timersRef = useRef<Record<string, number>>({});

  // Load existing tasks and schedule timeouts on mount
  useEffect(() => {
    tasks.forEach((task) => scheduleTimeoutForTask(task));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ozone_scheduled_tasks', JSON.stringify(tasks)); } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try { if (whatsappNumber) localStorage.setItem('ozone_whatsapp_number', whatsappNumber); else localStorage.removeItem('ozone_whatsapp_number'); } catch (e) {}
  }, [whatsappNumber]);

  useEffect(() => {
    try { if (gmailEmail) localStorage.setItem('ozone_gmail_email', gmailEmail); else localStorage.removeItem('ozone_gmail_email'); } catch (e) {}
  }, [gmailEmail]);

  // helper: parse IST datetime-local string into actual UTC Date
  const parseISTDatetimeLocal = (datetimeLocal: string) => {
    // datetimeLocal expected like "2025-11-29T15:30"
    const [datePart, timePart] = datetimeLocal.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    // IST = UTC+5:30 => UTC = IST - 5.5h
    const utcTs = Date.UTC(y, m - 1, d, hh, mm) - (5.5 * 3600 * 1000);
    return new Date(utcTs);
  };

  const scheduleTimeoutForTask = (task: ScheduledTask) => {
    const scheduled = new Date(task.scheduledAtISO);
    const delay = scheduled.getTime() - Date.now();
    if (delay <= 0) {
      // overdue — send immediately
      sendTaskNow(task);
      return;
    }
    const id = window.setTimeout(() => {
      sendTaskNow(task);
    }, delay);
    timersRef.current[task.id] = id;
  };

  const sendTaskNow = async (task: ScheduledTask) => {
    console.log('[Scheduler] Sending task', task.id, task);
    if (task.connector === 'whatsapp') {
      // Attempt send via Twilio service if credentials provided via env
      const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID as string | undefined;
      const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN as string | undefined;
      const fromNumber = (import.meta.env.VITE_TWILIO_FROM_NUMBER as string | undefined) || '+14155238886';
      try {
        const mod = await import('@/lib/services/twilioService');
        const res = await mod.sendWhatsAppMessage({
          accountSid,
          authToken,
          fromNumber,
          toNumber: task.to,
          // send plain text body for now; templates (ContentSid + ContentVariables) not used here
          body: task.message,
        });
        console.log('[Scheduler] Twilio send result:', res);
      } catch (err) {
        console.error('[Scheduler] Failed to call Twilio service', err);
      }
    } else if (task.connector === 'gmail') {
      // Attempt send via Email service (e.g., SendGrid) if API key provided via env
      const apiKey = import.meta.env.VITE_SENDGRID_API_KEY as string | undefined;
      const fromEmail = (import.meta.env.VITE_EMAIL_FROM as string | undefined) || 'noreply@ozone.ai';
      try {
        const mod = await import('@/lib/services/emailService');
        const res = await mod.sendEmail({
          apiKey,
          fromEmail,
          toEmail: task.to,
          subject: `Scheduled message from Ozone`,
          content: task.message,
        });
        console.log('[Scheduler] Email send result:', res);
      } catch (err) {
        console.error('[Scheduler] Failed to call Email service', err);
      }
    } else {
      console.log('[Scheduler] Connector not supported for sending yet:', task.connector);
    }

    // mark sent locally
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, sent: true } : t));
  };

  const createScheduledTask = (connector: 'whatsapp' | 'gmail', to: string, message: string, datetimeLocalIST: string) => {
    const scheduledDate = parseISTDatetimeLocal(datetimeLocalIST);
    const task: ScheduledTask = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      connector,
      to,
      message,
      scheduledAtISO: scheduledDate.toISOString(),
      createdAtISO: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
    scheduleTimeoutForTask(task);
    console.log('[Scheduler] Task scheduled:', task);
  };

  const isApiFormValid = apiGroupName && apiDescription && apiAddress1 && apiCity && apiState && apiZip;

  const getThemeLabel = () => {
    switch (theme) {
      case "light": return t.light;
      case "dark": return t.dark;
      case "system": return `${t.systemTheme} (${resolvedTheme === "dark" ? t.dark : t.light})`;
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return Sun;
      case "dark": return Moon;
      case "system": return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getUsername = () => {
    if (user?.user_metadata?.preferred_username) return user.user_metadata.preferred_username;
    if (user?.email) return user.email.split("@")[0];
    return "user";
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user?.user_metadata?.picture) return user.user_metadata.picture;
    return null;
  };

  const getInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const menuItems = [
    { id: "account", label: t.account, icon: User },
    { id: "preferences", label: t.preferences, icon: Settings },
    { id: "tasks", label: t.tasks, icon: Calendar },
    { id: "notifications", label: t.notifications, icon: Bell },
    { id: "connectors", label: t.connectors, icon: GitFork },
  ];

  const workspaceItems = [
    { id: "api", label: t.api, icon: Cloud },
    { id: "enterprise", label: t.enterprise, icon: Building, external: true },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  return (
    <>
    <div className="grid h-screen grid-cols-1 grid-rows-[min-content_1fr] gap-2 p-2 bg-background">
      <div className="flex w-full flex-col"></div>
      <div className="flex min-h-0 rounded-md border border-border bg-background">
        {/* Left Sidebar */}
        <div className="flex flex-col gap-2 border-r py-4 w-52 border-border bg-transparent">
          {/* Back Button */}
          <div className="mb-3 ml-2 flex px-2">
            <button
              onClick={() => navigate(-1)}
              className="gap-1 hover:bg-muted px-2 py-1 pl-1 -ml-1 -mt-1 group flex items-center rounded-md duration-150"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground duration-150" />
              <span className="group-hover:text-foreground duration-150 text-sm text-muted-foreground">
                {t.back}
              </span>
            </button>
          </div>

          {/* Menu Items */}
          <div className="overflow-y-auto px-2">
            {/* Account Section */}
            <div className="flex flex-col">
              <div className="px-3 py-2 text-xs font-normal text-muted-foreground">{t.account}</div>
              <div className="w-full">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as AccountSection)}
                    className={`flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                      activeSection === item.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Workspace Section */}
            <div className="flex flex-col mt-4">
              <div className="px-3 py-2 text-xs font-normal text-muted-foreground">Workspace</div>
              <div className="w-full">
                {workspaceItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      onClick={() => !item.external && setActiveSection(item.id as AccountSection)}
                      className={`flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                        activeSection === item.id
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.external && (
                        <ArrowUpRight className="w-4 h-4 opacity-50" />
                      )}
                    </button>

                    {/* Quick MCP Server action next to API workspace item */}
                    {item.id === "api" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveSection("api"); setMcpOpen(true); }}
                        title="Open MCP Servers"
                        className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        <Cloud className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-screen-md">
            {activeSection === "account" && (
              <div className="space-y-8">
                {/* Account Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.account}</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    {/* Avatar Row */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {getAvatarUrl() ? (
                            <img
                              alt="User avatar"
                              className="w-10 h-10 rounded-full object-cover"
                              src={getAvatarUrl()!}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                              {getInitial()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-foreground">{getUserDisplayName()}</div>
                          <div className="text-xs text-muted-foreground">{getUsername()}</div>
                        </div>
                      </div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.changeAvatar}
                      </button>
                    </div>

                    {/* Full Name Row */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.fullName}</div>
                        <div className="text-xs text-muted-foreground">{getUserDisplayName()}</div>
                      </div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.changeFullName}
                      </button>
                    </div>

                    {/* Username Row */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.username}</div>
                        <div className="text-xs text-muted-foreground">{getUsername()}</div>
                      </div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.changeUsername}
                      </button>
                    </div>

                    {/* Email Row */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.email}</div>
                        <div className="text-xs text-muted-foreground">{user?.email || "Not set"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.yourSubscription}</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.unlockPro}</div>
                        <div className="text-xs text-muted-foreground">
                          Get the most out of Ozone with Pro.{" "}
                          <a href="#" className="text-primary hover:underline">{t.learnMore}</a>
                        </div>
                      </div>
                      <button onClick={() => navigate('/pricing')} className="px-3 h-8 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-80 transition-opacity">
                        {t.upgradePlan}
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.system}</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    {/* Support */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-foreground">{t.support}</div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.contact}
                      </button>
                    </div>

                    {/* Signed in as */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-foreground">{t.signedInAs} {getUsername()}</div>
                      <button
                        onClick={handleSignOut}
                        className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors"
                      >
                        {t.signOut}
                      </button>
                    </div>

                    {/* Sign out all sessions */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.signOutAllSessions}</div>
                        <div className="text-xs text-muted-foreground">{t.devicesOrBrowsers}</div>
                      </div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.signOutAllSessions}
                      </button>
                    </div>

                    {/* Delete account */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.deleteAccount}</div>
                        <div className="text-xs text-muted-foreground">{t.permanentlyDelete}</div>
                      </div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.learnMore}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Developer: MCP Servers snippet */}
                <div className="border-t border-border pt-4 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Developer — MCP Servers</h3>
                      <p className="text-xs text-muted-foreground">Provide this MCP servers configuration to developers who need direct access to your API group.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMcpOpen(!mcpOpen)}
                        className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors"
                      >
                        {mcpOpen ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {mcpOpen && (
                    <div className="flex flex-col gap-3">
                      <pre className="whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs text-foreground overflow-auto border border-border">
{(() => {
  const snippet = {
    mcp_servers: [
      {
        name: apiGroupName || "my-api-group",
        url: apiAddress1 || "https://api.example.com",
        region: apiCountry || "US",
        description: apiDescription || "",
      },
    ],
  };
  return JSON.stringify(snippet, null, 2);
})()}
                      </pre>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const snippet = {
                              mcp_servers: [
                                {
                                  name: apiGroupName || "my-api-group",
                                  url: apiAddress1 || "https://api.example.com",
                                  region: apiCountry || "US",
                                  description: apiDescription || "",
                                },
                              ],
                            };
                            try {
                              await navigator.clipboard.writeText(JSON.stringify(snippet, null, 2));
                              // optional: brief visual feedback could be added later
                            } catch (err) {
                              console.error("Copy failed", err);
                            }
                          }}
                          className="px-3 h-9 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Copy JSON
                        </button>
                        <a
                          href="/docs/developer#mcp-servers"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View docs
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeSection === "preferences" && (
              <div className="space-y-8">
                {/* Preferences Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.preferences}</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    {/* Appearance */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.appearance}</div>
                        <div className="text-xs text-muted-foreground">{t.appearanceDesc}</div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                          className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors flex items-center gap-2"
                        >
                          <ThemeIcon className="w-4 h-4" />
                          <span>{getThemeLabel()}</span>
                        </button>
                        {themeMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-background shadow-lg z-50">
                            <button
                              onClick={() => { setTheme("light"); setThemeMenuOpen(false); }}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === "light" ? "text-primary" : "text-foreground"}`}
                            >
                              <Sun className="w-4 h-4" />
                              <span>{t.light}</span>
                            </button>
                            <button
                              onClick={() => { setTheme("dark"); setThemeMenuOpen(false); }}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === "dark" ? "text-primary" : "text-foreground"}`}
                            >
                              <Moon className="w-4 h-4" />
                              <span>{t.dark}</span>
                            </button>
                            <button
                              onClick={() => { setTheme("system"); setThemeMenuOpen(false); }}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${theme === "system" ? "text-primary" : "text-foreground"}`}
                            >
                              <Monitor className="w-4 h-4" />
                              <span>{t.systemTheme}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.language}</div>
                        <div className="text-xs text-muted-foreground">{t.languageDesc}</div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                          className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors flex items-center gap-2 min-w-[140px] justify-between"
                        >
                          <span className="truncate">{languageNames[language]}</span>
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        </button>
                        {languageMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-background shadow-lg z-50 max-h-60 overflow-y-auto">
                            {availableLanguages.map((lang) => (
                              <button
                                key={lang}
                                onClick={() => handleLanguageChange(lang)}
                                className={`flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${language === lang ? "text-primary" : "text-foreground"}`}
                              >
                                {languageNames[lang]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preferred response language */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.responseLanguage}</div>
                        <div className="text-xs text-muted-foreground">{t.responseLanguageDesc}</div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setResponseLanguageMenuOpen(!responseLanguageMenuOpen)}
                          className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors flex items-center gap-2 min-w-[200px] justify-between"
                        >
                          <span className="truncate">{selectedResponseLanguage}</span>
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        </button>
                        {responseLanguageMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-border bg-background shadow-lg z-50 max-h-60 overflow-y-auto">
                            <button
                              onClick={() => { setSelectedResponseLanguage(t.automatic); setResponseLanguageMenuOpen(false); }}
                              className={`flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${selectedResponseLanguage === t.automatic ? "text-primary" : "text-foreground"}`}
                            >
                              {t.automatic}
                            </button>
                            {availableLanguages.map((lang) => (
                              <button
                                key={lang}
                                onClick={() => { setSelectedResponseLanguage(languageNames[lang]); setResponseLanguageMenuOpen(false); }}
                                className={`flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${selectedResponseLanguage === languageNames[lang] ? "text-primary" : "text-foreground"}`}
                              >
                                {languageNames[lang]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Autosuggest */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.autosuggest}</div>
                        <div className="text-xs text-muted-foreground">{t.autosuggestDesc}</div>
                      </div>
                      <button
                        onClick={() => setAutosuggest(!autosuggest)}
                        className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 ${autosuggest ? "bg-primary" : "bg-muted-foreground/30"}`}
                      >
                        <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${autosuggest ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                      </button>
                    </div>

                    {/* Homepage widgets */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.homepageWidgets}</div>
                        <div className="text-xs text-muted-foreground">{t.homepageWidgetsDesc}</div>
                      </div>
                      <button
                        onClick={() => setHomepageWidgets(!homepageWidgets)}
                        className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 ${homepageWidgets ? "bg-primary" : "bg-muted-foreground/30"}`}
                      >
                        <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${homepageWidgets ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Artificial Intelligence Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.artificialIntelligence}</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    {/* Model */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-foreground">{t.model}</div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.upgradeToChoose}
                      </button>
                    </div>

                    {/* Image generation model */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-foreground">{t.imageGenModel}</div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.upgradeToSelect}
                      </button>
                    </div>

                    {/* Video generation model */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-foreground">{t.videoGenModel}</div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.upgradeToMax}
                      </button>
                    </div>

                    {/* AI data retention */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-foreground">{t.aiDataRetention}</div>
                        <div className="text-xs text-muted-foreground">{t.aiDataRetentionDesc}</div>
                      </div>
                      <button
                        onClick={() => setAiDataRetention(!aiDataRetention)}
                        className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 ${aiDataRetention ? "bg-primary" : "bg-muted-foreground/30"}`}
                      >
                        <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${aiDataRetention ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.sidebar}</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-foreground">{t.customizeSidebar}</div>
                      <button className="px-3 h-8 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:border-muted transition-colors">
                        {t.customize}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "api" && (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="sticky top-0 z-20 w-full shrink-0 bg-background">
                  <div className="flex items-center gap-1.5 py-2">
                    <div className="mr-4 flex items-center gap-2">
                      <div className="text-base font-medium text-foreground">Create a new API Group</div>
                      <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="View API Group info">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex flex-col justify-center shrink-0 py-6">
                  {/* API Group Name */}
                  <div className="py-2">
                    <div className="mb-1 text-sm font-medium text-muted-foreground">API Group name</div>
                    <div className="w-full">
                      <div className="relative flex items-center">
                        <input
                          placeholder=""
                          required
                          value={apiGroupName}
                          onChange={(e) => { setApiGroupName(e.target.value); setApiFormTouched(true); }}
                          className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                          autoComplete="off"
                        />
                        {apiFormTouched && !apiGroupName && (
                          <div className="absolute right-3 flex items-center">
                            <div className="text-xs font-medium text-amber-500">Group name is required</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="py-2">
                    <div className="mb-1 text-sm font-medium text-muted-foreground">Description</div>
                    <div className="w-full">
                      <div className="relative flex items-center">
                        <input
                          placeholder=""
                          required
                          value={apiDescription}
                          onChange={(e) => { setApiDescription(e.target.value); setApiFormTouched(true); }}
                          className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                          autoComplete="off"
                        />
                        {apiFormTouched && !apiDescription && (
                          <div className="absolute right-3 flex items-center">
                            <div className="text-xs font-medium text-amber-500">Description is required</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="py-2">
                    <div className="mb-1 text-sm font-medium text-muted-foreground">Address Line 1</div>
                    <div className="w-full">
                      <div className="relative flex items-center">
                        <input
                          placeholder="Enter address"
                          value={apiAddress1}
                          onChange={(e) => { setApiAddress1(e.target.value); setApiFormTouched(true); }}
                          className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                          autoComplete="off"
                          type="text"
                        />
                        {apiFormTouched && !apiAddress1 && (
                          <div className="absolute right-3 flex items-center">
                            <div className="text-xs font-medium text-amber-500">Address is required</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div className="py-2">
                    <div className="mb-1 text-sm font-medium text-muted-foreground">Address Line 2</div>
                    <div className="w-full">
                      <div className="relative flex items-center">
                        <input
                          placeholder="Apartment, suite, etc."
                          value={apiAddress2}
                          onChange={(e) => setApiAddress2(e.target.value)}
                          className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                          autoComplete="off"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* City and State Grid */}
                  <div className="grid grid-cols-2 gap-4 py-2">
                    {/* City */}
                    <div>
                      <div className="mb-1 text-sm font-medium text-muted-foreground">City</div>
                      <div className="w-full">
                        <div className="relative flex items-center">
                          <input
                            placeholder="Enter city"
                            value={apiCity}
                            onChange={(e) => { setApiCity(e.target.value); setApiFormTouched(true); }}
                            className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                            autoComplete="off"
                            type="text"
                          />
                          {apiFormTouched && !apiCity && (
                            <div className="absolute right-3 flex items-center">
                              <div className="text-xs font-medium text-amber-500">City is required</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <div className="mb-1 text-sm font-medium text-muted-foreground">State</div>
                      <div className="w-full">
                        <div className="relative flex items-center">
                          <input
                            placeholder="Enter state"
                            value={apiState}
                            onChange={(e) => { setApiState(e.target.value); setApiFormTouched(true); }}
                            className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                            autoComplete="off"
                            type="text"
                          />
                          {apiFormTouched && !apiState && (
                            <div className="absolute right-3 flex items-center">
                              <div className="text-xs font-medium text-amber-500">State is required</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zip and Country Grid */}
                  <div className="grid grid-cols-2 gap-4 py-2">
                    {/* Zip */}
                    <div>
                      <div className="mb-1 text-sm font-medium text-muted-foreground">Zip</div>
                      <div className="w-full">
                        <div className="relative flex items-center">
                          <input
                            placeholder=""
                            value={apiZip}
                            onChange={(e) => { setApiZip(e.target.value); setApiFormTouched(true); }}
                            className="w-full outline-none focus:outline-none focus:ring-1 focus:ring-muted text-foreground caret-primary bg-muted dark:bg-muted/50 border-none rounded-md py-2.5 px-3 text-sm placeholder:text-muted-foreground/50 transition-all duration-200"
                            autoComplete="off"
                            type="text"
                          />
                          {apiFormTouched && !apiZip && (
                            <div className="absolute right-3 flex items-center">
                              <div className="text-xs font-medium text-amber-500">Zip is required</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <div className="mb-1 text-sm font-medium text-muted-foreground">Country</div>
                      <div className="relative flex items-center">
                        <select
                          id="country-select"
                          value={apiCountry}
                          onChange={(e) => setApiCountry(e.target.value)}
                          className="w-full appearance-none rounded-md border-none bg-muted dark:bg-muted/50 py-2.5 px-3 pr-8 text-sm text-foreground outline-none focus:outline-none focus:ring-1 focus:ring-muted transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-muted-foreground/20"
                          aria-label="Country"
                        >
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 text-muted-foreground">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-6 sticky bottom-0 z-10 bg-background">
                  <button
                    type="button"
                    onClick={() => {
                      setApiGroupName("");
                      setApiDescription("");
                      setApiAddress1("");
                      setApiAddress2("");
                      setApiCity("");
                      setApiState("");
                      setApiZip("");
                      setApiCountry("US");
                      setApiFormTouched(false);
                    }}
                    className="px-3 h-10 text-sm font-medium rounded-lg bg-muted text-foreground hover:text-muted-foreground transition-colors duration-300 cursor-pointer active:scale-[0.97] active:duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!isApiFormValid}
                    className={`px-3 h-10 text-sm font-medium rounded-lg transition-colors duration-300 ${
                      isApiFormValid
                        ? "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer active:scale-[0.97] active:duration-150"
                        : "bg-muted text-muted-foreground opacity-50 cursor-default"
                    }`}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Personalization and Assistant sections removed as requested */}

            {!( ["account","preferences","api","tasks","notifications","connectors"].includes(activeSection) ) && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p className="text-lg">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} {t.comingSoon}</p>
              </div>
            )}

            {activeSection === "connectors" && (
              <div className="space-y-8">
                {/* Installed Connectors Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-medium text-foreground">Installed Connectors</h2>
                        <p className="text-xs text-muted-foreground">Connected tools provide Ozone with richer and more accurate answers, gated by permissions you have granted.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Connect your apps to start using them with Ozone
                    </div>
                  </div>
                </div>

                {/* Browser Extension Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-medium text-foreground">Browser Extension</h2>
                        <p className="text-xs text-muted-foreground">Install the Ozone browser extension for quick access and enhanced browsing experience.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex w-full flex-wrap items-center justify-between gap-4 md:flex-nowrap">
                      <div className="flex items-center justify-center w-11 h-11 rounded-lg border border-border bg-muted shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </div>
                      <div className="grow">
                        <div className="text-base font-medium text-foreground">Ozone Browser Extension</div>
                        <div className="text-sm text-muted-foreground">Access Ozone directly from your browser toolbar</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Detect browser and open appropriate extension store
                          const userAgent = navigator.userAgent.toLowerCase();
                          let extensionUrl = '';
                          
                          if (userAgent.includes('edg/')) {
                            // Microsoft Edge
                            extensionUrl = 'https://microsoftedge.microsoft.com/addons/detail/ozone-ai/YOUR_EDGE_EXTENSION_ID';
                          } else if (userAgent.includes('firefox')) {
                            // Firefox
                            extensionUrl = 'https://addons.mozilla.org/en-US/firefox/addon/ozone-ai/';
                          } else if (userAgent.includes('chrome')) {
                            // Chrome (or Chromium-based browsers)
                            extensionUrl = 'https://chromewebstore.google.com/detail/ozone-ai/YOUR_CHROME_EXTENSION_ID';
                          } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                            // Safari
                            extensionUrl = 'https://apps.apple.com/app/ozone-ai/YOUR_SAFARI_EXTENSION_ID';
                          } else {
                            // Default to Chrome Web Store
                            extensionUrl = 'https://chromewebstore.google.com/detail/ozone-ai/YOUR_CHROME_EXTENSION_ID';
                          }
                          
                          window.open(extensionUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-3 h-8 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer active:scale-[0.97] active:duration-150"
                      >
                        Install
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available Connectors Section */}
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-medium text-foreground">Available Connectors</h2>
                        <p className="text-xs text-muted-foreground">Connect your tools to Ozone to search across them and take action. Your permissions are always respected.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6 py-4">
                    <div className="flex w-full flex-wrap items-center justify-between gap-4 md:flex-nowrap">
                      <div className="flex items-center justify-center w-11 h-11 rounded-lg border border-border bg-muted shrink-0">
                        {/* WhatsApp SVG */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
                          <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0C5.373 0 .001 4.984.001 11.14c0 1.96.51 3.87 1.48 5.57L0 24l7.6-2.01A11.86 11.86 0 0 0 12 22c6.627 0 12-4.984 12-11.14 0-2.98-1.23-5.79-3.48-7.37z" fill="currentColor" opacity="0.08"/>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.768.967-.94 1.165-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.885-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.672-1.62-.92-2.22-.242-.58-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.794.372s-1.04 1.016-1.04 2.479 1.064 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487 0 0 .9.388 1.28.296.398-.099 1.33-.543 1.52-1.067.198-.524.198-.974.138-1.069-.05-.099-.198-.149-.396-.298z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="grow">
                        <div className="text-base font-medium text-foreground">WhatsApp</div>
                        <div className="text-sm text-muted-foreground">Connect your WhatsApp account to send and receive messages through Ozone.</div>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={whatsappEnabled}
                          aria-label="Toggle WhatsApp connector"
                          onClick={() => {
                            if (!whatsappEnabled && !whatsappNumber) {
                              // open inline editor instead of prompt
                              setWhatsappInput('');
                              setWhatsappEditing(true);
                            } else {
                              setWhatsappEnabled(!whatsappEnabled);
                            }
                          }}
                          className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 cursor-pointer ${whatsappEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${whatsappEnabled ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                        </button>
                      </div>
                    </div>

                    {/* Inline editor / display for WhatsApp number */}
                    <div className="w-full">
                      {whatsappEditing ? (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="tel"
                            value={whatsappInput}
                            onChange={(e) => setWhatsappInput(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Enter phone number (country code, digits only, e.g. 917795075436)"
                            className="w-full p-2 bg-muted border border-border rounded-md"
                          />
                          <button
                            onClick={() => {
                              if (!whatsappInput.trim()) { alert('Please enter a number.'); return; }
                              setWhatsappNumber(whatsappInput.trim());
                              setWhatsappEnabled(true);
                              setWhatsappEditing(false);
                              console.log('[Connector] WhatsApp enabled for', whatsappInput.trim());
                            }}
                            className="px-3 h-9 rounded-lg bg-primary text-primary-foreground"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setWhatsappEditing(false); setWhatsappInput(''); }}
                            className="px-3 h-9 rounded-lg border border-border bg-background text-muted-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-3">
                          {whatsappNumber ? (
                            <>
                              <div className="text-sm text-muted-foreground">Number: <span className="text-foreground">+{whatsappNumber}</span></div>
                              <button onClick={() => { setWhatsappEditing(true); setWhatsappInput(whatsappNumber || ''); }} className="px-2 h-8 rounded-md border border-border text-sm">Edit</button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No number set. Enable and add one.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-wrap items-center justify-between gap-4 md:flex-nowrap">
                      <div className="flex items-center justify-center w-11 h-11 rounded-lg border border-border bg-muted shrink-0">
                        {/* Gmail SVG */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.06"/>
                          <path d="M20 8.99v8.01H4V8.99l8 5 8-5zM12 13L4 8h16l-8 5z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="grow">
                        <div className="text-base font-medium text-foreground">Gmail</div>
                        <div className="text-sm text-muted-foreground">Connect your Gmail to let Ozone send scheduled emails (read-only by default).</div>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={gmailEnabled}
                          aria-label="Toggle Gmail connector"
                          onClick={() => {
                            if (!gmailEnabled && !gmailEmail) {
                              setGmailEditing(true);
                              setGmailInput('');
                            } else {
                              setGmailEnabled(!gmailEnabled);
                            }
                          }}
                          className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 cursor-pointer ${gmailEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${gmailEnabled ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                        </button>
                      </div>
                    </div>

                    {/* Inline editor / display for Gmail address */}
                    <div className="w-full">
                      {gmailEditing ? (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="email"
                            value={gmailInput}
                            onChange={(e) => setGmailInput(e.target.value)}
                            placeholder="Enter email address (e.g. you@domain.com)"
                            className="w-full p-2 bg-muted border border-border rounded-md"
                          />
                          <button
                            onClick={() => {
                              if (!gmailInput.trim()) { alert('Please enter an email.'); return; }
                              setGmailEmail(gmailInput.trim());
                              setGmailEnabled(true);
                              setGmailEditing(false);
                              console.log('[Connector] Gmail enabled for', gmailInput.trim());
                            }}
                            className="px-3 h-9 rounded-lg bg-primary text-primary-foreground"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setGmailEditing(false); setGmailInput(''); }}
                            className="px-3 h-9 rounded-lg border border-border bg-background text-muted-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-3">
                          {gmailEmail ? (
                            <>
                              <div className="text-sm text-muted-foreground">Email: <span className="text-foreground">{gmailEmail}</span></div>
                              <button onClick={() => { setGmailEditing(true); setGmailInput(gmailEmail || ''); }} className="px-2 h-8 rounded-md border border-border text-sm">Edit</button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">No email set. Enable and add one.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "tasks" && (
              <div className="space-y-8">
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">{t.tasks}</h2>
                  </div>
                  <div className="flex flex-col items-start py-6 text-left">
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-foreground mb-0">Task Management</h3>
                          <p className="text-sm text-muted-foreground">Schedule messages to be sent through connected connectors.</p>
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                        <button
                          title="Create task"
                          onClick={() => {
                            setNewTaskConnector(whatsappEnabled ? 'whatsapp' : (gmailEnabled ? 'gmail' : 'whatsapp'));
                            setNewTaskTo(whatsappEnabled && whatsappNumber ? whatsappNumber : (gmailEnabled && gmailEmail ? gmailEmail : ''));
                            setShowCreateTask(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-primary text-primary-foreground"
                        >
                          + Add Task
                        </button>
                      </div>
                    </div>

                    {/* Tasks list */}
                    <div className="w-full space-y-3">
                      {tasks.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No scheduled tasks yet.</div>
                      ) : (
                        tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <div className="text-sm text-foreground">{task.message}</div>
                              <div className="text-xs text-muted-foreground">To: {task.to} • Scheduled: {new Date(task.scheduledAtISO).toLocaleString()}</div>
                            </div>
                            <div>
                              <div className={`text-sm ${task.sent ? 'text-green-500' : 'text-muted-foreground'}`}>{task.sent ? 'Sent' : 'Pending'}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-8">
                <div className="pb-4 flex flex-col">
                  <div className="pb-4 flex flex-col gap-1 border-b border-border">
                    <h2 className="text-base font-medium text-foreground">Email notifications</h2>
                  </div>
                  <div className="flex flex-col gap-4 py-4">
                    {/* Deep research notification */}
                    <div className="flex h-14 justify-between items-center">
                      <div className="flex flex-col justify-center">
                        <div className="text-sm text-foreground">Deep research</div>
                        <div className="text-xs text-muted-foreground">Updates when the research is complete</div>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={deepResearchNotif}
                          aria-label="Toggle notification for Deep research"
                          onClick={() => setDeepResearchNotif(!deepResearchNotif)}
                          className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 cursor-pointer ${deepResearchNotif ? "bg-primary" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${deepResearchNotif ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                        </button>
                      </div>
                    </div>

                    {/* Finance digest notification */}
                    <div className="flex h-14 justify-between items-center">
                      <div className="flex flex-col justify-center">
                        <div className="text-sm text-foreground">Finance digest</div>
                        <div className="text-xs text-muted-foreground">After market news personalized to you</div>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={financeDigestNotif}
                          aria-label="Toggle notification for Finance digest"
                          onClick={() => setFinanceDigestNotif(!financeDigestNotif)}
                          className={`relative inline-block shrink-0 rounded-full transition-colors duration-150 h-[22px] w-9 cursor-pointer ${financeDigestNotif ? "bg-primary" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`pointer-events-none absolute block rounded-full bg-white shadow-md transition-transform duration-150 size-4 top-[3px] ${financeDigestNotif ? "translate-x-[17px]" : "translate-x-[3px]"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  
    {/* Create Task Modal */}
    {showCreateTask && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-lg p-6 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-medium text-foreground mb-2">Create Scheduled Message</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Connector</label>
              <div className="mt-1">
                <select value={newTaskConnector} onChange={(e) => setNewTaskConnector(e.target.value as 'whatsapp' | 'gmail')} className="w-full p-2 bg-muted border border-border rounded-md">
                  {whatsappEnabled && <option value="whatsapp">WhatsApp</option>}
                  {gmailEnabled && <option value="gmail">Gmail</option>}
                  {!whatsappEnabled && !gmailEnabled && <option value="whatsapp">WhatsApp (enable connector first)</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">To</label>
              <div className="mt-1">
                <input
                  value={newTaskTo}
                  onChange={(e) => setNewTaskTo(e.target.value)}
                  className="w-full p-2 bg-muted border border-border rounded-md"
                  placeholder={newTaskConnector === 'whatsapp' ? 'Enter phone number (country code, e.g. 917795075436)' : 'Enter recipient email (e.g. you@domain.com)'}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Message</label>
              <div className="mt-1">
                <textarea value={newTaskMessage} onChange={(e) => setNewTaskMessage(e.target.value)} className="w-full p-2 bg-muted border border-border rounded-md" rows={4} />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Send time (IST)</label>
              <div className="mt-1">
                <input type="datetime-local" value={newTaskDatetimeLocalIST} onChange={(e) => setNewTaskDatetimeLocalIST(e.target.value)} className="w-full p-2 bg-muted border border-border rounded-md" />
                <div className="text-xs text-muted-foreground mt-1">Enter date and time in IST (India Standard Time). The scheduler will convert to UTC.</div>
              </div>
            </div>

                <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => { setShowCreateTask(false); setNewTaskMessage(''); setNewTaskDatetimeLocalIST(''); setNewTaskTo(''); }} className="px-3 h-9 rounded-lg border border-border bg-background text-muted-foreground">Cancel</button>
              <button
                onClick={() => {
                  if (newTaskConnector === 'whatsapp') {
                    if (!newTaskTo && !whatsappNumber) { alert('Please enter a WhatsApp number to send to.'); return; }
                  }
                  if (newTaskConnector === 'gmail') {
                    if (!newTaskTo && !gmailEmail) { alert('Please enter an email to send to.'); return; }
                  }
                  if (!newTaskMessage.trim() || !newTaskDatetimeLocalIST) {
                    alert('Please enter a message and time.');
                    return;
                  }
                  const to = newTaskTo || (newTaskConnector === 'whatsapp' ? whatsappNumber || '' : gmailEmail || '');
                  createScheduledTask(newTaskConnector, to, newTaskMessage.trim(), newTaskDatetimeLocalIST);
                  setShowCreateTask(false);
                  setNewTaskMessage('');
                  setNewTaskDatetimeLocalIST('');
                  setNewTaskTo('');
                }}
                className="px-3 h-9 rounded-lg bg-primary text-primary-foreground"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Account;
