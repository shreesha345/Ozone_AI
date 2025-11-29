"""
Source Analyzer Agent
Analyzes publisher/source reputation and credibility with logging.

This agent evaluates the credibility and reputation of news sources and publishers
by analyzing their history, ownership, bias, and track record for accuracy.
"""
from langchain.agents import create_agent
from langchain_core.tools import tool
from Agents.prompts import SOURCE_ANALYZER_PROMPT
from Agents.search_utils import perplexity_search
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re


class SourceAnalyzerAgent:
    """Agent that analyzes source/publisher reputation"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self._setup_agent()
    
    def _setup_agent(self):
        @tool
        def search_source_reputation(query: str) -> str:
            """Search for information about a publisher's reputation and history."""
            return perplexity_search(query, context="source-reputation")
        
        self.agent = create_agent(
            model=self.model,
            tools=[search_source_reputation],
            system_prompt=SOURCE_ANALYZER_PROMPT
        )
    
    def analyze(self, url_or_publisher: str) -> dict:
        """Analyze source reputation"""
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": f"Analyze this source: {url_or_publisher}"}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        try:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group())
        except json.JSONDecodeError:
            pass
        
        return {
            "publisher_name": url_or_publisher,
            "domain_rating_score": 50,
            "trust_history_flags": 0,
            "ownership_structure": "Unknown",
            "bias_source": None,
            "credibility_score": {"value": 50, "rating_text": "Medium", "color_code": "#F59E0B"}
        }
