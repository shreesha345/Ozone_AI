import { useState, useEffect } from "react";
import { Clock, Heart, MoreHorizontal, Globe } from "lucide-react";
import misinfo from "@/lib/services/misinformationService";

type DiscoverTab = "forYou" | "topAfekNews";

// runtime news loaded from service
const DEFAULT_NEWS_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="28">No Image</text></svg>';
const DEFAULT_FAVICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="18">F</text></svg>';
type UiNews = {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  sources: number;
  publishedAgo: string;
  favicons: string[];
  featured?: boolean;
  layout?: "hero" | "card" | "wide";
};

const emptyNews: UiNews[] = [];

// Ensure images are normalized to a usable URL — return DEFAULT_NEWS_IMAGE on invalid values.
const normalizeImage = (u?: string | null) => {
  if (!u) return DEFAULT_NEWS_IMAGE;
  // Accept data: URIs and typical http(s) scheme; also handle protocol-relative URLs //example.com/image.png
  try {
    if (u.startsWith('data:')) return u;
    if (u.startsWith('//')) return `https:${u}`;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    // Some sources provide relative paths or invalid data — treat them as missing
    return DEFAULT_NEWS_IMAGE;
  } catch (err) {
    return DEFAULT_NEWS_IMAGE;
  }
};

interface NewsCardProps {
  news: UiNews;
}

