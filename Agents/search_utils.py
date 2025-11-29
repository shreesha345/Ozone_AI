"""
Search utilities with logging for transparency.
"""
import requests
from config import Config
from datetime import datetime


class SearchLogger:
    """Logs all search operations for transparency"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.logs = []
            cls._instance.verbose = True
        return cls._instance
    
    def log(self, query: str, success: bool, result_preview: str = None, error: str = None):
        """Log a search operation"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "query": query[:100] + "..." if len(query) > 100 else query,
            "success": success,
            "result_preview": result_preview,
            "error": error
        }
        self.logs.append(entry)
        
        if self.verbose:
            self._print_log(entry)
    
    def _print_log(self, entry: dict):
        """Print log entry to console"""
        status = "✅" if entry["success"] else "❌"
        print(f"\n    {status} [SEARCH] {entry['timestamp']}")
        print(f"       Query: {entry['query']}")
        if entry["success"] and entry["result_preview"]:
            preview = entry["result_preview"][:150] + "..." if len(entry["result_preview"]) > 150 else entry["result_preview"]
            print(f"       Result: {preview}")
        if entry["error"]:
            print(f"       Error: {entry['error']}")
    
    def get_logs(self) -> list:
        """Get all logs"""
        return self.logs
    
    def clear(self):
        """Clear logs"""
        self.logs = []
    
    def summary(self) -> dict:
        """Get summary of search operations"""
        total = len(self.logs)
        successful = sum(1 for l in self.logs if l["success"])
        failed = total - successful
        return {
            "total_searches": total,
            "successful": successful,
            "failed": failed,
            "success_rate": f"{(successful/total*100):.1f}%" if total > 0 else "N/A"
        }


# Global logger instance
search_logger = SearchLogger()


def perplexity_search(query: str, context: str = "general", max_length: int = 150) -> str:
    """
    Search using Perplexity API with logging and rate limiting.
    
    Args:
        query: Search query (will be truncated if too long)
        context: Context for the search (fact-check, source-reputation, etc.)
        max_length: Maximum query length to avoid excessive token usage
    
    Returns:
        Search results or error message
    """
    try:
        # Truncate query to avoid excessive token usage
        if len(query) > max_length:
            query = query[:max_length] + "..."
            print(f"⚠️ Query truncated to {max_length} characters")
        
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {Config.PERPLEXITY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Customize prompt based on context - keep prompts concise
        if context == "fact-check":
            prompt = f"Briefly fact-check with sources: {query}"
        elif context == "source-reputation":
            prompt = f"Credibility of {query}? Brief summary."
        elif context == "media-verification":
            prompt = f"Is this media authentic or manipulated: {query}"
        else:
            prompt = query
        
        payload = {
            "model": "sonar",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 500  # Limit response length to reduce costs
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        # Log successful search
        search_logger.log(
            query=query,
            success=True,
            result_preview=content[:200] if content else "Empty response"
        )
        
        return content
        
    except requests.exceptions.Timeout:
        error_msg = "Search timed out after 30 seconds"
        search_logger.log(query=query, success=False, error=error_msg)
        return f"Search error: {error_msg}"
        
    except requests.exceptions.HTTPError as e:
        error_msg = f"HTTP error: {e.response.status_code}"
        search_logger.log(query=query, success=False, error=error_msg)
        return f"Search error: {error_msg}"
        
    except Exception as e:
        error_msg = str(e)
        search_logger.log(query=query, success=False, error=error_msg)
        return f"Search error: {error_msg}"


def print_search_summary():
    """Print summary of all searches performed"""
    summary = search_logger.summary()
    print("\n" + "=" * 40)
    print("SEARCH OPERATIONS SUMMARY")
    print("=" * 40)
    print(f"Total Searches: {summary['total_searches']}")
    print(f"Successful: {summary['successful']}")
    print(f"Failed: {summary['failed']}")
    print(f"Success Rate: {summary['success_rate']}")
    print("=" * 40)
