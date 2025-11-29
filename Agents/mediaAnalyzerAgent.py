"""
Media Analyzer Agent
Analyzes media assets (images, videos) for manipulation/deepfakes with logging.

This agent detects potential deepfakes and media manipulation by analyzing visual artifacts,
performing reverse image searches, and assessing AI generation probability.
"""
from langchain.agents import create_agent
from langchain_core.tools import tool
from Agents.prompts import MEDIA_ANALYZER_PROMPT
from Agents.search_utils import perplexity_search
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re


class MediaAnalyzerAgent:
    """Agent that analyzes media for deepfakes and manipulation"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self._setup_agent()
    
    def _setup_agent(self):
        @tool
        def reverse_image_search(url: str) -> str:
            """Search for original source of an image/media."""
            return perplexity_search(url, context="media-verification")
        
        self.agent = create_agent(
            model=self.model,
            tools=[reverse_image_search],
            system_prompt=MEDIA_ANALYZER_PROMPT
        )
    
    def analyze(self, text: str, media_urls: list = None) -> dict:
        """Analyze media in content"""
        prompt = f"Analyze media in this content:\n\n{text}"
        if media_urls:
            prompt += f"\n\nMedia URLs found: {media_urls}"
        
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": prompt}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        try:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group())
        except json.JSONDecodeError:
            pass
        
        return {
            "assets": [],
            "deepfake_probability_avg": 0.0
        }
    
    def extract_media_urls(self, text: str) -> list:
        """Extract media URLs from text"""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+\.(?:jpg|jpeg|png|gif|mp4|webm|mov|avi|mp3|wav)'
        return re.findall(url_pattern, text, re.IGNORECASE)
