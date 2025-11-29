import React from "react";
import { SourceItem, getFaviconUrl } from "./sourcesData";
import { X } from "lucide-react";

interface SourcesModalProps {
  open: boolean;
  onClose: () => void;
  sources: SourceItem[];
}

const SourcesModal: React.FC<SourcesModalProps> = ({ open, onClose, sources }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end backdrop-blur-sm bg-black/40" onClick={onClose}>
      {/* Side Panel */}
      <div
        className="px-4 pb-4 flex min-h-0 w-full max-w-2xl grow flex-col h-full bg-background border-l border-border animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-4 sticky top-0 z-[22] w-full shrink-0 bg-background">
          <div className="p-2 flex items-center gap-1.5 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" color="currentColor" className="shrink-0 text-foreground -ml-1" fill="currentColor" fillRule="evenodd">
              <path d="M12.2401 8.96004C10.6561 8.96004 9.36011 7.66404 9.36011 6.08004C9.36011 4.49604 10.6561 3.20004 12.2401 3.20004C13.8241 3.20004 15.1201 4.49604 15.1201 6.08004C15.1201 7.66404 13.8241 8.96004 12.2401 8.96004ZM12.2401 5.12004C11.7121 5.12004 11.2801 5.55204 11.2801 6.08004C11.2801 6.60804 11.7121 7.04004 12.2401 7.04004C12.7681 7.04004 13.2001 6.60804 13.2001 6.08004C13.2001 5.55204 12.7681 5.12004 12.2401 5.12004Z M18 14.7201C16.416 14.7201 15.12 13.4241 15.12 11.8401C15.12 10.2561 16.416 8.96011 18 8.96011C19.584 8.96011 20.88 10.2561 20.88 11.8401C20.88 13.4241 19.584 14.7201 18 14.7201ZM18 10.8801C17.472 10.8801 17.04 11.3121 17.04 11.8401C17.04 12.3681 17.472 12.8001 18 12.8001C18.528 12.8001 18.96 12.3681 18.96 11.8401C18.96 11.3121 18.528 10.8801 18 10.8801Z M6.48004 14.7201C4.89604 14.7201 3.60004 13.4241 3.60004 11.8401C3.60004 10.2561 4.89604 8.96011 6.48004 8.96011C8.06404 8.96011 9.36004 10.2561 9.36004 11.8401C9.36004 13.4241 8.06404 14.7201 6.48004 14.7201ZM6.48004 10.8801C5.95204 10.8801 5.52004 11.3121 5.52004 11.8401C5.52004 12.3681 5.95204 12.8001 6.48004 12.8001C7.00804 12.8001 7.44004 12.3681 7.44004 11.8401C7.44004 11.3121 7.00804 10.8801 6.48004 10.8801Z M12.2401 20.48C10.6561 20.48 9.36011 19.184 9.36011 17.6C9.36011 16.016 10.6561 14.72 12.2401 14.72C13.8241 14.72 15.1201 16.016 15.1201 17.6C15.1201 19.184 13.8241 20.48 12.2401 20.48ZM12.2401 16.64C11.7121 16.64 11.2801 17.072 11.2801 17.6C11.2801 18.128 11.7121 18.56 12.2401 18.56C12.7681 18.56 13.2001 18.128 13.2001 17.6C13.2001 17.072 12.7681 16.64 12.2401 16.64Z"></path>
            </svg>
            <h1 className="text-pretty line-clamp-1 leading-none mr-8 font-medium text-2xl text-foreground">{sources.length} sources</h1>
            <div className="right-0 top-2 absolute">
              <button
                aria-label="Close"
                type="button"
                onClick={onClose}
                className="hover:bg-muted text-muted-foreground hover:text-foreground font-sans focus:outline-none outline-none transition duration-300 ease-out select-none items-center relative justify-center text-center rounded-full cursor-pointer active:scale-[0.97] inline-flex text-sm h-8 aspect-square"
              >
                <div className="flex items-center min-w-0 gap-0.5 justify-center">
                  <div className="flex shrink-0 items-center justify-center w-4 h-4">
                    <X className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Source List */}
        <div className="grow flex flex-col justify-start shrink-0 p-2 overflow-y-auto">
          <div className="gap-3 flex h-full flex-col items-start">
            {sources.map((src) => (
              <div key={src.url} className="gap-2 flex w-full flex-row-reverse">
                <div className="w-full min-w-0">
                  <a
                    rel="noopener"
                    className="group flex size-full cursor-pointer items-stretch"
                    target="_blank"
                    href={src.url}
                  >
                    <div className="w-full">
                      <div className="group relative flex w-full items-stretch">
                        <div className="flex w-full rounded-lg transition duration-200 bg-muted/50 hover:bg-muted">
                          <div className="gap-1 pointer-events-none relative flex size-full max-w-full select-none flex-col p-4">
                            {/* Favicon + Site Name */}
                            <div className="flex w-full items-center justify-between">
                              <div className="space-x-2 flex">
                                <div className="flex items-center gap-x-1.5">
                                  <div className="relative flex-none text-xs font-medium text-muted-foreground">
                                    <div className="flex w-4 h-4 items-center justify-center">
                                      <div className="relative shrink-0 overflow-hidden rounded-full" style={{ width: 16, height: 16 }}>
                                        <div className="rounded-full absolute inset-0 bg-white"></div>
                                        <img
                                          className="relative block"
                                          alt={`${src.site} favicon`}
                                          width="16"
                                          height="16"
                                          src={getFaviconUrl(src.url)}
                                          style={{ width: 16, height: 16 }}
                                        />
                                        <div className="rounded-full absolute inset-0 border border-black/10 dark:border-transparent"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="line-clamp-1 min-w-0 grow break-all leading-none transition-all duration-300 text-xs font-medium text-muted-foreground">
                                    {src.site}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Title */}
                            <div className="text-base text-foreground">
                              <span className="line-clamp-1 text-left md:line-clamp-2 group-hover:underline">{src.title}</span>
                            </div>
                            {/* Snippet */}
                            <div className="mt-0.5 line-clamp-1 font-normal md:line-clamp-4 text-sm text-muted-foreground">
                              {src.snippet}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcesModal;
