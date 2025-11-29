"""
Fact Checker Agent
Fact-checks individual statements using web search with logging.
"""
from langchain.agents import create_agent
from langchain_core.tools import tool
from Agents.prompts import FACT_CHECKER_PROMPT
from Agents.search_utils import perplexity_search
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re


class FactCheckerAgent:
    """Agent that fact-checks individual statements"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self._setup_agent()
    
    def _setup_agent(self):
        @tool
        def fact_check_search(query: str) -> str:
            """Search for fact-checking information about a claim."""
            return perplexity_search(query, context="fact-check")
        
        self.agent = create_agent(
            model=self.model,
            tools=[fact_check_search],
            system_prompt=FACT_CHECKER_PROMPT
        )
    
    def check(self, statement: str, claim_id: str = None) -> dict:
        """Fact check a single statement."""
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": f"Fact check (ID: {claim_id}): {statement}"}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        try:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                result = json.loads(match.group())
                if claim_id and "id" not in result:
                    result["id"] = claim_id
                return result
        except json.JSONDecodeError:
            pass
        
        return {
            "id": claim_id or "CLAIM_UNKNOWN",
            "text": statement,
            "status": "UNVERIFIABLE",
            "confidence": 0.5,
            "verification_source": None,
            "note": content[:500] if content else None,
            "positive_count": 0,
            "negative_count": 0,
            "positive_evidence": [],
            "negative_evidence": []
        }
