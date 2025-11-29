// misinformationService.ts - Fixed version

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

interface FactCheckClaim {
  text: string;
  claimant?: string;
  claimDate?: string;
  claimReview: Array<{
    publisher: { name: string; site?: string };
    url: string;
    title: string;
    reviewDate: string;
    textualRating: string;
    languageCode: string;
  }>;
}

interface GoogleFactCheckResponse {
  claims?: FactCheckClaim[];
}

// Load keys from the Vite environment (set in .env)
const NEWS_API_KEY = (import.meta.env.VITE_NEWS_API_KEY as string) || "";
const GOOGLE_FACTCHECK_API_KEY = (import.meta.env.VITE_GOOGLE_FACTCHECK_KEY as string) || "";

// Default search queries for misinformation topics
const DEFAULT_QUERIES = [
  'misinformation',
  'fake news',
  'fact check',
  'debunked',
  'false claim',
  'disinformation',
  'hoax',
  'rumor',
  'conspiracy',
  'scam',
  'propaganda',
  'verified'
];

// A small map of related keywords to expand searches when the primary query yields no results
const RELATED_KEYWORDS: Record<string, string[]> = {
  'fact check': ['factcheck', 'factchecking', 'verify', 'verification', 'fact-checked', 'debunked'],
  'fake news': ['hoax', 'misinformation', 'disinformation', 'rumor', 'scam'],
  'misinformation': ['disinformation', 'false claim', 'rumor', 'hoax'],
  'debunked': ['debunk', 'debunking', 'fact checked', 'false claim'],
  'hoax': ['fake news', 'scam', 'fraud', 'staged'],
};

/**
 * Fetch news from NewsAPI with proper error handling
 */
