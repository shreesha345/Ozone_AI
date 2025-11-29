import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowUpRight, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import NetworkVisualizer from './NetworkVisualizer';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  selected?: "home" | "discover" | "spaces" | "finance";
  onSelect?: (view: "home" | "discover" | "spaces" | "finance") => void;
  discoverTab?: "forYou" | "topAfekNews" | null;
  onDiscoverTabSelect?: (tab: "forYou" | "topAfekNews") => void;
  isExpanded?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSignInClick?: () => void;
  variant?: "landing" | "main";
  visualizeQuery?: string | null;
  setVisualizeQuery?: (query: string | null) => void;
}

const Sidebar = ({ selected = "home", onSelect, discoverTab, onDiscoverTabSelect, isExpanded = false, onMouseEnter, onMouseLeave, onSignInClick, variant = "main", visualizeQuery, setVisualizeQuery }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
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
  
  const getSectionTitle = () => {
    switch (selected) {
      case "home": return "Home";
      case "discover": return "Discover";
      case "spaces": return "Spaces";
      case "finance": return "Finance";
      default: return "Home";
    }
  };

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <div className="flex flex-row h-screen" onMouseLeave={onMouseLeave}>
      {/* Left Icon Bar - Always 72px */}
      <div className="w-[72px] bg-sidebar-background border-r border-sidebar-border flex flex-col py-2 z-20 relative">
        {/* Logo */}
        <div className="flex items-center justify-center w-full px-2">
          <a className="mt-2 active:ease-outExpo block duration-100 ease-out active:scale-[0.97]" href="/">
            <div className="transition-all duration-300 ease-in-out hover:opacity-80 flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm p-1">
              <img src="/trident.png" alt="Ozone" className="w-11 h-11 object-contain m-auto" />
            </div>
          </a>
        </div>



        {/* Nav Items */}
        <div className="space-y-1 flex-1">
          {/* Home Button */}
          <button data-testid="sidebar-home" className={`p-2 group flex w-full flex-col items-center justify-center gap-0.5`} onClick={() => { if (!user) { onSignInClick?.(); } else { navigate('/'); } }} type="button">
            <div className="grid size-[40px] place-items-center border-subtlest ring-subtlest divide-subtlest bg-transparent">
              <div className={`size-[90%] rounded-md duration-100 [grid-area:1/-1] group-hover:opacity-100 border-subtlest ring-subtlest divide-subtlest bg-subtle`}></div>
              <div className="relative [grid-area:1/-1]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="currentColor" className={`tabler-icon shrink-0 duration-100 group-hover:scale-110 ${selected === "home" ? "text-foreground scale-110" : "text-quiet"}`} fill="currentColor" fillRule="evenodd">
                  <path d="M10.75 2C15.5732 2 19.5 5.92675 19.5 10.75C19.5 15.5732 15.5732 19.5 10.75 19.5C10.6821 19.5 10.6162 19.4912 10.5527 19.4766C5.82138 19.3717 2 15.5082 2 10.7324C2.00004 5.88791 5.93059 2 10.75 2ZM10.75 3.75C6.88947 3.75 3.75004 6.86201 3.75 10.7324C3.75 14.6054 6.89198 17.7324 10.75 17.7324C10.8017 17.7324 10.8522 17.7375 10.9014 17.7461C14.6886 17.6651 17.75 14.5562 17.75 10.75C17.75 6.89325 14.6068 3.75 10.75 3.75ZM10.75 8.2998C12.0975 8.29984 13.2002 9.40255 13.2002 10.75C13.2002 12.0975 12.0975 13.2002 10.75 13.2002C9.4025 13.2002 8.2998 12.0975 8.2998 10.75C8.29983 9.40252 9.40252 8.2998 10.75 8.2998ZM18.8809 18.8809C19.2226 18.5392 19.7774 18.5392 20.1191 18.8809L22.3066 21.0684C22.6483 21.4101 22.6483 21.9649 22.3066 22.3066C21.9649 22.6483 21.41 22.6483 21.0684 22.3066L18.8809 20.1191C18.5392 19.7775 18.5392 19.2226 18.8809 18.8809Z"></path>
                </svg>
              </div>
            </div>
            <div className={`line-clamp-2 w-full text-ellipsis text-center leading-[1.1] font-medium font-sans text-2xs font-normal selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super ${selected === "home" ? "text-foreground" : "text-quiet"}`}>Home</div>
          </button>

          {/* Discover Button */}
          <button data-testid="sidebar-discover" className="p-2 group flex w-full flex-col items-center justify-center gap-0.5" onClick={() => !user ? onSignInClick?.() : onSelect?.("discover")} onMouseEnter={() => { onMouseEnter?.(); if (user) onSelect?.("discover"); }} type="button">
            <div className="grid size-[40px] place-items-center border-subtlest ring-subtlest divide-subtlest bg-transparent">
              <div className="size-[90%] rounded-md duration-100 [grid-area:1/-1] group-hover:opacity-100 opacity-0 border-subtlest ring-subtlest divide-subtlest bg-subtle"></div>
              <div className="relative [grid-area:1/-1]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="currentColor" className={`tabler-icon shrink-0 duration-100 group-hover:scale-110 ${selected === "discover" ? "text-foreground scale-110" : "text-quiet"}`} fill="currentColor" fillRule="evenodd">
                  <path d="M15.875 4.5C16.3582 4.5 16.75 4.89175 16.75 5.375V8.875C16.75 9.35825 16.3582 9.75 15.875 9.75H5.375C4.89175 9.75 4.5 9.35825 4.5 8.875V5.375C4.5 4.89175 4.89175 4.5 5.375 4.5H15.875ZM6.25 8H15V6.25H6.25V8ZM15.875 11.5C16.3582 11.5 16.75 11.8918 16.75 12.375C16.75 12.8582 16.3582 13.25 15.875 13.25H12.375C11.8918 13.25 11.5 12.8582 11.5 12.375C11.5 11.8918 11.8918 11.5 12.375 11.5H15.875ZM6.9502 11.5C8.29761 11.5001 9.40039 12.6028 9.40039 13.9502C9.40028 15.2975 8.29754 16.4003 6.9502 16.4004C5.60276 16.4004 4.50011 15.2976 4.5 13.9502C4.5 12.6027 5.6027 11.5 6.9502 11.5ZM15.875 15C16.3582 15 16.75 15.3918 16.75 15.875C16.75 16.3582 16.3582 16.75 15.875 16.75H12.375C11.8918 16.75 11.5 16.3582 11.5 15.875C11.5 15.3918 11.8918 15 12.375 15H15.875ZM15.875 18.5C16.3582 18.5 16.75 18.8918 16.75 19.375C16.75 19.8582 16.3582 20.25 15.875 20.25H5.375C4.89175 20.25 4.5 19.8582 4.5 19.375C4.5 18.8918 4.89175 18.5 5.375 18.5H15.875ZM17.625 1C19.0707 1 20.25 2.17925 20.25 3.625V21.1074C20.25 21.5867 20.6457 21.9824 21.125 21.9824C21.1641 21.9824 21.2025 21.9853 21.2402 21.9902C21.6659 21.9328 22 21.5651 22 21.125V3.625C22 3.14175 22.3918 2.75 22.875 2.75C23.3582 2.75 23.75 3.14175 23.75 3.625V21.125C23.75 22.5707 22.5707 23.75 21.125 23.75C21.0487 23.75 20.9749 23.7391 20.9043 23.7207C19.5612 23.6079 18.5 22.4788 18.5 21.1074V3.625C18.5 3.14575 18.1043 2.75 17.625 2.75H3.625C3.14575 2.75 2.75 3.14575 2.75 3.625V21.125C2.75 21.6043 3.14575 22 3.625 22H15.875C16.3582 22 16.75 22.3918 16.75 22.875C16.75 23.3582 16.3582 23.75 15.875 23.75H3.625C2.17925 23.75 1 22.5707 1 21.125V3.625C1 2.17925 2.17925 1 3.625 1H17.625Z"></path>
                </svg>
              </div>
            </div>
            <div className={`line-clamp-2 w-full text-ellipsis text-center leading-[1.1] font-sans text-2xs font-normal selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super ${selected === "discover" ? "text-foreground" : "text-quiet"}`}>Discover</div>
          </button>

          {/* Visualize Button */}
          <button data-testid="sidebar-visualize" className="p-2 group flex w-full flex-col items-center justify-center gap-0.5" onClick={() => !user ? onSignInClick?.() : onSelect?.("finance")} onMouseEnter={() => { onMouseEnter?.(); if (user) onSelect?.("finance"); }} type="button">
            <div className="grid size-[40px] place-items-center border-subtlest ring-subtlest divide-subtlest bg-transparent">
              <div className="size-[90%] rounded-md duration-100 [grid-area:1/-1] group-hover:opacity-100 opacity-0 border-subtlest ring-subtlest divide-subtlest bg-subtle"></div>
              <div className="relative [grid-area:1/-1]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="currentColor" className={`tabler-icon shrink-0 duration-100 group-hover:scale-110 ${selected === "finance" ? "text-foreground scale-110" : "text-quiet"}`} fill="currentColor" fillRule="evenodd">
                  <path d="M19.75 2.40015C21.1031 2.40015 22.2002 3.49724 22.2002 4.85034C22.2001 6.20335 21.103 7.30054 19.75 7.30054C19.6978 7.30054 19.6461 7.29497 19.5947 7.29175L16.8633 13.2644C16.7497 13.5124 16.5268 13.6935 16.2607 13.7537C15.9946 13.8137 15.7151 13.7461 15.5059 13.571L11.0508 9.84155L4.41309 20.7615H9.95703V14.6501C9.95703 14.1669 10.3488 13.7751 10.832 13.7751C11.3153 13.7751 11.707 14.1669 11.707 14.6501V20.7615H15.1934V16.4001C15.1934 15.9169 15.5851 15.5251 16.0684 15.5251C16.5515 15.5253 16.9434 15.917 16.9434 16.4001V20.7615H19.582C20.0647 20.7615 20.4569 20.3691 20.457 19.8865V10.2683C20.457 9.78506 20.8488 9.39331 21.332 9.39331C21.8153 9.39331 22.207 9.78506 22.207 10.2683V19.8865C22.2069 21.3356 21.0312 22.5115 19.582 22.5115H3.83203C2.47323 22.5115 1.355 21.4776 1.2207 20.1541L1.20703 19.8865V5.90015C1.20703 4.4509 2.38278 3.27515 3.83203 3.27515H14.332C14.8153 3.27515 15.207 3.6669 15.207 4.15015C15.207 4.6334 14.8153 5.02515 14.332 5.02515H3.83203C3.34928 5.02515 2.95703 5.4174 2.95703 5.90015V19.7849L10.084 8.06421L10.1377 7.98511C10.2721 7.81016 10.4695 7.69148 10.6895 7.65503C10.9409 7.61358 11.1981 7.68387 11.3936 7.84741L15.749 11.4929L18.002 6.56616C17.568 6.12417 17.2999 5.51865 17.2998 4.85034C17.2998 3.49726 18.3969 2.40017 19.75 2.40015Z"></path>
                </svg>
              </div>
            </div>
            <div className={`line-clamp-2 w-full text-ellipsis text-center leading-[1.1] font-sans text-2xs font-normal selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super ${selected === "finance" ? "text-foreground" : "text-quiet"}`}>Visualize</div>
          </button>
        </div>

        {/* Bottom Account & Extra Actions */}
        <div className="pb-2 gap-3 mt-auto flex w-full flex-col items-center [&>*]:w-full">
          {variant === 'main' ? (
            <>
              {/* Account Button */}
              <div className="relative inline-flex justify-center duration-150 hover:opacity-80">
                <button
                  className="inline-flex appearance-none flex-col items-center justify-center group"
                  onClick={() => setAccountMenuOpen(o => !o)}
                  type="button"
                >
                  <div className="relative">
                    <div className="flex size-8 items-center justify-center rounded-full bg-subtler overflow-hidden">
                      {getAvatarUrl() ? (
                        <img alt="User avatar" className="size-full object-cover" src={getAvatarUrl()!} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm">
                          {getInitial()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronDown className="size-3 text-quiet" />
                    </div>
                  </div>
                  <div className="text-center font-sans text-xs font-normal text-quiet mt-1">Account</div>
                </button>
                {accountMenuOpen && (
                  <div className="absolute left-[72px] bottom-0 mb-2 shadow-md rounded-xl border border-sidebar-border bg-sidebar-background p-2 w-56 animate-fade-in z-50">
                    <div className="max-h-[80vh] overflow-y-auto flex flex-col">
                      <div className="flex flex-col gap-0" role="menu">
                        {[
                          { label: 'Account', icon: '#pplx-icon-user-circle', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Preferences', icon: '#pplx-icon-adjustments', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Personalization', icon: '#pplx-icon-toggle-right', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Assistant', icon: '#pplx-icon-mail', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Tasks', icon: '#pplx-icon-calendar-time', dot: true, action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Notifications', icon: '#pplx-icon-bell', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Connectors', icon: '#pplx-icon-git-fork', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'API', icon: '#pplx-icon-cloud-data-connection', action: () => { setAccountMenuOpen(false); navigate('/account'); } },
                          { label: 'Pro Perks', icon: '#pplx-icon-heart-handshake' },
                          { label: 'All settings', icon: '#pplx-icon-settings', action: () => { setAccountMenuOpen(false); navigate('/account'); } }
                        ].map(item => (
                          <button
                            key={item.label}
                            className="flex items-center w-full gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-sidebar-accent transition-colors text-sm"
                            type="button"
                            onClick={item.action}
                          >
                            <svg role="img" className="inline-flex fill-current size-4 opacity-90" width="16" height="16">
                              <use xlinkHref={item.icon}></use>
                            </svg>
                            <span className="flex-1 text-foreground text-[13px]">{item.label}</span>
                            {item.dot && <span className="size-2 rounded-full bg-primary"></span>}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-sidebar-border mt-2 pt-2 flex flex-col gap-1">
                        <button type="button" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sm">
                          <div className="flex items-center justify-center size-6 rounded-full overflow-hidden">
                            {getAvatarUrl() ? (
                              <img alt="User avatar" className="size-full object-cover" src={getAvatarUrl()!} referrerPolicy="no-referrer" />
                            ) : (
                              <div className="size-full flex items-center justify-center bg-primary text-primary-foreground font-medium text-xs">
                                {getInitial()}
                              </div>
                            )}
                          </div>
                          <span className="flex-1 text-foreground text-[13px] truncate">{getUsername()}</span>
                          <svg role="img" className="inline-flex fill-current size-4 text-primary" width="16" height="16"><use xlinkHref="#pplx-icon-check" /></svg>
                        </button>
                        <button type="button" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sm">
                          <div className="flex items-center justify-center size-6 rounded-full border bg-transparent text-foreground">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.1927 4.54688C11.4375 4.71875 11.651 4.86458 12 4.86458C12.3453 4.86458 12.5529 4.72184 12.7993 4.55235L12.8073 4.54688L12.8084 4.54609C13.152 4.31187 13.5635 4.03125 14.5 4.03125C16.0885 4.03125 17.2083 6.30729 17.9375 8.6875C20.401 9.14062 22 9.875 22 10.6979C22 11.4427 20.6979 12.1094 18.6354 12.5677C18.6562 12.776 18.6667 12.9844 18.6667 13.1979C18.6667 14.0833 18.4948 14.9271 18.1823 15.6979H18.1965C17.2165 18.1697 14.8115 19.9169 12 19.9169C9.18854 19.9169 6.78355 18.1697 5.80356 15.6979H5.81771C5.50521 14.9271 5.33333 14.0833 5.33333 13.1979C5.33333 12.9844 5.34375 12.776 5.36458 12.5677C3.30208 12.1094 2 11.4427 2 10.6979C2 9.875 3.59896 9.14062 6.0625 8.6875C6.79167 6.30729 7.91146 4.03125 9.5 4.03125C10.4365 4.03125 10.848 4.31187 11.1916 4.54609L11.1927 4.54688ZM14.2708 15.6979H14.9167C16.0677 15.6979 17 14.7656 17 13.6146V12.8646C15.5312 13.0781 13.8229 13.1979 12 13.1979C10.1771 13.1979 8.46875 13.0781 7 12.8646V13.6146C7 14.7656 7.93229 15.6979 9.08333 15.6979H9.73437C10.5885 15.6979 11.3542 15.1458 11.625 14.3333C11.7448 13.9687 12.2604 13.9687 12.3802 14.3333C12.651 15.1458 13.4115 15.6979 14.2708 15.6979Z" /></svg>
                          </div>
                          <span className="flex-1 text-foreground text-[13px]">Incognito</span>
                        </button>
                      </div>
                      <div className="border-t border-sidebar-border mt-2 pt-2 grid grid-cols-3 gap-1">
                        <button 
                          type="button" 
                          className="text-[11px] px-2 py-1 rounded-md bg-subtle hover:bg-sidebar-accent text-quiet hover:text-foreground transition-colors"
                          onClick={() => { setAccountMenuOpen(false); navigate('/account'); }}
                        >
                          Account
                        </button>
                        <button 
                          type="button" 
                          className="text-[11px] px-2 py-1 rounded-md bg-subtle hover:bg-sidebar-accent text-quiet hover:text-foreground transition-colors"
                          onClick={() => { setAccountMenuOpen(false); navigate('/pricing'); }}
                        >
                          Upgrade
                        </button>
                        <button type="button" className="text-[11px] px-2 py-1 rounded-md bg-subtle hover:bg-sidebar-accent text-quiet hover:text-foreground transition-colors">
                          Install
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upgrade Button */}
              <button 
                className="group inline-flex appearance-none flex-col items-center justify-center" 
                type="button"
                onClick={() => navigate('/pricing')}
              >
                <div className="flex size-8 items-center justify-center rounded-full duration-100 group-hover:opacity-80 border border-sidebar-border bg-subtle">
                  <ArrowUpRight className="size-4 text-foreground" />
                </div>
                <div className="text-center font-sans text-xs font-normal text-quiet mt-1">Upgrade</div>
              </button>

              {/* Install Button */}
              <button 
                className="group inline-flex appearance-none flex-col items-center justify-center" 
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/ozoneai-extension.zip';
                  link.download = 'ozoneai-extension.zip';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <div className="flex size-8 items-center justify-center rounded-full duration-100 group-hover:opacity-80 bg-subtle relative">
                  <Download className="size-4 text-foreground" />
                  <div className="absolute -right-1 -top-1 p-0.5 bg-sidebar-background rounded-full">
                    <div className="size-2 rounded-full bg-red-500"></div>
                  </div>
                </div>
                <div className="text-center font-sans text-xs font-normal text-quiet mt-1">Install</div>
              </button>
            </>
          ) : (
            <button
              onClick={onSignInClick}
              className="group inline-flex appearance-none flex-col items-center justify-center hover:opacity-80"
              type="button"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-subtle border border-sidebar-border">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" x2="3" y1="12" y2="12"/>
                </svg>
              </div>
              <div className="text-center font-sans text-xs font-normal text-quiet mt-1">Sign In</div>
            </button>
          )}
        </div>
      </div>

      {/* Right Expanded Content Panel */}
      {isExpanded && (
        <div className="bg-sidebar-background border-r border-sidebar-border px-4 py-3 w-48 overflow-y-auto flex flex-col">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">{getSectionTitle()}</h2>
            <button className="text-quiet hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          {/* Section Content */}
          {selected === "home" && (
            <div className="space-y-1">
            </div>
          )}

          {selected === "discover" && (
            <div className="space-y-1">
              <div 
                className={`flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-sidebar-accent rounded-md cursor-pointer ${discoverTab === "forYou" ? "text-foreground bg-sidebar-accent" : "text-quiet hover:text-foreground"}`}
                onClick={() => onDiscoverTabSelect?.("forYou")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>For You</span>
              </div>
              <div 
                className={`flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-sidebar-accent rounded-md cursor-pointer ${discoverTab === "topAfekNews" ? "text-foreground bg-sidebar-accent" : "text-quiet hover:text-foreground"}`}
                onClick={() => onDiscoverTabSelect?.("topAfekNews")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                </svg>
                <span>Top AFEK News</span>
              </div>
            </div>
          )}

          {/* Shared search history array and rendering */}
          {(() => {
            const searchHistory = [
              'Meta Project Mercury research buried',
              'GPU depreciation fears AI bubble',
              'Ukraine peace talks Geneva Trump 28 point plan',
              'Perimenopause hormone imbalance Alzheimer\'s',
              'Crimean-Congo fever vaccine breakthrough',
              'JWST finds evidence of supermassive stars'
            ];
            const renderSearchHistory = (
              <div className="mt-3 space-y-0.5">
                <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Search History</h3>
                    {searchHistory.map(item => (
                  <div key={item} className="flex items-center gap-2 px-2 py-1.5 text-xs text-quiet hover:text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer" onClick={() => setVisualizeQuery?.(item)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span className="truncate" title={item}>{item}</span>
                  </div>
                  ))}
              </div>
            );
            if (selected === "spaces") {
              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                    </svg>
                    <span>Welcome</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-quiet hover:text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer">
                    <span className="text-lg">+</span>
                    <span>Create a Space</span>
                  </div>
                  {renderSearchHistory}
                </div>
              );
            }
            if (selected === "finance") {
              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span>Portfolio</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-quiet hover:text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    <span>Markets</span>
                  </div>
                  {renderSearchHistory}
                </div>
              );
            }
            return null;
          })()}

          {selected === "finance" && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>Portfolio</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-quiet hover:text-foreground hover:bg-sidebar-accent rounded-md cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Markets</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

