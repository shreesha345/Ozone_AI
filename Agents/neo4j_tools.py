"""
Neo4j database tools for misinformation analysis storage

This module provides a client for storing misinformation analysis results in a Neo4j graph database,
creating nodes for scans, verdicts, claims, sources, and media assets with their relationships.
"""
import os
from typing import Optional, Dict, Any, List
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")


class Neo4jClient:
    """Neo4j client for misinformation analysis storage"""
    
    def __init__(self):
        self.driver = GraphDatabase.driver(
            NEO4J_URI, 
            auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
        )
    
    def close(self):
        self.driver.close()
    
    def _run_query(self, query: str, **params) -> List[Dict]:
        with self.driver.session(database=NEO4J_DATABASE) as session:
            result = session.run(query, **params)
            return [dict(record) for record in result]
    
    def create_scan_node(self, scan_data: Dict) -> str:
        """Create the main scan node"""
        query = """
        CREATE (s:Scan {
            scan_id: $scan_id,
            timestamp: $timestamp,
            url_scanned: $url_scanned,
            agent_version: $agent_version,
            scan_duration_ms: $scan_duration_ms
        })
        RETURN elementId(s) as id
        """
        result = self._run_query(query, **scan_data)
        return result[0]["id"] if result else None
    
    def create_verdict_node(self, scan_id: str, verdict_data: Dict) -> str:
        """Create verdict node and link to scan"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})
        CREATE (v:Verdict {
            status: $status,
            label: $label,
            overall_score: $overall_score,
            confidence_score: $confidence_score,
            summary_statement: $summary_statement
        })
        CREATE (s)-[:HAS_VERDICT]->(v)
        RETURN elementId(v) as id
        """
        result = self._run_query(query, scan_id=scan_id, **verdict_data)
        return result[0]["id"] if result else None
    
    def create_contributing_factor(self, scan_id: str, factor: Dict) -> str:
        """Create contributing factor node"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})-[:HAS_VERDICT]->(v:Verdict)
        CREATE (f:ContributingFactor {
            module: $module,
            severity: $severity,
            message: $message,
            details_link: $details_link
        })
        CREATE (v)-[:HAS_FACTOR]->(f)
        RETURN elementId(f) as id
        """
        result = self._run_query(
            query, 
            scan_id=scan_id,
            module=factor.get("module"),
            severity=factor.get("severity"),
            message=factor.get("message"),
            details_link=factor.get("details_link")
        )
        return result[0]["id"] if result else None
    
    def create_content_analysis_node(self, scan_id: str, content_data: Dict) -> str:
        """Create content analysis node"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})
        CREATE (c:ContentAnalysis {
            credibility_score: $credibility_score,
            credibility_rating: $credibility_rating,
            credibility_color: $credibility_color
        })
        CREATE (s)-[:HAS_CONTENT_ANALYSIS]->(c)
        RETURN elementId(c) as id
        """
        cred = content_data.get("credibility_score", {})
        result = self._run_query(
            query,
            scan_id=scan_id,
            credibility_score=cred.get("value", 0),
            credibility_rating=cred.get("rating_text", "Unknown"),
            credibility_color=cred.get("color_code", "#888888")
        )
        return result[0]["id"] if result else None
    
    def create_source_reputation_node(self, scan_id: str, source_data: Dict) -> str:
        """Create source reputation node"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})-[:HAS_CONTENT_ANALYSIS]->(c:ContentAnalysis)
        CREATE (sr:SourceReputation {
            publisher_name: $publisher_name,
            domain_rating_score: $domain_rating_score,
            trust_history_flags: $trust_history_flags,
            ownership_structure: $ownership_structure,
            bias_source: $bias_source
        })
        CREATE (c)-[:HAS_SOURCE_REPUTATION]->(sr)
        RETURN elementId(sr) as id
        """
        result = self._run_query(query, scan_id=scan_id, **source_data)
        return result[0]["id"] if result else None
    
    def create_political_bias_node(self, scan_id: str, bias_data: Dict) -> str:
        """Create political bias node"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})-[:HAS_CONTENT_ANALYSIS]->(c:ContentAnalysis)
        CREATE (pb:PoliticalBias {
            rating: $rating,
            confidence: $confidence,
            left_score: $left_score,
            center_score: $center_score,
            right_score: $right_score
        })
        CREATE (c)-[:HAS_POLITICAL_BIAS]->(pb)
        RETURN elementId(pb) as id
        """
        dist = bias_data.get("score_distribution", [])
        left = next((d["value"] for d in dist if d["label"] == "Left"), 0)
        center = next((d["value"] for d in dist if d["label"] == "Center"), 0)
        right = next((d["value"] for d in dist if "Right" in d["label"]), 0)
        
        result = self._run_query(
            query,
            scan_id=scan_id,
            rating=bias_data.get("rating", "Unknown"),
            confidence=bias_data.get("confidence", 0),
            left_score=left,
            center_score=center,
            right_score=right
        )
        return result[0]["id"] if result else None
    
    def create_claim_node(self, scan_id: str, claim: Dict) -> str:
        """Create claim node"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})-[:HAS_CONTENT_ANALYSIS]->(c:ContentAnalysis)
        CREATE (cl:Claim {
            claim_id: $claim_id,
            text: $text,
            status: $status,
            confidence: $confidence,
            verification_source_name: $verification_source_name,
            verification_source_url: $verification_source_url,
            note: $note,
            supported_by_media_id: $supported_by_media_id
        })
        CREATE (c)-[:HAS_CLAIM]->(cl)
        RETURN elementId(cl) as id
        """
        vs = claim.get("verification_source", {})
        result = self._run_query(
            query,
            scan_id=scan_id,
            claim_id=claim.get("id"),
            text=claim.get("text"),
            status=claim.get("status"),
            confidence=claim.get("confidence", 0),
            verification_source_name=vs.get("name"),
            verification_source_url=vs.get("url"),
            note=claim.get("note"),
            supported_by_media_id=claim.get("supported_by_media_id")
        )
        return result[0]["id"] if result else None
    
    def create_media_analysis_node(self, scan_id: str, media_data: Dict) -> str:
        """Create media analysis node"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})
        CREATE (ma:MediaAnalysis {
            deepfake_probability_avg: $deepfake_probability_avg
        })
        CREATE (s)-[:HAS_MEDIA_ANALYSIS]->(ma)
        RETURN elementId(ma) as id
        """
        result = self._run_query(
            query,
            scan_id=scan_id,
            deepfake_probability_avg=media_data.get("deepfake_probability_avg", 0)
        )
        return result[0]["id"] if result else None
    
    def create_media_asset_node(self, scan_id: str, asset: Dict) -> str:
        """Create media asset node"""
        forensics = asset.get("forensics", {})
        query = """
        MATCH (s:Scan {scan_id: $scan_id})-[:HAS_MEDIA_ANALYSIS]->(ma:MediaAnalysis)
        CREATE (a:MediaAsset {
            asset_id: $asset_id,
            type: $type,
            url: $url,
            ai_probability: $ai_probability,
            is_deepfake: $is_deepfake,
            artifact_flag: $artifact_flag,
            audio_sync_status: $audio_sync_status,
            reverse_search_matches: $reverse_search_matches,
            metadata_signature: $metadata_signature,
            copy_paste_detection: $copy_paste_detection
        })
        CREATE (ma)-[:HAS_ASSET]->(a)
        RETURN elementId(a) as id
        """
        result = self._run_query(
            query,
            scan_id=scan_id,
            asset_id=asset.get("id"),
            type=asset.get("type"),
            url=asset.get("url"),
            ai_probability=asset.get("ai_probability", 0),
            is_deepfake=asset.get("is_deepfake", False),
            artifact_flag=forensics.get("artifact_flag"),
            audio_sync_status=forensics.get("audio_sync_status"),
            reverse_search_matches=forensics.get("reverse_search_matches", 0),
            metadata_signature=forensics.get("metadata_signature"),
            copy_paste_detection=forensics.get("copy_paste_detection", False)
        )
        return result[0]["id"] if result else None
    
    def create_cross_reference(self, scan_id: str, xref: Dict) -> str:
        """Create cross-reference relationship between claim and media"""
        query = """
        MATCH (s:Scan {scan_id: $scan_id})
        MATCH (s)-[:HAS_CONTENT_ANALYSIS]->()-[:HAS_CLAIM]->(cl:Claim {claim_id: $primary_id})
        MATCH (s)-[:HAS_MEDIA_ANALYSIS]->()-[:HAS_ASSET]->(a:MediaAsset {asset_id: $secondary_id})
        CREATE (cl)-[:CROSS_REFERENCE {
            type: $type,
            description: $description
        }]->(a)
        RETURN cl, a
        """
        result = self._run_query(
            query,
            scan_id=scan_id,
            primary_id=xref.get("primary_element_id"),
            secondary_id=xref.get("secondary_element_id"),
            type=xref.get("type"),
            description=xref.get("description")
        )
        return len(result) > 0
    
    def store_full_analysis(self, analysis: Dict) -> str:
        """Store complete analysis in Neo4j graph"""
        meta = analysis.get("meta", {})
        scan_id = meta.get("scan_id")
        
        # Create main scan node
        self.create_scan_node(meta)
        
        # Create verdict
        verdict = analysis.get("final_verdict", {})
        self.create_verdict_node(scan_id, {
            "status": verdict.get("status"),
            "label": verdict.get("label"),
            "overall_score": verdict.get("overall_score"),
            "confidence_score": verdict.get("confidence_score"),
            "summary_statement": verdict.get("summary_statement")
        })
        
        # Create contributing factors
        for factor in verdict.get("contributing_factors", []):
            self.create_contributing_factor(scan_id, factor)
        
        # Create content analysis
        content = analysis.get("content_analysis", {})
        self.create_content_analysis_node(scan_id, content)
        
        # Create source reputation
        if "source_reputation" in content:
            self.create_source_reputation_node(scan_id, content["source_reputation"])
        
        # Create political bias
        if "political_bias" in content:
            self.create_political_bias_node(scan_id, content["political_bias"])
        
        # Create claims
        for claim in content.get("claims_list", []):
            self.create_claim_node(scan_id, claim)
        
        # Create media analysis
        media = analysis.get("media_analysis", {})
        if media:
            self.create_media_analysis_node(scan_id, media)
            for asset in media.get("assets", []):
                self.create_media_asset_node(scan_id, asset)
        
        # Create cross-references
        for xref in analysis.get("cross_references", []):
            self.create_cross_reference(scan_id, xref)
        
        return scan_id