async function fetchFromNewsApi(
  query: string,
  pageSize: number = 12,
  language: string = 'en',
  fromDaysAgo: number = 7
): Promise<NewsAPIResponse> {
  const today = new Date();
  const fromDate = new Date(Date.now() - fromDaysAgo * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Guard: make sure the API key is provided
  if (!NEWS_API_KEY || NEWS_API_KEY === 'VITE_NEWS_API_KEY') {
    console.error('[misinfo] NEWS_API_KEY is not set or is a placeholder. Update your .env file with VITE_NEWS_API_KEY.');
    throw new Error('VITE_NEWS_API_KEY is not configured.');
  }
  const url = new URL('https://newsapi.org/v2/everything');
  
  // Required parameters - at least one must be set
  url.searchParams.append('q', query); // FIX: Always include query parameter
  url.searchParams.append('sortBy', 'publishedAt');
  url.searchParams.append('from', fromDate);
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('language', language);
  url.searchParams.append('apiKey', NEWS_API_KEY);

  // Avoid logging the raw URL with key to the console; redact it for safety
  const displayUrl = url.toString().replace(/(apiKey=)[^&]+/, '$1[REDACTED]');
  console.log('[misinfo] Fetching from NewsAPI:', displayUrl);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    console.error('[misinfo] NewsAPI error', response.status, data);
    throw new Error(`NewsAPI request failed: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Get trending misinformation-related news
 */
export async function getTrendingNews(
  customQuery?: string,
  pageSize: number = 12
): Promise<NewsArticle[]> {
  try {
    // Use custom query or pick a random default query
    const query = customQuery || DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];
    
    console.log('[misinfo] Fetching trending news for query:', query);
    
    const data = await fetchFromNewsApi(query, pageSize, 'en', 7);
    
    console.log('[misinfo] Received', data.articles?.length || 0, 'articles');
    // If there are no articles, try a broader fallback using related keywords
    if (!data.articles || data.articles.length === 0) {
      const related = RELATED_KEYWORDS[query.toLowerCase()];
      // create an OR combined query if we have related keywords
      if (related && related.length) {
        const orQuery = [query].concat(related).join(' OR ');
        console.log('[misinfo] No articles found; retrying with expanded query:', orQuery);
        const retryData = await fetchFromNewsApi(orQuery, pageSize, 'en', 14);
        if (retryData.articles && retryData.articles.length > 0) {
          console.log('[misinfo] Expanded query returned', retryData.articles.length, 'articles');
          return retryData.articles;
        }
      }
      // Otherwise try a combined random default query to broaden results
      const broadQuery = `${query} OR ${DEFAULT_QUERIES.join(' OR ')}`;
      console.log('[misinfo] Trying broad fallback query:', broadQuery);
      const broadData = await fetchFromNewsApi(broadQuery, pageSize, 'en', 30);
      console.log('[misinfo] Broad fallback returned', broadData.articles?.length || 0, 'articles');
      if (broadData.articles && broadData.articles.length > 0) {
        return broadData.articles;
      }

      // As a final step, try sequential individual keyword queries and aggregate results
      const keywordsToTry = [query].concat(related || [], DEFAULT_QUERIES);
      const seen = new Map<string, NewsArticle>();
      for (const k of keywordsToTry) {
        try {
          const kData = await fetchFromNewsApi(k, pageSize, 'en', 30);
          const list = kData.articles || [];
          for (const a of list) {
            if (!seen.has(a.url)) {
              seen.set(a.url, a);
            }
            if (seen.size >= pageSize) break;
          }
          if (seen.size >= pageSize) break;
        } catch (err) {
          console.warn('[misinfo] keyword fetch failed for', k, err);
        }
      }

      const aggregated = Array.from(seen.values()).slice(0, pageSize);
      console.log('[misinfo] Aggregated returned', aggregated.length, 'articles');
      return aggregated;
    }
    
    return data.articles || [];
  } catch (error) {
    console.error('[misinfo] getTrendingNews failed', error);
    
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Search for news on multiple misinformation topics
 */
export async function searchMisinformationTopics(
  topics: string[] = DEFAULT_QUERIES,
  articlesPerTopic: number = 5
): Promise<Record<string, NewsArticle[]>> {
  const results: Record<string, NewsArticle[]> = {};

  console.log('[misinfo] Searching multiple topics:', topics);

  // Fetch articles for each topic
  const promises = topics.map(async (topic) => {
    try {
      const articles = await getTrendingNews(topic, articlesPerTopic);
      results[topic] = articles;
    } catch (error) {
      console.error(`[misinfo] Failed to fetch topic "${topic}":`, error);
      results[topic] = [];
    }
  });

  await Promise.all(promises);

  return results;
}

/**
 * Fact-check a claim using Google Fact Check Tools API
 */
export async function checkClaimWithGoogle(
  claim: string,
  language: string = 'en'
): Promise<FactCheckClaim[]> {
  try {
    if (!GOOGLE_FACTCHECK_API_KEY || GOOGLE_FACTCHECK_API_KEY === 'VITE_GOOGLE_FACTCHECK_KEY') {
      console.warn('[misinfo] GOOGLE_FACTCHECK_API_KEY missing or placeholder. Set VITE_GOOGLE_FACTCHECK_KEY in .env.');
      return [];
    }
    const url = new URL('https://factchecktools.googleapis.com/v1alpha1/claims:search');
    url.searchParams.append('query', claim);
    url.searchParams.append('languageCode', language);
    url.searchParams.append('key', GOOGLE_FACTCHECK_API_KEY);

    console.log('[misinfo] Checking claim:', claim);

    const response = await fetch(url.toString());
    const data: GoogleFactCheckResponse = await response.json();

    if (!response.ok) {
      console.error('[misinfo] Google Fact Check error', response.status, data);
      throw new Error(`Google Fact Check failed: ${response.status}`);
    }

    return data.claims || [];
  } catch (error) {
    console.error('[misinfo] checkClaimWithGoogle failed', error);
    return [];
  }
}

/**
 * Search news by specific keywords
 */
export async function searchNewsByKeywords(
  keywords: string[],
  pageSize: number = 10
): Promise<NewsArticle[]> {
  try {
    // Combine keywords with OR operator
    const query = keywords.join(' OR ');
    return await getTrendingNews(query, pageSize);
  } catch (error) {
    console.error('[misinfo] searchNewsByKeywords failed', error);
    return [];
  }
}

/**
 * Get news from specific domains (reliable sources)
 */
export async function getNewsFromDomains(
  domains: string[],
  query: string = 'news',
  pageSize: number = 12
): Promise<NewsArticle[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = new URL('https://newsapi.org/v2/everything');
    
    url.searchParams.append('q', query); // Still need a query parameter
    url.searchParams.append('domains', domains.join(','));
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('from', today);
    url.searchParams.append('pageSize', pageSize.toString());
    url.searchParams.append('apiKey', NEWS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    return data.articles || [];
  } catch (error) {
    console.error('[misinfo] getNewsFromDomains failed', error);
    return [];
  }
}

/**
 * Get fact-checked news from trusted fact-checking organizations
 */
export async function getFactCheckNews(pageSize: number = 12): Promise<NewsArticle[]> {
  const factCheckDomains = [
    'snopes.com',
    'factcheck.org',
    'politifact.com',
    'fullfact.org',
    'apnews.com',
    'reuters.com'
  ];

  return getNewsFromDomains(factCheckDomains, 'fact check', pageSize);
}

// Export configured service
export const misinformationService = {
  getTrendingNews,
  searchMisinformationTopics,
  checkClaimWithGoogle,
  searchNewsByKeywords,
  getNewsFromDomains,
  getFactCheckNews,
  DEFAULT_QUERIES
};

export default misinformationService;