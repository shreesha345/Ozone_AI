"""
Misinformation Detection Agent (Main Orchestrator)
Coordinates all subagents to produce comprehensive analysis.
Uses parallel processing for claim verification.

This is the main orchestrator that coordinates statement extraction, fact-checking,
source analysis, bias detection, media analysis, and verdict synthesis. It uses
ThreadPoolExecutor for parallel claim verification to improve performance.
"""
from Agents.statementExtractorAgent import StatementExtractorAgent
from Agents.factCheckerAgent import FactCheckerAgent
from Agents.sourceAnalyzerAgent import SourceAnalyzerAgent
from Agents.politicalBiasAgent import PoliticalBiasAgent
from Agents.mediaAnalyzerAgent import MediaAnalyzerAgent
from Agents.verdictSynthesizerAgent import VerdictSynthesizerAgent
from Agents.neo4j_tools import Neo4jClient
from Agents.model_factory import create_model
from config import Config
from concurrent.futures import ThreadPoolExecutor, as_completed
import uuid
from datetime import datetime, timezone
import re
import threading


class MisinformationDetector:
    """
    Main orchestrator for misinformation detection.
    Coordinates all subagents and produces full analysis report.
    Uses parallel processing for faster claim verification.
    """
    
    VERSION = "v3.1.0"
    
    def __init__(self, store_in_neo4j: bool = True):
        self.model = create_model()
        self.MAX_PARALLEL_CLAIMS = Config.MAX_PARALLEL_CLAIMS  # Max concurrent claim checks from config
        
        # Initialize all subagents
        self.statement_extractor = StatementExtractorAgent(model=self.model)
        self.fact_checker = FactCheckerAgent(model=self.model)
        self.source_analyzer = SourceAnalyzerAgent(model=self.model)
        self.political_bias_analyzer = PoliticalBiasAgent(model=self.model)
        self.media_analyzer = MediaAnalyzerAgent(model=self.model)
        self.verdict_synthesizer = VerdictSynthesizerAgent(model=self.model)
        
        # Neo4j storage
        self.store_in_neo4j = store_in_neo4j
        self.neo4j_client = Neo4jClient() if store_in_neo4j else None
        
        # Thread-safe print lock
        self._print_lock = threading.Lock()
    
    def _generate_scan_id(self) -> str:
        """Generate unique scan ID"""
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        unique_id = uuid.uuid4().hex[:6]
        return f"misinfo-scan-{date_str}-{unique_id}"
    
    def _extract_url(self, text: str) -> str:
        """Extract URL from text if present"""
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        match = re.search(url_pattern, text)
        return match.group() if match else None
    
    def _extract_publisher(self, url: str) -> str:
        """Extract publisher/domain from URL"""
        if not url:
            return "Unknown Source"
        match = re.search(r'https?://(?:www\.)?([^/]+)', url)
        return match.group(1) if match else "Unknown Source"
    
    def _check_single_claim(self, statement: str, claim_id: str) -> dict:
        """Check a single claim (used by parallel executor)"""
        with self._print_lock:
            print(f"  🔄 Starting {claim_id}...")
        
        result = self.fact_checker.check(statement, claim_id)
        
        with self._print_lock:
            status = result.get('status', 'UNKNOWN')
            status_emoji = {
                'VERIFIED': '✅',
                'DEBUNKED': '❌',
                'MISLEADING': '⚠️',
                'MISSING_CONTEXT': '📝',
                'UNVERIFIABLE': '❓'
            }.get(status, '❓')
            print(f"  {status_emoji} {claim_id}: {status}")
        
        return result
    
    def _parallel_fact_check(self, statements: list) -> list:
        """
        Fact-check multiple statements in parallel.
        
        Args:
            statements: List of statement strings
            
        Returns:
            List of fact-check results (ordered by claim ID)
        """
        if not statements:
            return []
        
        # Prepare claim data
        claims_data = [
            (statement, f"CLAIM_A{i}") 
            for i, statement in enumerate(statements, 1)
        ]
        
        results = {}
        
        # Use ThreadPoolExecutor for parallel execution
        with ThreadPoolExecutor(max_workers=self.MAX_PARALLEL_CLAIMS) as executor:
            # Submit all tasks
            future_to_claim = {
                executor.submit(self._check_single_claim, stmt, cid): cid
                for stmt, cid in claims_data
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_claim):
                claim_id = future_to_claim[future]
                try:
                    result = future.result()
                    results[claim_id] = result
                except Exception as e:
                    with self._print_lock:
                        print(f"  ❌ {claim_id}: Error - {str(e)}")
                    results[claim_id] = {
                        "id": claim_id,
                        "text": "",
                        "status": "UNVERIFIABLE",
                        "confidence": 0,
                        "note": f"Error during verification: {str(e)}"
                    }
        
        # Return results in order
        return [results[f"CLAIM_A{i}"] for i in range(1, len(statements) + 1)]

    def analyze(self, text: str, url: str = None) -> dict:
        """
        Main analysis function - orchestrates the full pipeline.
        
        Args:
            text: The article/paragraph to analyze
            url: Optional URL of the source
            
        Returns:
            Complete analysis in schema format
        """
        start_time = datetime.now(timezone.utc)
        scan_id = self._generate_scan_id()
        source_url = url or self._extract_url(text) or "direct-input"
        
        print("\n" + "=" * 60)
        print("MISINFORMATION DETECTION ANALYSIS")
        print(f"Scan ID: {scan_id}")
        print("=" * 60)
        
        # Step 1: Extract statements
        print("\n[1/6] Extracting factual statements...")
        statements = self.statement_extractor.extract(text)
        print(f"  → Found {len(statements)} statements")
        
        # Step 2: Fact-check each statement IN PARALLEL
        print("\n[2/6] Fact-checking claims (parallel)...")
        claims_results = self._parallel_fact_check(statements)
        print(f"  → Completed {len(claims_results)} claim checks")
        
        # Step 3: Analyze source reputation
        print("\n[3/6] Analyzing source reputation...")
        publisher = self._extract_publisher(source_url)
        source_data = self.source_analyzer.analyze(publisher)
        print(f"  → Publisher: {source_data.get('publisher_name', 'Unknown')}")
        print(f"  → Credibility: {source_data.get('credibility_score', {}).get('rating_text', 'Unknown')}")
        
        # Step 4: Analyze political bias
        print("\n[4/6] Analyzing political bias...")
        bias_data = self.political_bias_analyzer.analyze(text)
        print(f"  → Rating: {bias_data.get('rating', 'Unknown')}")
        
        # Step 5: Analyze media
        print("\n[5/6] Analyzing media content...")
        media_urls = self.media_analyzer.extract_media_urls(text)
        media_data = self.media_analyzer.analyze(text, media_urls)
        print(f"  → Found {len(media_data.get('assets', []))} media assets")
        deepfake_prob = media_data.get('deepfake_probability_avg', 0)
        try:
            deepfake_prob = float(deepfake_prob) if deepfake_prob else 0.0
            print(f"  → Deepfake probability: {deepfake_prob:.1%}")
        except (ValueError, TypeError):
            print(f"  → Deepfake probability: {deepfake_prob}")
        
        # Step 6: Synthesize final verdict
        print("\n[6/6] Synthesizing final verdict...")
        verdict = self.verdict_synthesizer.synthesize(
            claims_results, source_data, bias_data, media_data
        )
        print(f"  → Status: {verdict.get('status', 'UNKNOWN')}")
        print(f"  → Score: {verdict.get('overall_score', 0)}/100")
        
        # Calculate scan duration
        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Build full report
        report = self._build_report(
            scan_id=scan_id,
            url=source_url,
            duration_ms=duration_ms,
            verdict=verdict,
            claims=claims_results,
            source=source_data,
            bias=bias_data,
            media=media_data
        )
        
        # Store in Neo4j
        if self.store_in_neo4j and self.neo4j_client:
            print("\n[Neo4j] Storing analysis in graph database...")
            try:
                self.neo4j_client.store_full_analysis(report)
                print("  → Stored successfully")
            except Exception as e:
                print(f"  → Storage error: {e}")
        
        # Print summary
        self._print_summary(report)
        
        return report

    def _build_report(self, scan_id: str, url: str, duration_ms: int,
                      verdict: dict, claims: list, source: dict,
                      bias: dict, media: dict) -> dict:
        """Build the full report in schema format"""
        
        # Build cross-references between claims and media
        cross_refs = []
        for claim in claims:
            media_id = claim.get("supported_by_media_id")
            if media_id:
                cross_refs.append({
                    "type": "EVIDENCE_FABRICATION" if claim.get("status") == "DEBUNKED" else "EVIDENCE_SUPPORT",
                    "primary_element_id": claim.get("id"),
                    "secondary_element_id": media_id,
                    "description": f"Claim '{claim.get('id')}' is linked to media '{media_id}'"
                })
        
        return {
            "meta": {
                "scan_id": scan_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "url_scanned": url,
                "agent_version": self.VERSION,
                "scan_duration_ms": duration_ms
            },
            "final_verdict": {
                "status": verdict.get("status", "UNKNOWN"),
                "label": verdict.get("label", "Analysis Complete"),
                "overall_score": verdict.get("overall_score", 50),
                "confidence_score": verdict.get("confidence_score", 0.5),
                "summary_statement": verdict.get("summary_statement", ""),
                "contributing_factors": verdict.get("contributing_factors", [])
            },
            "content_analysis": {
                "credibility_score": source.get("credibility_score", {
                    "value": 50,
                    "rating_text": "Medium",
                    "color_code": "#F59E0B"
                }),
                "source_reputation": {
                    "publisher_name": source.get("publisher_name", "Unknown"),
                    "domain_rating_score": source.get("domain_rating_score", 50),
                    "trust_history_flags": source.get("trust_history_flags", 0),
                    "ownership_structure": source.get("ownership_structure", "Unknown"),
                    "bias_source": source.get("bias_source")
                },
                "political_bias": {
                    "rating": bias.get("rating", "Center"),
                    "confidence": bias.get("confidence", 0.5),
                    "score_distribution": bias.get("score_distribution", [
                        {"label": "Left", "value": 33},
                        {"label": "Center", "value": 34},
                        {"label": "Right", "value": 33}
                    ])
                },
                "claims_list": [
                    {
                        "id": c.get("id"),
                        "text": c.get("text"),
                        "status": c.get("status"),
                        "confidence": c.get("confidence", 0.5),
                        "verification_source": c.get("verification_source"),
                        "note": c.get("note"),
                        "supported_by_media_id": c.get("supported_by_media_id")
                    }
                    for c in claims
                ]
            },
            "media_analysis": {
                "deepfake_probability_avg": media.get("deepfake_probability_avg", 0),
                "assets": media.get("assets", [])
            },
            "cross_references": cross_refs
        }
    
    def _print_summary(self, report: dict):
        """Print analysis summary"""
        verdict = report["final_verdict"]
        content = report["content_analysis"]
        media = report["media_analysis"]
        
        print("\n" + "=" * 60)
        print("ANALYSIS COMPLETE")
        print("=" * 60)
        
        # Verdict
        status_emoji = "✅" if verdict["status"] == "ACCURATE" else "❌"
        print(f"\n{status_emoji} Final Verdict: {verdict['status']}")
        print(f"   Label: {verdict['label']}")
        print(f"   Overall Score: {verdict['overall_score']}/100")
        try:
            conf_score = float(verdict['confidence_score'])
            print(f"   Confidence: {conf_score:.0%}")
        except (ValueError, TypeError):
            print(f"   Confidence: {verdict['confidence_score']}")
        print(f"   Summary: {verdict['summary_statement']}")
        
        # Claims breakdown
        claims = content["claims_list"]
        if claims:
            print(f"\n📋 Claims Analysis ({len(claims)} claims):")
            status_counts = {}
            for c in claims:
                s = c.get("status", "UNKNOWN")
                status_counts[s] = status_counts.get(s, 0) + 1
            for status, count in status_counts.items():
                pct = (count / len(claims)) * 100
                print(f"   - {status}: {count} ({pct:.0f}%)")
        
        # Source
        source = content["source_reputation"]
        cred = content["credibility_score"]
        print(f"\n🔍 Source: {source['publisher_name']}")
        print(f"   Credibility: {cred.get('rating_text', 'Unknown')} ({cred.get('value', 0)}/100)")
        print(f"   Trust Flags: {source['trust_history_flags']}")
        
        # Bias
        bias = content["political_bias"]
        try:
            bias_conf = float(bias['confidence'])
            print(f"\n⚖️ Political Bias: {bias['rating']} (confidence: {bias_conf:.0%})")
        except (ValueError, TypeError):
            print(f"\n⚖️ Political Bias: {bias['rating']} (confidence: {bias['confidence']})")
        
        # Media
        if media["assets"]:
            print(f"\n🎬 Media Analysis ({len(media['assets'])} assets):")
            try:
                df_avg = float(media['deepfake_probability_avg'])
                print(f"   Deepfake Probability: {df_avg:.0%}")
            except (ValueError, TypeError):
                print(f"   Deepfake Probability: {media['deepfake_probability_avg']}")
            for asset in media["assets"]:
                df_status = "⚠️ DEEPFAKE" if asset.get("is_deepfake") else "✓ OK"
                print(f"   - {asset.get('type', 'unknown')}: {df_status}")
        
        # Contributing factors
        if verdict["contributing_factors"]:
            print(f"\n⚠️ Contributing Factors:")
            for f in verdict["contributing_factors"]:
                print(f"   [{f.get('severity', 'INFO')}] {f.get('message', '')}")
        
        print("\n" + "=" * 60)
        print(f"Scan ID: {report['meta']['scan_id']}")
        print(f"Duration: {report['meta']['scan_duration_ms']}ms")
        print("=" * 60)
    
    def close(self):
        """Clean up resources"""
        if self.neo4j_client:
            self.neo4j_client.close()