const NewsCard = ({ news }: NewsCardProps) => {
  if (news.layout === "hero") {
    return (
      <div className="col-span-3 pb-4 border-b border-border">
        <a className="group/card block h-full outline-none" href="#">
          <div className="group relative h-full transition-all duration-150">
            <div className="relative flex h-full flex-col md:grid md:grid-cols-2 gap-4">
              <div className="relative flex w-full shrink-0 overflow-hidden order-last md:order-first items-start justify-center min-h-[250px] rounded-xl">
                <div className="relative overflow-hidden w-full rounded-xl">
                  <div className="w-full h-full">
                              <div className="bg-muted group relative size-full overflow-hidden rounded-md">
                                <img
                                  alt={news.title}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                  src={normalizeImage(news.image)}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; console.warn('[DiscoverFeed] image load failed, using fallback for', news.title); }}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                  </div>
                </div>
              </div>
              <div className="flex size-full grow flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <div className="group-hover/card:text-primary transition-colors duration-150 font-light text-pretty leading-snug tracking-tight text-2xl md:text-3xl line-clamp-3 w-full grow break-words text-foreground">
                    {news.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Published</span>
                    <span className="text-xs font-medium text-muted-foreground">{news.publishedAgo}</span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-6 text-base text-foreground">
                  {news.description}
                </p>
                <div className="flex-1"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {news.favicons.map((favicon, i) => (
                        <div key={favicon || `favicon-${i}`} className="relative shrink-0 overflow-hidden rounded-full bg-muted w-4 h-4 border border-background">
                          {favicon ? (
                           <img
                            className="w-full h-full object-cover"
                            alt={`source-${i}`}
                            src={favicon}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_FAVICON; }}
                           />
                          ) : (
                           <img className="w-full h-full object-cover" alt={`source-${i}`} src={DEFAULT_FAVICON} />
                          )}
                        </div>
                      ))}
                      <div className="relative shrink-0 overflow-hidden rounded-full bg-muted w-4 h-4 flex items-center justify-center border border-background">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{news.sources} sources</span>
                  </div>
                  <div className="flex items-center">
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  if (news.layout === "wide") {
    return (
      <div className="col-span-3 py-4 border-t border-b border-border">
        <a className="group/card block h-full outline-none" href="#">
          <div className="group relative h-full transition-all duration-150">
            <div className="relative flex h-full flex-col md:grid md:grid-cols-7 gap-4">
              <div className="relative flex w-full shrink-0 overflow-hidden order-last items-start justify-center md:order-first md:col-span-3 aspect-[3/2] min-h-[200px] rounded-xl">
                <div className="relative overflow-hidden w-full rounded-xl">
                  <div className="w-full h-full">
                    <div className="bg-muted group relative size-full overflow-hidden rounded-md">
                      <img
                        alt={news.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        src={normalizeImage(news.image)}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; console.warn('[DiscoverFeed] image load failed, using fallback for', news.title); }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex size-full grow flex-col md:col-span-4 gap-2">
                <div className="flex flex-col gap-2">
                  <div className="group-hover/card:text-primary transition-colors duration-150 font-light text-pretty leading-snug tracking-tight text-xl md:text-2xl line-clamp-3 w-full grow break-words text-foreground">
                    {news.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Published</span>
                    <span className="text-xs font-medium text-muted-foreground">{news.publishedAgo}</span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-6 text-base text-foreground">
                  {news.description}
                </p>
                <div className="flex-1"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {news.favicons.map((favicon, i) => (
                        <div key={i} className="relative shrink-0 overflow-hidden rounded-full bg-muted w-4 h-4 border border-background">
                          <img className="w-full h-full object-cover" alt="source" src={favicon} loading="lazy" decoding="async" />
                        </div>
                      ))}
                      <div className="relative shrink-0 overflow-hidden rounded-full bg-muted w-4 h-4 flex items-center justify-center border border-background">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{news.sources} sources</span>
                  </div>
                  <div className="flex items-center">
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  // Default card layout
  return (
    <div className="col-span-1">
      <a className="group/card block h-full outline-none" href="#">
        <div className="group relative h-full transition-all duration-150 hover:shadow-md rounded-xl bg-card dark:bg-card/50 border border-border">
          <div className="relative flex h-full flex-col">
            <div className="relative flex w-full shrink-0 overflow-hidden aspect-[3/2] rounded-t-xl">
              <div className="relative overflow-hidden w-full rounded-t-xl">
                <div className="w-full h-full">
                  <div className="bg-muted group relative size-full overflow-hidden rounded-t-xl">
                    <img
                      alt={news.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      src={normalizeImage(news.image)}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; console.warn('[DiscoverFeed] image load failed, using fallback for', news.title); }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex size-full grow flex-col py-3 px-4 gap-2">
              <div className="group-hover/card:text-primary transition-colors duration-150 line-clamp-3 w-full grow break-words text-base font-medium text-foreground">
                {news.title}
              </div>
              <div className="flex-1"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {news.favicons.slice(0, 2).map((favicon, i) => (
                        <div key={favicon || `favicon-${i}`} className="relative shrink-0 overflow-hidden rounded-full bg-muted w-3.5 h-3.5 border border-background">
                          {favicon ? (
                            <img
                              className="w-full h-full object-cover"
                              alt={`source-${i}`}
                              src={favicon}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_FAVICON; }}
                            />
                          ) : (
                            <img className="w-full h-full object-cover" alt={`source-${i}`} src={DEFAULT_FAVICON} />
                          )}
                        </div>
                      ))}
                    <div className="relative shrink-0 overflow-hidden rounded-full bg-muted w-3.5 h-3.5 flex items-center justify-center border border-background">
                      <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{news.sources} sources</span>
                </div>
                <div className="flex items-center">
                  <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

const DiscoverFeed = ({ initialTab = "forYou" }: { initialTab?: DiscoverTab }) => {
  const [activeTab, setActiveTab] = useState<DiscoverTab>(initialTab);
  const [newsList, setNewsList] = useState<UiNews[]>(emptyNews);
  const [loading, setLoading] = useState(false);

  const timeAgo = (iso?: string) => {
    if (!iso) return "Unknown";
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // (moved to top-level) Ensure images are normalized to a usable URL — return DEFAULT_NEWS_IMAGE on invalid values.

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (activeTab === "forYou") {
          console.log("[DiscoverFeed] loading For You news");
          const articles = await misinfo.getTrendingNews("");
          if (!mounted) return;
          const ui = articles.map((a, i) => ({
            id: a.url || `${Date.now()}-${i}`,
            title: a.title,
            description: a.description,
            image: a.urlToImage || null,
            sources: 1,
            publishedAgo: timeAgo(a.publishedAt),
            favicons: [
              a.url ? `https://www.google.com/s2/favicons?sz=128&domain=${new URL(a.url).hostname}` : "",
            ],
            featured: i === 0,
            layout: i === 0 ? "hero" : i === 4 ? "wide" : "card",
          } as UiNews));
          setNewsList(ui);
        } else {
          console.log("[DiscoverFeed] loading Top AFEK News (fake-news)");
          const articles = await misinfo.getTrendingNews("fake news");
          if (!mounted) return;
          const ui = articles.map((a, i) => ({
            id: a.url || `${Date.now()}-${i}`,
            title: a.title,
            description: a.description,
            image: a.urlToImage || null,
            sources: 1,
            publishedAgo: timeAgo(a.publishedAt),
            favicons: [a.url ? `https://www.google.com/s2/favicons?sz=128&domain=${new URL(a.url).hostname}` : ""],
            featured: i === 0,
            layout: i === 0 ? "hero" : "card",
          } as UiNews));
          setNewsList(ui);
        }
      } catch (err) {
        console.error("[DiscoverFeed] load failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [activeTab]);

  const currentNews = newsList;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="relative mt-0">
        <div className="space-y-4 pt-4 min-w-0">
          <div className="flex items-center justify-between">
            <div className="relative z-[2] flex min-w-0 flex-1 flex-col md:flex-row md:items-center gap-4">
              {/* Title */}
              <h1 className="hidden md:flex items-center text-pretty md:text-4xl lg:text-5xl font-light text-foreground gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  fillRule="evenodd"
                  className="shrink-0 relative top-[-5px]"
                >
                  <path d="M15.875 4.5C16.3582 4.5 16.75 4.89175 16.75 5.375V8.875C16.75 9.35825 16.3582 9.75 15.875 9.75H5.375C4.89175 9.75 4.5 9.35825 4.5 8.875V5.375C4.5 4.89175 4.89175 4.5 5.375 4.5H15.875ZM6.25 8H15V6.25H6.25V8ZM15.875 11.5C16.3582 11.5 16.75 11.8918 16.75 12.375C16.75 12.8582 16.3582 13.25 15.875 13.25H12.375C11.8918 13.25 11.5 12.8582 11.5 12.375C11.5 11.8918 11.8918 11.5 12.375 11.5H15.875ZM6.9502 11.5C8.29761 11.5001 9.40039 12.6028 9.40039 13.9502C9.40028 15.2975 8.29754 16.4003 6.9502 16.4004C5.60276 16.4004 4.50011 15.2976 4.5 13.9502C4.5 12.6027 5.6027 11.5 6.9502 11.5ZM15.875 15C16.3582 15 16.75 15.3918 16.75 15.875C16.75 16.3582 16.3582 16.75 15.875 16.75H12.375C11.8918 16.75 11.5 16.3582 11.5 15.875C11.5 15.3918 11.8918 15 12.375 15H15.875ZM15.875 18.5C16.3582 18.5 16.75 18.8918 16.75 19.375C16.75 19.8582 16.3582 20.25 15.875 20.25H5.375C4.89175 20.25 4.5 19.8582 4.5 19.375C4.5 18.8918 4.89175 18.5 5.375 18.5H15.875ZM17.625 1C19.0707 1 20.25 2.17925 20.25 3.625V21.1074C20.25 21.5867 20.6457 21.9824 21.125 21.9824C21.1641 21.9824 21.2025 21.9853 21.2402 21.9902C21.6659 21.9328 22 21.5651 22 21.125V3.625C22 3.14175 22.3918 2.75 22.875 2.75C23.3582 2.75 23.75 3.14175 23.75 3.625V21.125C23.75 22.5707 22.5707 23.75 21.125 23.75C21.0487 23.75 20.9749 23.7391 20.9043 23.7207C19.5612 23.6079 18.5 22.4788 18.5 21.1074V3.625C18.5 3.14575 18.1043 2.75 17.625 2.75H3.625C3.14575 2.75 2.75 3.14575 2.75 3.625V21.125C2.75 21.6043 3.14575 22 3.625 22H15.875C16.3582 22 16.75 22.3918 16.75 22.875C16.75 23.3582 16.3582 23.75 15.875 23.75H3.625C2.17925 23.75 1 22.5707 1 21.125V3.625C1 2.17925 2.17925 1 3.625 1H17.625Z" />
                </svg>
                <span className="font-light tracking-tight">
                  Discove<span className="italic">r</span>
                </span>
              </h1>

              {/* Tab Buttons */}
              <div className="flex h-fit min-h-0 grow items-center md:px-0">
                <div className="px-4 md:px-0 gap-2 flex overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab("forYou")}
                    className={`transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 origin-center whitespace-nowrap inline-flex text-sm h-8 px-3 ${
                      activeTab === "forYou"
                        ? "border border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/30 text-primary"
                        : "border border-border text-muted-foreground md:hover:border-border md:hover:text-foreground hover:bg-muted bg-background"
                    }`}
                  >
                    <div className="flex items-center min-w-0 gap-1 justify-center">
                      <span className="relative truncate text-center px-1 leading-loose">For You</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("topAfekNews")}
                    className={`transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 origin-center whitespace-nowrap inline-flex text-sm h-8 px-3 ${
                      activeTab === "topAfekNews"
                        ? "border border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/30 text-primary"
                        : "border border-border text-muted-foreground md:hover:border-border md:hover:text-foreground hover:bg-muted bg-background"
                    }`}
                  >
                    <div className="flex items-center min-w-0 gap-1 justify-center">
                      <span className="relative truncate text-center px-1 leading-loose">Top AFEK News</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News Feed Content */}
        <div className="mt-8">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
            {currentNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverFeed;
