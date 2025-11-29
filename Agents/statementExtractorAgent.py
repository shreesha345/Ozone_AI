"""
Statement Extractor Agent
Extracts individual factual statements from input text.

This agent parses input text to identify and extract verifiable factual claims,
filtering out opinions and non-factual content for subsequent fact-checking.
"""
from langchain.agents import create_agent
from Agents.prompts import STATEMENT_EXTRACTOR_PROMPT
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re


class StatementExtractorAgent:
    """Agent that extracts factual statements from text"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self.agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt=STATEMENT_EXTRACTOR_PROMPT
        )
    
    def extract(self, text: str, max_statements: int = 5) -> list:
        """
        Extract individual factual statements from input text.
        
        Args:
            text: Input text to analyze
            max_statements: Maximum number of statements to extract (default: 5)
                           Helps avoid rate limits by reducing API calls
        
        Returns:
            List of factual statements (limited to max_statements)
        """
        # Truncate very long text to avoid excessive token usage
        if len(text) > 5000:
            text = text[:5000] + "..."
            print(f"⚠️ Text truncated to 5000 characters to reduce API usage")
        
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": f"Extract up to {max_statements} key factual statements from:\n\n{text}"}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        try:
            match = re.search(r'\[.*\]', content, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                # Ensure we have a flat list of strings
                if isinstance(parsed, list):
                    statements = []
                    for item in parsed:
                        if isinstance(item, str):
                            statements.append(item)
                        elif isinstance(item, dict) and 'statement' in item:
                            statements.append(item['statement'])
                        elif isinstance(item, dict) and 'text' in item:
                            statements.append(item['text'])
                        elif isinstance(item, list):
                            # Flatten nested lists
                            for subitem in item:
                                if isinstance(subitem, str):
                                    statements.append(subitem)
                    if statements:
                        # Limit to max_statements to reduce subsequent API calls
                        return statements[:max_statements]
        except (json.JSONDecodeError, TypeError, KeyError):
            pass
        
        # Fallback: split by sentences and limit
        sentences = re.split(r'[.!?]+', text)
        filtered = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]
        return filtered[:max_statements]
