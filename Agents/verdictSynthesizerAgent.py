"""
Verdict Synthesizer Agent
Synthesizes all analysis results into final verdict.
"""
from langchain.agents import create_agent
from Agents.prompts import VERDICT_SYNTHESIZER_PROMPT
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re


class VerdictSynthesizerAgent:
    """Agent that synthesizes all analysis into final verdict"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self.agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt=VERDICT_SYNTHESIZER_PROMPT
        )
    
    def synthesize(self, claims_results: list, source_data: dict, 
                   bias_data: dict, media_data: dict) -> dict:
        """Synthesize all analysis into final verdict"""
        
        analysis_summary = f"""
## Claims Analysis Results:
{json.dumps(claims_results, indent=2)}

## Source Reputation:
{json.dumps(source_data, indent=2)}

## Political Bias:
{json.dumps(bias_data, indent=2)}

## Media Analysis:
{json.dumps(media_data, indent=2)}

Based on all this data, provide the final verdict.
"""
        
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": analysis_summary}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        try:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group())
        except json.JSONDecodeError:
            pass
        
        # Calculate fallback verdict from claims
        return self._calculate_fallback_verdict(claims_results, source_data)
    
    def _calculate_fallback_verdict(self, claims: list, source: dict) -> dict:
        """Calculate verdict if LLM response parsing fails"""
        if not claims:
            return {
                "status": "UNVERIFIABLE",
                "label": "Insufficient Data",
                "overall_score": 50,
                "confidence_score": 0.3,
                "summary_statement": "Could not extract verifiable claims.",
                "contributing_factors": []
            }
        
        debunked = sum(1 for c in claims if c.get("status") == "DEBUNKED")
        verified = sum(1 for c in claims if c.get("status") == "VERIFIED")
        total = len(claims)
        
        debunked_ratio = debunked / total if total > 0 else 0
        verified_ratio = verified / total if total > 0 else 0
        
        # Calculate score
        score = 50 + (verified_ratio * 40) - (debunked_ratio * 50)
        score = max(0, min(100, score))
        
        # Adjust for source credibility
        source_score = source.get("credibility_score", {}).get("value", 50)
        score = (score * 0.7) + (source_score * 0.3)
        
        if score >= 60:
            status = "ACCURATE"
            label = "Mostly Accurate"
        else:
            status = "INACCURATE"
            if score < 30:
                label = "High Risk: Multiple Issues"
            else:
                label = "Questionable Content"
        
        factors = []
        if debunked > 0:
            factors.append({
                "module": "content_analysis",
                "severity": "HIGH" if debunked_ratio > 0.5 else "MEDIUM",
                "message": f"{debunked} of {total} claims debunked",
                "details_link": None
            })
        
        return {
            "status": status,
            "label": label,
            "overall_score": round(score),
            "confidence_score": round(0.5 + (total * 0.05), 2),
            "summary_statement": f"Analysis of {total} claims: {verified} verified, {debunked} debunked.",
            "contributing_factors": factors
        }
