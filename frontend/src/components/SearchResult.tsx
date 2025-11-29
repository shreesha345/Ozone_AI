import { MOCK_SOURCES, getFaviconUrl } from "./sourcesData";
import SourcesModal from "./SourcesModal";
import { useEffect, useState, useRef } from "react";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Share2, Search, ArrowUp, Mic, Globe, Cpu, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultProps {
  query: string;
  onReset: () => void;
}

interface ServerMessage {
  timestamp: string;
  type: 'info' | 'step' | 'search' | 'claim' | 'claim_start' | 'source' | 'bias' | 'media' | 'verdict' | 'result' | 'error';
  message: string;
  data: any;
}

interface ModelInfo {
  model: string;
  provider: string;
  temperature: number;
}

interface AnalysisRequest {
  input: string;
  store_in_neo4j: boolean;
}

const SearchResult = ({ query, onReset }: SearchResultProps) => {
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState("");
  const [currentStepNumber, setCurrentStepNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [queryExpanded, setQueryExpanded] = useState(false);
  const [sources, setSources] = useState<Array<{url: string, title: string, domain: string}>>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [fullResult, setFullResult] = useState<{analysis: any, report: any} | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only connect once when component mounts
    if (wsRef.current) {
      console.log('⚠️ WebSocket already exists, skipping reconnection');
      return;
    }

    console.log('🚀 Starting WebSocket connection for query:', query);
    setIsConnecting(true);
    setConnectionError(null);
    setDisplayedAnswer("");
    setIsComplete(false);
    setAnalysisLogs([]);
    setCurrentStep("Connecting to analysis server...");

    const SERVER_URL = 'ws://localhost:8000/ws/analyze';
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket Connected!');
      setIsConnecting(false);
      setCurrentStep("Connected. Sending analysis request...");
      
      const payload: AnalysisRequest = {
        input: query,
        store_in_neo4j: false
      };
      
      console.log('📤 Sending Request:', JSON.stringify(payload, null, 2));
      ws.send(JSON.stringify(payload));
    };

    ws.onmessage = (event) => {
      try {
        const response: ServerMessage = JSON.parse(event.data);
        handleMessage(response);
      } catch (err) {
        console.error('❌ Failed to parse message:', err);
        setAnalysisLogs(prev => [...prev, `❌ Parse Error: ${err}`]);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
      setConnectionError('Failed to connect to analysis server. Make sure the server is running on localhost:8000');
      setIsConnecting(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket Disconnected');
      if (!isComplete) {
        setCurrentStep("Connection closed");
      }
    };

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, []); // Empty dependency array - only run once on mount

  const handleMessage = (msg: ServerMessage) => {
    const time = msg.timestamp.split('T')[1]?.split('.')[0] || 'N/A';
    
    switch (msg.type) {
      case 'info':
        console.log(`[${time}] ℹ️  ${msg.message}`);
        setAnalysisLogs(prev => [...prev, `[${time}] ℹ️  ${msg.message}`]);
        
        // Capture model info if present
        if (msg.data?.model && msg.data?.provider) {
          setModelInfo({
            model: msg.data.model,
            provider: msg.data.provider,
            temperature: msg.data.temperature || 0
          });
        }
        break;
        
      case 'step':
        console.log(`\n[${time}] 👣 STEP: ${msg.message}`);
        // Extract step number like [1/6]
        const stepMatch = msg.message.match(/\[(\d+\/\d+)\]/);
        if (stepMatch) {
          setCurrentStepNumber(stepMatch[1]);
          setCurrentStep(msg.message.replace(/\[\d+\/\d+\]\s*/, ''));
        } else {
          setCurrentStep(msg.message);
        }
        setAnalysisLogs(prev => [...prev, `[${time}] 👣 STEP: ${msg.message}`]);
        if (msg.data?.status === 'complete') {
          console.log('        ✅ Complete');
          setAnalysisLogs(prev => [...prev, '        ✅ Complete']);
        }
        break;
        
      case 'search':
        const srcCount = msg.data?.sources ? msg.data.sources.length : 0;
        console.log(`[${time}] 🔍 SEARCH: "${msg.data?.query}" (${srcCount} sources found)`);
        setAnalysisLogs(prev => [...prev, `[${time}] 🔍 SEARCH: "${msg.data?.query}" (${srcCount} sources)`]);
        
        // Add search query
        if (msg.data?.query) {
          setSearchQueries(prev => [...prev, msg.data.query]);
          setIsSearching(true);
        }
        
        // Add sources
        if (msg.data?.sources && Array.isArray(msg.data.sources)) {
          const newSources = msg.data.sources.map((src: any) => ({
            url: src.url || src.link || '',
            title: src.title || src.snippet || 'Untitled',
            domain: new URL(src.url || src.link || 'https://example.com').hostname.replace('www.', '')
          }));
          setSources(prev => [...prev, ...newSources]);
        }
        break;
        
      case 'claim_start':
        console.log(`[${time}] 🧪 VERIFYING: ${msg.data?.id}`);
        setAnalysisLogs(prev => [...prev, `[${time}] 🧪 VERIFYING: ${msg.data?.id}`]);
        break;
        
      case 'claim':
        const statusIcon = msg.data?.status === 'VERIFIED' ? '✅' : 
                          msg.data?.status === 'DEBUNKED' ? '❌' : '⚠️';
        console.log(`[${time}]    ${statusIcon} CLAIM RESULT (${msg.data?.id}): ${msg.data?.status}`);
        console.log(`        Confidence: ${msg.data?.confidence}`);
        if (msg.data?.note) console.log(`        Note: ${msg.data.note}`);
        setAnalysisLogs(prev => [
          ...prev, 
          `[${time}]    ${statusIcon} CLAIM: ${msg.data?.status} (Confidence: ${msg.data?.confidence})`
        ]);
        break;
        
      case 'source':
      case 'bias':
      case 'media':
        console.log(`[${time}] 📊 ${msg.type.toUpperCase()}: ${msg.message}`);
        setAnalysisLogs(prev => [...prev, `[${time}] 📊 ${msg.type.toUpperCase()}: ${msg.message}`]);
        break;
        
      case 'verdict':
        console.log(`\n[${time}] ⚖️  FINAL VERDICT: ${msg.message}`);
        setAnalysisLogs(prev => [...prev, `[${time}] ⚖️  FINAL VERDICT: ${msg.message}`]);
        setDisplayedAnswer(prev => prev + `\n\n**Final Verdict:** ${msg.message}\n`);
        break;
        
      case 'result':
        console.log(`\n[${time}] 🎉 ANALYSIS COMPLETE!`);
        console.log('-----------------------------------');
        console.log('Full Result Data:');
        console.log(JSON.stringify(msg.data, null, 2));
        console.log('-----------------------------------');
        
        setAnalysisLogs(prev => [...prev, `[${time}] 🎉 ANALYSIS COMPLETE!`]);
        setCurrentStep("Analysis complete!");
        
        // Parse the result - check both possible structures
        const result = msg.data?.result;
        const analysis = result?.analysis || result;
        const report = result?.report;
        
        console.log('Parsed Analysis:', analysis);
        console.log('Parsed Report:', report);
        
        // Store full result for rendering
        setFullResult({ analysis, report });
        
        setIsComplete(true);
        if (wsRef.current) {
          wsRef.current.close();
        }
        break;
        
      case 'error':
        console.error(`\n[${time}] ⛔ ERROR: ${msg.message}`);
        setAnalysisLogs(prev => [...prev, `[${time}] ⛔ ERROR: ${msg.message}`]);
        setConnectionError(msg.message);
        setIsComplete(true);
        if (wsRef.current) {
          wsRef.current.close();
        }
        break;
        
      default:
        console.log(`[${time}] 📨 ${msg.type}: ${msg.message}`);
        setAnalysisLogs(prev => [...prev, `[${time}] 📨 ${msg.type}: ${msg.message}`]);
    }
  };

  const handleFollowUp = () => {
    if (followUpQuery.trim()) {
      // For now, just reset and search again with the new query
      // In a real app, this would add to conversation history
      onReset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFollowUp();
    }
  };

  const isLongQuery = query.length > 200;

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-6 py-6 animate-in fade-in duration-500">
      {/* Query Header - Perplexity Style with Collapsible */}
      <div className="mb-6">
        <div className="relative min-w-0 flex-1">
          <div className="group/title relative inline-flex flex-col w-full">
            <div 
              className="relative overflow-hidden" 
              style={{ 
                maskImage: !queryExpanded && isLongQuery ? 'linear-gradient(black 70%, transparent 97%)' : 'none',
                WebkitMaskImage: !queryExpanded && isLongQuery ? 'linear-gradient(black 70%, transparent 97%)' : 'none'
              }}
            >
              <div style={{ height: !queryExpanded && isLongQuery ? '144px' : 'auto' }}>
                <div>
                  <div 
                    className="overflow-hidden" 
                    style={{ 
                      maxHeight: !queryExpanded && isLongQuery ? '144px' : 'none',
                      opacity: 1 
                    }}
                  >
                    <h1 className="group/query relative whitespace-pre-line break-words font-sans text-pretty font-medium text-foreground selection:bg-primary/50 selection:text-foreground">
                      <div className="text-foreground block h-auto w-full resize-none appearance-none overflow-hidden bg-transparent focus:outline-none font-sans font-medium">
                        <div className="overflow-hidden relative flex h-full w-full pb-3">
                          <div className="w-full" style={{ minHeight: '0em' }}>
                            <div 
                              className="overflow-auto outline-none font-sans resize-none text-foreground bg-transparent size-full"
                              style={{ 
                                userSelect: 'text', 
                                whiteSpace: 'pre-wrap', 
                                wordBreak: 'break-word',
                                maxHeight: !queryExpanded && isLongQuery ? '45vh' : 'none'
                              }}
                            >
                              <p className="leading-relaxed">
                                <span>{query}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Show More Button */}
            {isLongQuery && (
              <div className="relative flex mt-1">
                <div className="-mt-0.5 -ml-2">
                  <button 
                    type="button"
                    onClick={() => setQueryExpanded(!queryExpanded)}
                    className="select-none font-semibold font-sans text-center items-center justify-center leading-loose whitespace-nowrap text-muted-foreground h-6 text-xs cursor-pointer inline-flex hover:text-foreground hover:bg-muted/50 px-2 rounded-md transition-colors"
                  >
                    <span className="pr-1">{queryExpanded ? 'Show less' : 'Show more'}</span>
                    <div className="ml-1 flex items-center">
                      <svg 
                        className={`inline-flex fill-current transition-transform ${queryExpanded ? 'rotate-180' : ''}`}
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status and Sources */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-full">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : connectionError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
            <span className="text-xs">{isConnecting ? 'Connecting...' : connectionError ? 'Connection Error' : isComplete ? 'Complete' : 'Analyzing...'}</span>
          </div>
          
          {/* Model Info Badge */}
          {modelInfo && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                <Cpu className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {modelInfo.model}
                </span>
                <span className="text-xs text-primary/70">
                  ({modelInfo.provider})
                </span>
              </div>
            </>
          )}
          
          {!connectionError && sources.length > 0 && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <button
                className="flex items-center gap-1.5 group px-2.5 py-1 rounded-full border border-border/50 bg-background hover:bg-muted/50 transition-all shadow-sm hover:shadow"
                onClick={() => setModalOpen(true)}
                aria-label="Show sources"
              >
                <div className="flex -space-x-1.5">
                  {sources.slice(0, 4).map((src, i) => (
                    <span
                      key={src.url}
                      className="inline-block rounded-full border border-background bg-white w-5 h-5 flex items-center justify-center overflow-hidden shadow-sm"
                      style={{ zIndex: 10 - i }}
                    >
                      <img
                        src={getFaviconUrl(src.url)}
                        alt={src.domain + ' favicon'}
                        className="w-3.5 h-3.5"
                      />
                    </span>
                  ))}
                </div>
                <span className="text-xs font-normal text-muted-foreground group-hover:text-foreground transition">
                  {sources.length} sources
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Working Indicator - Perplexity Style */}
      {!isComplete && !connectionError && (
        <div className="gap-y-4 mt-4 flex flex-col mb-6">
          <div className="gap-2 flex flex-col">
            <div className="relative flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex w-fit items-center gap-1 cursor-pointer select-none font-sans text-sm text-muted-foreground">
                <div className="gap-x-2 flex items-center">
                  <div className="gap-x-1 flex items-center">
                    <div className="-ml-px inline-flex h-0 w-5 items-center justify-center">
                      <div className="text-foreground flex shrink-0 items-center justify-start overflow-hidden opacity-75" style={{ height: '18px', aspectRatio: '1 / 1' }}>
                        <div className="h-full w-auto shrink-0">
                          <div className="w-2 h-2 border-2 border-primary/70 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-0.5 whitespace-nowrap">
                      <div className="animate-pulse">Working…</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step Timeline */}
            <div className="relative z-0 flex flex-col">
              <div className="relative pl-px">
                <div className="group/goal relative flex overflow-hidden gap-[7px]">
                  <div className="flex">
                    <span className="relative flex w-[15px] shrink-0 flex-col items-center">
                      <span className="w-px border-l border-border/50 h-[13px]"></span>
                      <div style={{ transform: 'scale(1.1)' }}>
                        <div className="bg-background">
                          <div className="relative">
                            <div className="shrink-0 rounded-full border border-orange-500 bg-orange-500" style={{ width: '7px', height: '7px' }}></div>
                            <div className="border-orange-500 absolute left-0 top-0 animate-ping rounded-full border-2 opacity-75" style={{ width: '7px', height: '7px' }}></div>
                          </div>
                        </div>
                      </div>
                      <span className="w-px border-l border-border/50 grow"></span>
                    </span>
                  </div>
                  <div className="min-w-0 grow">
                    <div className="flex flex-col">
                      <span className="flex grow overflow-hidden py-[6px]">
                        <span className="pr-2 block font-sans text-sm text-muted-foreground">
                          <div className="relative">
                            {currentStepNumber && <span className="font-medium">[{currentStepNumber}] </span>}
                            {currentStep || 'Processing...'}
                          </div>
                        </span>
                      </span>
                      
                      {/* Search Queries */}
                      {searchQueries.length > 0 && (
                        <div className="pb-4 gap-y-2 flex w-full flex-col">
                          <div className="mt-1.5">
                            <div className="gap-2 group flex cursor-pointer flex-col mb-2">
                              <div className="flex items-center gap-1 py-1.5 font-sans text-xs font-normal text-muted-foreground">
                                <span className="animate-pulse">Searching</span>
                              </div>
                            </div>
                            <div className="gap-2 flex flex-wrap">
                              {searchQueries.map((q, idx) => (
                                <div key={idx} className="inline-flex">
                                  <div className="py-1 inline-block rounded-lg px-2 border border-border/50 bg-muted/30">
                                    <div className="gap-x-1 flex items-center font-mono text-xs text-foreground">
                                      <Search className="w-3.5 h-3.5 shrink-0" />
                                      <p className="px-1">{q}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Error */}
      {connectionError && (
        <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-destructive text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-destructive mb-1">Connection Error</p>
              <p className="text-sm text-muted-foreground/80">{connectionError}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Make sure your backend server is running on localhost:8000</p>
            </div>
          </div>
        </div>
      )}

      {/* Sources Review Section - Perplexity Style */}
      {sources.length > 0 && !connectionError && (
        <div className="mb-6">
          <div className="gap-2 group flex cursor-pointer flex-col mb-2">
            <div className="flex items-center gap-1 py-1.5 font-sans text-xs font-normal text-primary">
              <span className="animate-gradient bg-clip-text text-transparent" style={{ background: 'linear-gradient(90deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Reviewing sources · {sources.length}
              </span>
            </div>
          </div>
          <div className="relative isolate flex flex-col gap-1.5 overflow-hidden rounded-xl border shadow-sm border-border/50 bg-card">
            <div className="flex flex-col gap-0">
              <div className="flex min-w-0 grow flex-col gap-1.5">
                <div className="relative bg-transparent">
                  <div className="flex-col relative flex overflow-y-auto pl-3 pr-1 pb-2 pt-2" style={{ maxHeight: '250px' }}>
                    <div className="flex flex-col gap-px">
                      <div className="mb-2 last:mb-0">
                        <div className="flex items-center flex-col items-start gap-px">
                          {sources.slice(0, 15).map((src, idx) => (
                            <div key={idx} className="w-full" style={{ opacity: 1 }}>
                              <a className="-ml-1 block" rel="noopener nofollow" target="_blank" href={src.url}>
                                <div className="hover:bg-muted/40 relative flex min-w-0 cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5">
                                  <div className="mt-0.5 shrink-0 font-sans text-sm text-foreground">
                                    <div className="flex size-4 items-center justify-center">
                                      <div className="relative shrink-0 overflow-hidden rounded-full" style={{ width: '16px', height: '16px' }}>
                                        <div className="absolute inset-0 bg-white rounded-full"></div>
                                        <img className="relative block" alt={src.domain + ' favicon'} width="16" height="16" src={getFaviconUrl(src.url)} style={{ width: '16px', height: '16px' }} />
                                        <div className="absolute inset-0 border border-black/10 rounded-full"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="gap-2 flex min-w-0 flex-1 items-start">
                                    <div className="flex min-w-0 flex-1 flex-col">
                                      <span className="min-w-0 shrink truncate break-words font-sans text-sm text-foreground">
                                        {src.title}
                                      </span>
                                    </div>
                                    <span className="mt-px break-words text-right lowercase font-mono text-xs text-muted-foreground">
                                      {src.domain}
                                    </span>
                                  </div>
                                </div>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 z-20 h-3 w-full bg-gradient-to-t from-card to-transparent"></div>
          </div>
        </div>
      )}



      {/* Answer Section - Rendered Result */}
      {fullResult ? (
        <div className="mb-8 space-y-6">
          {/* Verdict Card */}
          {fullResult.analysis?.final_verdict && (
            <div className="border border-border rounded-xl p-6 bg-card">
              <div className="flex items-start gap-4">
                {/* Score Circle */}
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - fullResult.analysis.final_verdict.overall_score / 100)}`}
                        className={`transition-all ${
                          fullResult.analysis.final_verdict.overall_score >= 70 ? 'text-green-500' :
                          fullResult.analysis.final_verdict.overall_score >= 40 ? 'text-yellow-500' : 'text-red-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${
                        fullResult.analysis.final_verdict.overall_score >= 70 ? 'text-green-500' :
                        fullResult.analysis.final_verdict.overall_score >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {fullResult.analysis.final_verdict.overall_score}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {fullResult.analysis.final_verdict.label || fullResult.analysis.final_verdict.status}
                  </h2>
                  
                  {/* Score Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Credibility Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              fullResult.analysis.final_verdict.overall_score >= 70 ? 'bg-green-500' :
                              fullResult.analysis.final_verdict.overall_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${fullResult.analysis.final_verdict.overall_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{fullResult.analysis.final_verdict.overall_score}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Confidence Level</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${(fullResult.analysis.final_verdict.confidence_score * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{(fullResult.analysis.final_verdict.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {fullResult.analysis.final_verdict.summary_statement && (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {fullResult.analysis.final_verdict.summary_statement}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Contributing Factors */}
              {fullResult.analysis.final_verdict.contributing_factors && fullResult.analysis.final_verdict.contributing_factors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Key Factors</h3>
                  <ul className="space-y-1">
                    {fullResult.analysis.final_verdict.contributing_factors.map((factor: any, idx: number) => (
                      <li key={idx} className="text-sm text-foreground/70 flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{typeof factor === 'string' ? factor : factor.message || JSON.stringify(factor)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Claims Analysis */}
          {fullResult.analysis?.content_analysis?.claims_list && fullResult.analysis.content_analysis.claims_list.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Claims Analysis</h3>
              {fullResult.analysis.content_analysis.claims_list.map((claim: any, idx: number) => (
                <div key={idx} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Confidence Circle */}
                    <div className="flex-shrink-0">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - (claim.confidence || 0))}`}
                            className={`transition-all ${
                              claim.status === 'VERIFIED' ? 'text-green-500' :
                              claim.status === 'DEBUNKED' ? 'text-red-500' :
                              claim.status === 'MISLEADING' ? 'text-yellow-500' :
                              'text-gray-500'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-bold ${
                            claim.status === 'VERIFIED' ? 'text-green-500' :
                            claim.status === 'DEBUNKED' ? 'text-red-500' :
                            claim.status === 'MISLEADING' ? 'text-yellow-500' :
                            'text-gray-500'
                          }`}>
                            {((claim.confidence || 0) * 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{claim.id}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          claim.status === 'VERIFIED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          claim.status === 'DEBUNKED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          claim.status === 'MISLEADING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 mb-2 italic">"{claim.text}"</p>
                      {claim.note && (
                        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 p-2 rounded">
                          {claim.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Source Credibility */}
          {fullResult.analysis?.content_analysis?.credibility_score && (
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">Source Credibility</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${fullResult.analysis.content_analysis.credibility_score.value}%`,
                        backgroundColor: fullResult.analysis.content_analysis.credibility_score.color_code || '#888'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: fullResult.analysis.content_analysis.credibility_score.color_code }}>
                    {fullResult.analysis.content_analysis.credibility_score.value}/100
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fullResult.analysis.content_analysis.credibility_score.rating_text}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Political Bias */}
          {fullResult.analysis?.content_analysis?.political_bias && (
            <div className="border border-border rounded-lg p-4 bg-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">Political Bias</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{fullResult.analysis.content_analysis.political_bias.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    {(fullResult.analysis.content_analysis.political_bias.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                {fullResult.analysis.content_analysis.political_bias.score_distribution && (
                  <div className="grid grid-cols-3 gap-2">
                    {fullResult.analysis.content_analysis.political_bias.score_distribution.map((item: any, idx: number) => (
                      <div key={idx} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              item.label === 'Left' ? 'bg-blue-500' :
                              item.label === 'Center' ? 'bg-purple-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                        <div className="text-xs font-semibold mt-1">{item.value}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8">
          <div className="text-[15px] leading-[1.8] text-foreground/85 font-normal tracking-normal">
            {displayedAnswer || (isConnecting ? 'Connecting to analysis server...' : connectionError ? '' : 'Waiting for analysis results...')}
            {!isComplete && !connectionError && (
              <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary/70 animate-pulse rounded-sm"></span>
            )}
          </div>
        </div>
      )}

      {/* Modal for sources */}
      {sources.length > 0 && (
        <SourcesModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          sources={sources.map(src => ({
            url: src.url,
            title: src.title,
            site: src.domain,
            snippet: ''
          }))} 
        />
      )}

      {/* Actions - Minimal Style */}
      {isComplete && (
        <div className="flex items-center justify-between border-t border-border/50 pt-5 animate-in fade-in duration-500">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs">
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs">
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <ThumbsUp className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" onClick={onReset}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Follow-up Search Bar */}
      {isComplete && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative rounded-2xl border border-border bg-card shadow-md">
            <div className="bg-raised w-full outline-none flex items-start border rounded-2xl dark:bg-offset duration-75 transition-all border-subtler shadow-sm dark:shadow-md shadow-super/10 dark:shadow-black/10 px-0 pt-3 pb-3 gap-y-md gap-x-2">
              {/* Input Area */}
              <div className="px-3.5 flex-1 flex flex-col">
                <div className="overflow-hidden relative flex h-full w-full">
                  <div className="w-full" style={{ minHeight: "2.5em", maxHeight: "2.5em" }}>
                    <textarea
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a follow-up..."
                      className="w-full bg-transparent border-0 outline-none resize-none text-base h-full"
                      style={{ height: "2.5em", minHeight: "2.5em", maxHeight: "2.5em", userSelect: "text", whiteSpace: "pre-wrap", wordBreak: "break-word", overflow: "hidden" }}
                    />
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="gap-2 flex -ml-2 mt-2 justify-between items-center w-full pr-2">
                  <div className="gap-1 flex items-center">
                    {/* Search Mode Icon */}
                    <div className="p-0.5 flex shrink-0 items-center">
                      <button
                        type="button"
                        className="relative focus:outline-none"
                      >
                        <div className="pointer-events-none absolute inset-0 z-0 block bg-white dark:bg-black dark:bg-gradient-to-b dark:from-primary/20 dark:to-primary/20 border-primary dark:border-primary/30 border rounded-lg shadow-primary/30 dark:shadow-primary/5 shadow-[0_1px_3px_0] dark:text-primary transition-colors duration-300"></div>
                        <div className="relative z-10 flex h-8 min-w-9 items-center justify-center py-1 gap-1 px-2.5">
                          <Search className="h-4 w-4 shrink-0 text-primary" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Right Side Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="focus-visible:bg-muted hover:bg-muted text-muted-foreground hover:text-foreground font-sans focus:outline-none outline-none transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] inline-flex text-sm h-8 aspect-[9/8]"
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="focus-visible:bg-muted hover:bg-muted text-muted-foreground hover:text-foreground font-sans focus:outline-none outline-none transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] inline-flex text-sm h-8 aspect-[9/8]"
                    >
                      <Cpu className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="focus-visible:bg-muted hover:bg-muted text-muted-foreground hover:text-foreground font-sans focus:outline-none outline-none transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] inline-flex text-sm h-8 aspect-[9/8]"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="focus-visible:bg-muted hover:bg-muted text-muted-foreground hover:text-foreground font-sans focus:outline-none outline-none transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] inline-flex text-sm h-8 aspect-[9/8]"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    {/* Submit Button - Arrow Up, disabled when empty */}
                    <button
                      aria-label="Submit"
                      type="button"
                      onClick={handleFollowUp}
                      disabled={!followUpQuery.trim()}
                      className={`font-sans focus:outline-none outline-none transition duration-100 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg active:scale-[0.97] inline-flex text-sm h-8 aspect-[9/8] ${
                        followUpQuery.trim()
                          ? "bg-primary text-primary-foreground hover:opacity-80 cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className="flex items-center min-w-0 gap-0.5 justify-center">
                        <div className="flex shrink-0 items-center justify-center w-4 h-4">
                          <ArrowUp className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SearchResult;
