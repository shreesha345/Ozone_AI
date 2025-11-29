"""
Political Bias Analyzer Agent
Analyzes text for political bias and leaning.
"""
from langchain.agents import create_agent
from Agents.prompts import POLITICAL_BIAS_PROMPT
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re


class PoliticalBiasAgent:
    """Agent that analyzes political bias in content"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self.agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt=POLITICAL_BIAS_PROMPT
        )
    
    def analyze(self, text: str) -> dict:
        """Analyze political bias in text"""
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": f"Analyze political bias in this text:\n\n{text}"}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        try:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group())
        except json.JSONDecodeError:
            pass
        
        return {
            "rating": "Center",
            "confidence": 0.5,
            "score_distribution": [
                {"label": "Left", "value": 33},
                {"label": "Center", "value": 34},
                {"label": "Right", "value": 33}
            ],
            "indicators": []
        }
