import { Search, Lightbulb, Wrench, Heart, CheckSquare, Globe, Cpu, Paperclip, Mic, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import SearchResult from "./SearchResult";

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'file';
}

interface SearchInterfaceProps {
  onSignInClick: () => void;
  showSignInPrompt?: boolean;
}

const SearchInterface = ({ onSignInClick, showSignInPrompt = true }: SearchInterfaceProps) => {
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<"search">("search");
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update query with final or interim transcript
        if (finalTranscript) {
          setQuery((prev) => prev + finalTranscript);
        } else if (interimTranscript) {
          setQuery((prev) => {
            // Remove previous interim results and add new one
            const lastSpace = prev.lastIndexOf(' ');
            const base = lastSpace >= 0 ? prev.substring(0, lastSpace + 1) : '';
            return base + interimTranscript;
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone permissions in your browser settings.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        alert('Failed to start speech recognition. Please try again.');
        setIsListening(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachedFiles((prev) => [
            ...prev,
            { file, preview: event.target?.result as string, type: 'image' },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push({ file, type: 'file' });
      }
    });
    
    if (newFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setAttachedFiles((prev) => [
              ...prev,
              { file, preview: event.target?.result as string, type: 'image' },
            ]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    if (query.trim()) {
      if (showSignInPrompt) {
        onSignInClick();
      } else {
        setSubmittedQuery(query);
        setHasSearched(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const quickActions = [
    { icon: Lightbulb, label: "Parenting" },
    { icon: Wrench, label: "Troubleshoot" },
    { icon: Heart, label: "Health" },
    { icon: CheckSquare, label: "Fact Check" },
  ];

  const trendingSearches = [
    "Meta Project Mercury research buried",
    "GPU depreciation fears AI bubble",
    "Ukraine peace talks Geneva Trump 28 point plan",
    "perimenopause hormone imbalance Alzheimer's",
    "Crimean-Congo fever vaccine breakthrough",
    "JWST finds evidence of supermassive stars",
  ];

  if (hasSearched && !showSignInPrompt) {
    return (
      <SearchResult 
        query={submittedQuery} 
        onReset={() => {
          setHasSearched(false);
          setQuery("");
        }} 
      />
    );
  }

  return (
    <div className="static w-full grow flex-col items-center justify-center md:mt-0 md:flex z-10">
      <div className="px-4 relative flex size-full flex-col justify-center md:h-auto md:px-0">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-auto group">
            <span className="text-4xl md:text-5xl font-normal text-foreground tracking-tight">Ozone</span>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="relative">
          <div className="relative rounded-2xl border border-border bg-card shadow-md">
            <div className="bg-raised w-full outline-none flex items-start border rounded-2xl dark:bg-offset duration-75 transition-all border-subtler shadow-sm dark:shadow-md shadow-super/10 dark:shadow-black/10 px-0 pt-3 pb-3 gap-y-md gap-x-2">
              {/* Input Area */}
              <div className="px-3.5 flex-1 flex flex-col">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachedFiles.map((attachment, index) => (
                      <div key={index} className="relative group">
                        {attachment.type === 'image' && attachment.preview ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                            <img src={attachment.preview} alt="Attached" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeAttachment(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
                            <Paperclip className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[100px]">{attachment.file.name}</span>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="w-4 h-4 text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="overflow-hidden relative flex h-full w-full">
                  <div className="w-full" style={{ minHeight: "3em", maxHeight: "3em" }}>
                    <div className="h-full w-full outline-none font-sans resize-none caret-super selection:bg-super/30 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super text-foreground bg-transparent placeholder-quieter placeholder:select-none scrollbar-subtle hide-scrollbar" style={{ overflow: "hidden" }}>
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        id="ask-input"
                        role="textbox"
                        spellCheck="true"
                        aria-placeholder="Ask anything. Type @ for mentions."
                        placeholder="Ask anything. Type @ for mentions."
                        className="w-full bg-transparent border-0 outline-none resize-none text-base"
                        style={{ height: "3em", minHeight: "3em", maxHeight: "3em", userSelect: "text", whiteSpace: "pre-wrap", wordBreak: "break-word", overflow: "hidden" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="gap-2 flex -ml-2 mt-2 justify-between items-center w-full pr-2">
                  <div className="gap-1 flex items-center">
                    {/* Mode Selector */}
                    <div role="radiogroup" aria-required="false" dir="ltr" data-state="closed" className="group relative isolate flex h-fit focus:outline-none" tabIndex={0} style={{ outline: "none" }}>
                      <div className="absolute inset-0 bg-primary/10 dark:bg-black/[0.18] dark:border dark:border-black/[0.04] rounded-[10px] transition-colors duration-300"></div>
                      <div className="p-0.5 flex shrink-0 items-center">
                        <span>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={selectedMode === "search"}
                            data-state={selectedMode === "search" ? "checked" : "unchecked"}
                            value="search"
                            aria-label="Search"
                            onClick={() => setSelectedMode("search")}
                            className="segmented-control group/segmented-control relative focus:outline-none"
                            tabIndex={-1}
                          >
                            <div data-state={selectedMode === "search" ? "checked" : "unchecked"} className="pointer-events-none absolute inset-0 z-0 block bg-white dark:bg-black dark:bg-gradient-to-b dark:from-primary/20 dark:to-primary/20 border-primary dark:border-primary/30 border rounded-lg shadow-primary/30 dark:shadow-primary/5 shadow-[0_1px_3px_0] dark:text-primary transition-colors duration-300 group-focus-visible/segmented-control:border-dashed" style={{ opacity: selectedMode === "search" ? 1 : 0 }}></div>
                            <div data-testid="search-mode-search">
                              <div className="relative z-10 flex h-8 min-w-9 items-center justify-center py-1 gap-1 px-2.5">
                                <Search className={`h-4 w-4 shrink-0 transition-colors duration-300 ${selectedMode === "search" ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                            </div>
                          </button>
                        </span>
                        {/* research mode removed per request */}
                        {/* removed studio mode (lightbulb) per request */}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Controls - Aligned with mode selector */}
                  <div className="flex items-center gap-1">
                    <button
                      data-testid="attach-files-button"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="focus-visible:bg-muted hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-muted font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8]"
                    >
                      <div className="flex items-center justify-center shrink-0">
                        <Paperclip className="h-4 w-4" />
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      multiple
                      onChange={handleFileSelect}
                      accept=".bash,.bat,.c,.coffee,.conf,.config,.cpp,.cs,.css,.csv,.cxx,.dart,.diff,.doc,.docx,.fish,.go,.h,.hpp,.htm,.html,.in,.ini,.ipynb,.java,.js,.json,.jsx,.ksh,.kt,.kts,.latex,.less,.log,.lua,.m,.markdown,.md,.pdf,.php,.pl,.pm,.pptx,.py,.r,.R,.rb,.rmd,.rs,.scala,.sh,.sql,.swift,.t,.tex,.text,.toml,.ts,.tsx,.txt,.xlsx,.xml,.yaml,.yml,.zsh,.jpeg,.jpg,.jpe,.jp2,.png,.gif,.bmp,.tiff,.tif,.svg,.webp,.ico,.avif,.heic,.heif"
                      type="file"
                      style={{ display: "none" }}
                    />
                    <button
                      aria-label={isListening ? "Stop dictation" : "Dictation"}
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`focus-visible:bg-muted hover:bg-muted dark:hover:bg-muted font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8] ${
                        isListening
                          ? "text-red-500 bg-red-100 dark:bg-red-900/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-state="closed"
                    >
                      <div className="flex items-center justify-center shrink-0">
                        <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
                      </div>
                    </button>
                    {/* Submit Button - Arrow Up, disabled until typing */}
                    <button
                      aria-label="Submit"
                      type="button"
                      onClick={handleSearch}
                      disabled={!query.trim()}
                      className={`font-sans focus:outline-none outline-none outline-transparent transition duration-100 ease-out select-none items-center relative group/button font-medium justify-center text-center rounded-lg active:scale-[0.97] active:duration-150 origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8] ${
                        query.trim()
                          ? "bg-primary text-primary-foreground hover:opacity-80 cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M12 19V5M5 12l7-7 7 7"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Inline Trending (no gaps) */}
                {isFocused && query === "" && (
                  <div className="w-full border-t border-border px-0 py-0 -mb-3 mt-2">
                    {trendingSearches.map((search, index) => (
                      <button
                        key={index}
                        onMouseDown={(e) => {
                          // prevent blur before click registers
                          e.preventDefault();
                          setQuery(search);
                          setIsFocused(false);
                          if (!showSignInPrompt) {
                            setSubmittedQuery(search);
                            setHasSearched(true);
                          } else {
                            onSignInClick();
                          }
                        }}
                        className="w-full text-left flex items-center gap-3 px-0 py-2.5 hover:bg-muted/40 transition-colors group"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground truncate">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Removed dropdown version to ensure seamless inline list */}
        </div>

        {/* Quick Actions */}
        <div className="relative w-full">
          <div className="mt-8 absolute w-full">
            <div className="animate-in fade-in duration-300">
              <div className="gap-4 grid grid-cols-1">
                <div className="gap-2 flex h-[32px] flex-row flex-wrap justify-center overflow-hidden">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div key={action.label} className="relative col-span-2 row-span-1">
                        <div style={{ opacity: 1, transform: "none" }}>
                          <button
                            type="button"
                            className="border border-border text-muted-foreground md:hover:border-border md:hover:text-foreground hover:bg-muted bg-background transition duration-300 ease-out rounded-lg cursor-pointer inline-flex text-sm h-8 px-2.5 items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="relative truncate text-center px-1 leading-loose -mb-px">
                              {action.label}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Prompt */}
      {showSignInPrompt && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-card border border-border rounded-xl p-5 shadow-2xl w-80">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 bg-white rounded-full shadow-sm p-1">
                  <img src="/trident.png" alt="Ozone" className="w-11 h-11 object-contain m-auto" />
                </div>
                <div className="flex-1">
                  <h3 className="font-light text-sm mb-1 text-foreground leading-tight tracking-tight">Sign up below to <span className="italic">unlock</span> the full potential of Ozone</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0 -mt-1 -mr-1"
                onClick={() => {}}
              >
                <span className="text-lg">×</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              <Button onClick={onSignInClick} className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium">
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-9 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
              
              <Button onClick={onSignInClick} variant="outline" className="w-full h-9 text-sm font-medium text-muted-foreground hover:text-foreground">
                Continue with email
              </Button>
              
              <Button onClick={onSignInClick} variant="link" className="w-full h-8 text-xs text-muted-foreground">
                Single sign-on (SSO)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
