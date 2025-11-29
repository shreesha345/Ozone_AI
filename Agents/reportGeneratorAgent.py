"""
Report Generator Agent
Generates detailed human-readable reports from analysis results.

This agent transforms technical analysis data into comprehensive, human-readable reports
with executive summaries, detailed findings, risk assessments, and actionable recommendations.
"""
from langchain.agents import create_agent
from Agents.prompts import REPORT_GENERATOR_PROMPT
from Agents.rate_limit_utils import invoke_with_rate_limit_retry
from Agents.model_factory import create_model
import json
import re
from datetime import datetime


class ReportGeneratorAgent:
    """Agent that generates detailed reports from analysis results"""
    
    def __init__(self, model=None):
        self.model = model or create_model()
        self.agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt=REPORT_GENERATOR_PROMPT
        )
    
    def generate(self, analysis_result: dict) -> dict:
        """
        Generate a detailed report from analysis results.
        
        Args:
            analysis_result: The complete analysis result dictionary
            
        Returns:
            Dictionary with report sections
        """
        # Prepare analysis summary for the agent
        analysis_json = json.dumps(analysis_result, indent=2)
        
        prompt = f"""Generate a comprehensive, detailed report from this misinformation analysis:

{analysis_json}

Create a professional report that explains the findings in clear, accessible language."""
        
        response = invoke_with_rate_limit_retry(self.agent, {
            "messages": [{"role": "user", "content": prompt}]
        })
        
        content = response["messages"][-1].content if "messages" in response else str(response)
        
        # Try to parse structured report if agent returns JSON
        try:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                structured_report = json.loads(match.group())
                return self._build_report(analysis_result, structured_report, content)
        except json.JSONDecodeError:
            pass
        
        # Fallback: use the text content as the report
        return self._build_report(analysis_result, None, content)
    
    def _build_report(self, analysis: dict, structured: dict = None, text_content: str = "") -> dict:
        """Build the final report structure"""
        meta = analysis.get("meta", {})
        verdict = analysis.get("final_verdict", {})
        content_analysis = analysis.get("content_analysis", {})
        media = analysis.get("media_analysis", {})
        
        # Extract key metrics
        claims = content_analysis.get("claims_list", [])
        verified_count = sum(1 for c in claims if c.get("status") == "VERIFIED")
        debunked_count = sum(1 for c in claims if c.get("status") == "DEBUNKED")
        misleading_count = sum(1 for c in claims if c.get("status") == "MISLEADING")
        unverifiable_count = sum(1 for c in claims if c.get("status") == "UNVERIFIABLE")
        
        source = content_analysis.get("source_reputation", {})
        bias = content_analysis.get("political_bias", {})
        credibility = content_analysis.get("credibility_score", {})
        
        # Generate report sections
        report = {
            "meta": {
                "report_id": f"report-{meta.get('scan_id', 'unknown')}",
                "generated_at": datetime.now().isoformat(),
                "scan_id": meta.get("scan_id"),
                "analysis_timestamp": meta.get("timestamp"),
                "source_url": meta.get("url_scanned")
            },
            "executive_summary": self._generate_executive_summary(
                verdict, verified_count, debunked_count, len(claims)
            ),
            "verdict_details": {
                "status": verdict.get("status", "UNKNOWN"),
                "label": verdict.get("label", ""),
                "overall_score": verdict.get("overall_score", 0),
                "confidence": verdict.get("confidence_score", 0),
                "summary": verdict.get("summary_statement", ""),
                "risk_level": self._calculate_risk_level(verdict.get("overall_score", 50))
            },
            "claims_analysis": {
                "total_claims": len(claims),
                "verified": verified_count,
                "debunked": debunked_count,
                "misleading": misleading_count,
                "unverifiable": unverifiable_count,
                "detailed_findings": self._generate_claims_report(claims)
            },
            "source_evaluation": {
                "publisher": source.get("publisher_name", "Unknown"),
                "credibility_rating": credibility.get("rating_text", "Unknown"),
                "credibility_score": credibility.get("value", 0),
                "trust_flags": source.get("trust_history_flags", 0),
                "ownership": source.get("ownership_structure", "Unknown"),
                "assessment": self._generate_source_assessment(source, credibility)
            },
            "bias_analysis": {
                "rating": bias.get("rating", "Center"),
                "confidence": bias.get("confidence", 0),
                "distribution": bias.get("score_distribution", []),
                "assessment": self._generate_bias_assessment(bias)
            },
            "media_analysis": {
                "total_assets": len(media.get("assets", [])),
                "deepfake_probability": media.get("deepfake_probability_avg", 0),
                "assets_details": media.get("assets", []),
                "assessment": self._generate_media_assessment(media)
            },
            "risk_factors": self._extract_risk_factors(verdict),
            "recommendations": self._generate_recommendations(verdict, debunked_count, len(claims)),
            "detailed_narrative": structured.get("narrative", text_content) if structured else text_content,
            "methodology": self._generate_methodology_note()
        }
        
        return report
    
    def _generate_executive_summary(self, verdict: dict, verified: int, debunked: int, total: int) -> str:
        """Generate executive summary"""
        status = verdict.get("status", "UNKNOWN")
        score = verdict.get("overall_score", 0)
        
        if status == "ACCURATE":
            summary = f"This content has been assessed as ACCURATE with an overall credibility score of {score}/100. "
        else:
            summary = f"This content has been assessed as INACCURATE with an overall credibility score of {score}/100. "
        
        if total > 0:
            summary += f"Analysis of {total} factual claims found {verified} verified, {debunked} debunked. "
        
        if debunked > 0:
            summary += f"⚠️ CAUTION: {debunked} claims were found to be false or misleading."
        
        return summary
    
    def _calculate_risk_level(self, score: int) -> str:
        """Calculate risk level from score"""
        if score >= 80:
            return "LOW"
        elif score >= 60:
            return "MODERATE"
        elif score >= 40:
            return "HIGH"
        else:
            return "CRITICAL"
    
    def _generate_claims_report(self, claims: list) -> list:
        """Generate detailed claims report"""
        findings = []
        
        for claim in claims:
            finding = {
                "claim_id": claim.get("id", "UNKNOWN"),
                "statement": claim.get("text", ""),
                "verdict": claim.get("status", "UNKNOWN"),
                "confidence": claim.get("confidence", 0),
                "explanation": claim.get("note", "No additional information available."),
                "sources": []
            }
            
            if claim.get("verification_source"):
                vs = claim["verification_source"]
                finding["sources"].append({
                    "name": vs.get("name", "Unknown"),
                    "url": vs.get("url")
                })
            
            findings.append(finding)
        
        return findings
    
    def _generate_source_assessment(self, source: dict, credibility: dict) -> str:
        """Generate source assessment narrative"""
        publisher = source.get("publisher_name", "Unknown")
        rating = credibility.get("rating_text", "Unknown")
        score = credibility.get("value", 0)
        flags = source.get("trust_history_flags", 0)
        
        assessment = f"The source '{publisher}' has a credibility rating of {rating} ({score}/100). "
        
        if flags > 0:
            assessment += f"⚠️ This source has {flags} trust history flag(s), indicating past issues with accuracy or reliability. "
        else:
            assessment += "No significant trust issues have been identified with this source. "
        
        if score >= 70:
            assessment += "This source is generally considered reliable."
        elif score >= 50:
            assessment += "This source should be approached with moderate caution."
        else:
            assessment += "⚠️ This source has significant credibility concerns."
        
        return assessment
    
    def _generate_bias_assessment(self, bias: dict) -> str:
        """Generate bias assessment narrative"""
        rating = bias.get("rating", "Center")
        confidence = bias.get("confidence", 0)
        
        assessment = f"The content exhibits a {rating} political bias with {confidence:.0%} confidence. "
        
        if rating in ["Far-Left", "Far-Right"]:
            assessment += "⚠️ Strong ideological bias detected. Content may present a one-sided perspective."
        elif rating in ["Left", "Right"]:
            assessment += "Moderate ideological leaning detected. Consider seeking alternative perspectives."
        else:
            assessment += "Content appears relatively balanced in political perspective."
        
        return assessment
    
    def _generate_media_assessment(self, media: dict) -> str:
        """Generate media assessment narrative"""
        assets = media.get("assets", [])
        deepfake_prob = media.get("deepfake_probability_avg", 0)
        
        if not assets:
            return "No media assets were analyzed in this content."
        
        assessment = f"Analysis of {len(assets)} media asset(s) found an average deepfake probability of {deepfake_prob:.0%}. "
        
        deepfakes = [a for a in assets if a.get("is_deepfake")]
        if deepfakes:
            assessment += f"⚠️ WARNING: {len(deepfakes)} asset(s) flagged as potential deepfakes or manipulated media."
        else:
            assessment += "No obvious signs of media manipulation detected."
        
        return assessment
    
    def _extract_risk_factors(self, verdict: dict) -> list:
        """Extract risk factors from verdict"""
        factors = verdict.get("contributing_factors", [])
        
        risk_factors = []
        for factor in factors:
            risk_factors.append({
                "severity": factor.get("severity", "INFO"),
                "category": factor.get("module", "general"),
                "description": factor.get("message", ""),
                "details_link": factor.get("details_link")
            })
        
        return risk_factors
    
    def _generate_recommendations(self, verdict: dict, debunked: int, total: int) -> list:
        """Generate recommendations based on findings"""
        recommendations = []
        score = verdict.get("overall_score", 50)
        
        if score < 40:
            recommendations.append({
                "priority": "HIGH",
                "recommendation": "Do not share or rely on this content without verification from authoritative sources."
            })
        
        if debunked > 0:
            recommendations.append({
                "priority": "HIGH",
                "recommendation": f"Cross-reference the {debunked} debunked claim(s) with fact-checking organizations."
            })
        
        if score < 60:
            recommendations.append({
                "priority": "MEDIUM",
                "recommendation": "Seek additional sources and perspectives before forming conclusions."
            })
        
        recommendations.append({
            "priority": "LOW",
            "recommendation": "Always verify important information through multiple independent sources."
        })
        
        return recommendations
    
    def _generate_methodology_note(self) -> str:
        """Generate methodology explanation"""
        return """This report was generated using AI-powered misinformation detection analysis. 
The system evaluates factual claims, source credibility, political bias, and media authenticity. 
Scores are calculated based on claim verification rates, source reputation, and detected manipulation indicators. 
While this analysis provides valuable insights, it should be used as one tool among many for evaluating information credibility."""
