"""
FastAPI Server for Misinformation Detection
Provides REST API and WebSocket endpoints for analysis.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
import asyncio
import json
from datetime import datetime

from Agents.misinfoAgent import MisinformationDetector
from Agents.reportGeneratorAgent import ReportGeneratorAgent
from Agents.search_utils import search_logger
from config import Config


# Global detector instance (lazy loaded)
_detector = None
_report_generator = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    try:
        Config.validate()
        print("✅ Configuration validated successfully")
    except ValueError as e:
        print(f"⚠️ Configuration warning: {e}")
    
    yield
    
    # Shutdown
    global _detector, _report_generator
    if _detector:
        _detector.close()
        _detector = None
    _report_generator = None


app = FastAPI(
    title="Misinformation Detection API",
    description="API for detecting misinformation in text content",
    version="3.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    input: str  # Can be text content or URL - system auto-detects
    store_in_neo4j: Optional[bool] = True


def is_url(text: str) -> bool:
    """Check if input is a URL"""
    import re
    url_pattern = r'^https?://[^\s<>"{}|\\^`\[\]]+'
    return bool(re.match(url_pattern, text.strip()))


async def fetch_url_content(url: str) -> tuple[str, str]:
    """Fetch content from URL and return (content, url)"""
    import requests
    from bs4 import BeautifulSoup
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text(separator='\n', strip=True)
        
        # Clean up whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        content = '\n'.join(lines)
        
        # Limit content length
        if len(content) > 15000:
            content = content[:15000] + "..."
        
        return content, url
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")


class LogCapture:
    """Captures print output and search logs for streaming"""
    
    def __init__(self):
        self.logs = []
        self.search_logs = []
    
    def add_log(self, log_type: str, message: str, data: dict = None):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": log_type,
            "message": message,
            "data": data or {}
        }
        self.logs.append(entry)
        return entry
    
    def get_all_logs(self):
        return self.logs
    
    def clear(self):
        self.logs = []
        self.search_logs = []


def get_detector(store_in_neo4j: bool = True) -> MisinformationDetector:
    global _detector
    if _detector is None:
        _detector = MisinformationDetector(store_in_neo4j=store_in_neo4j)
    return _detector


def get_report_generator() -> ReportGeneratorAgent:
    global _report_generator
    if _report_generator is None:
        _report_generator = ReportGeneratorAgent()
    return _report_generator


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Misinformation Detection API",
        "version": "3.1.0"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """
    Direct analysis endpoint - returns full result.
    
    Accepts either:
    - Text content to analyze
    - URL to fetch and analyze
    
    For real-time progress updates, use the WebSocket endpoint instead.
    """
    if not request.input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    
    try:
        # Determine if input is URL or text
        user_input = request.input.strip()
        
        if is_url(user_input):
            # Fetch content from URL
            text, url = await fetch_url_content(user_input)
        else:
            # Use input as text directly
            text = user_input
            url = None
        
        # Clear previous search logs
        search_logger.clear()
        
        detector = get_detector(request.store_in_neo4j)
        result = detector.analyze(text, url)
        
        # Include search logs in response
        result["search_logs"] = search_logger.get_logs()
        result["search_summary"] = search_logger.summary()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/report")
async def analyze_with_report(request: AnalyzeRequest):
    """
    Analysis endpoint with detailed report generation.
    
    Accepts either:
    - Text content to analyze
    - URL to fetch and analyze
    
    Returns both the raw analysis and a detailed human-readable report.
    """
    if not request.input.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    
    try:
        # Determine if input is URL or text
        user_input = request.input.strip()
        
        if is_url(user_input):
            # Fetch content from URL
            text, url = await fetch_url_content(user_input)
        else:
            # Use input as text directly
            text = user_input
            url = None
        
        # Clear previous search logs
        search_logger.clear()
        
        # Run analysis
        detector = get_detector(request.store_in_neo4j)
        analysis_result = detector.analyze(text, url)
        
        # Include search logs in analysis
        analysis_result["search_logs"] = search_logger.get_logs()
        analysis_result["search_summary"] = search_logger.summary()
        
        # Generate detailed report
        report_generator = get_report_generator()
        detailed_report = await asyncio.to_thread(report_generator.generate, analysis_result)
        
        return {
            "analysis": analysis_result,
            "report": detailed_report
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class WebSocketLogHandler:
    """Handles streaming logs to WebSocket clients"""
    
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.logs = []
    
    async def send_log(self, log_type: str, message: str, data: dict = None):
        """Send a log entry to the WebSocket client"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": log_type,
            "message": message,
            "data": data or {}
        }
        self.logs.append(entry)
        try:
            await self.websocket.send_json(entry)
        except Exception:
            pass  # Client may have disconnected
    
    async def send_step(self, step: int, total: int, name: str, status: str = "running"):
        """Send a step progress update"""
        await self.send_log("step", f"[{step}/{total}] {name}", {
            "step": step,
            "total": total,
            "name": name,
            "status": status
        })
    
    async def send_search(self, query: str, success: bool, result: str = None, sources: list = None):
        """Send a search log"""
        await self.send_log("search", f"Search: {query[:80]}...", {
            "query": query,
            "success": success,
            "result_preview": result[:200] if result else None,
            "sources": sources or []
        })
    
    async def send_claim(self, claim_id: str, text: str, status: str, confidence: float, note: str = None):
        """Send a claim verification update"""
        await self.send_log("claim", f"{claim_id}: {status}", {
            "id": claim_id,
            "text": text,
            "status": status,
            "confidence": confidence,
            "note": note
        })
    
    async def send_result(self, result: dict):
        """Send the final result"""
        await self.send_log("result", "Analysis complete", {"result": result})
    
    async def send_error(self, error: str):
        """Send an error"""
        await self.send_log("error", error, {"error": error})


async def run_analysis_with_streaming(
    websocket: WebSocket,
    user_input: str,
    store_in_neo4j: bool = True
):
    """Run analysis with real-time streaming to WebSocket"""
    from Agents.statementExtractorAgent import StatementExtractorAgent
    from Agents.factCheckerAgent import FactCheckerAgent
    from Agents.sourceAnalyzerAgent import SourceAnalyzerAgent
    from Agents.politicalBiasAgent import PoliticalBiasAgent
    from Agents.mediaAnalyzerAgent import MediaAnalyzerAgent
    from Agents.verdictSynthesizerAgent import VerdictSynthesizerAgent
    from Agents.neo4j_tools import Neo4jClient
    from Agents.model_factory import create_model
    import uuid
    import re
    import requests
    from bs4 import BeautifulSoup
    
    handler = WebSocketLogHandler(websocket)
    
    # Get model info
    from Agents.model_factory import get_model_info
    model_info = get_model_info()
    
    await handler.send_log("info", "Starting misinformation analysis...")
    await handler.send_log("info", f"Using model: {model_info['model']} ({model_info['provider']})", {
        "model": model_info['model'],
        "provider": model_info['provider'],
        "temperature": model_info['temperature']
    })
    
    # Determine if input is URL or text
    user_input = user_input.strip()
    url = None
    
    if is_url(user_input):
        await handler.send_log("info", f"Detected URL input: {user_input}")
        await handler.send_log("info", "Fetching content from URL...")
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = requests.get(user_input, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            text = soup.get_text(separator='\n', strip=True)
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            text = '\n'.join(lines)
            
            if len(text) > 15000:
                text = text[:15000] + "..."
            
            url = user_input
            await handler.send_log("info", f"Fetched {len(text)} characters from URL")
        except Exception as e:
            await handler.send_error(f"Failed to fetch URL: {str(e)}")
            return
    else:
        text = user_input
        await handler.send_log("info", f"Analyzing text input ({len(text)} characters)")
    
    # Initialize model
    model = create_model()
    
    # Initialize agents
    statement_extractor = StatementExtractorAgent(model=model)
    fact_checker = FactCheckerAgent(model=model)
    source_analyzer = SourceAnalyzerAgent(model=model)
    political_bias_analyzer = PoliticalBiasAgent(model=model)
    media_analyzer = MediaAnalyzerAgent(model=model)
    verdict_synthesizer = VerdictSynthesizerAgent(model=model)
    neo4j_client = Neo4jClient() if store_in_neo4j else None
    
    # Generate scan ID
    start_time = datetime.now()
    date_str = start_time.strftime("%Y%m%d")
    unique_id = uuid.uuid4().hex[:6]
    scan_id = f"misinfo-scan-{date_str}-{unique_id}"
    
    await handler.send_log("info", f"Scan ID: {scan_id}")
    
    # Extract URL from text if not already set
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    source_url = url or (re.search(url_pattern, text).group() if re.search(url_pattern, text) else "direct-input")
    await handler.send_log("info", f"Source URL: {source_url}")
    
    # Extract publisher
    publisher = "Unknown Source"
    if source_url != "direct-input":
        match = re.search(r'https?://(?:www\.)?([^/]+)', source_url)
        publisher = match.group(1) if match else "Unknown Source"
    
    # Clear search logs
    search_logger.clear()
    
    try:
        # Step 1: Extract statements (limited to avoid rate limits)
        from config import Config
        max_claims = Config.MAX_CLAIMS_TO_CHECK
        
        await handler.send_step(1, 6, "Extracting factual statements")
        statements = await asyncio.to_thread(statement_extractor.extract, text, max_claims)
        await handler.send_log("info", f"Found {len(statements)} statements (limited to {max_claims} to avoid rate limits)", {"statements": statements})
        await handler.send_step(1, 6, "Extracting factual statements", "complete")
        
        # Step 2: Fact-check claims (with streaming)
        await handler.send_step(2, 6, "Fact-checking claims")
        claims_results = []
        
        for i, statement in enumerate(statements, 1):
            claim_id = f"CLAIM_A{i}"
            await handler.send_log("claim_start", f"Checking {claim_id}...", {
                "id": claim_id,
                "text": statement[:100] + "..." if len(statement) > 100 else statement
            })
            
            result = await asyncio.to_thread(fact_checker.check, statement, claim_id)
            claims_results.append(result)
            
            # Send claim result
            await handler.send_claim(
                claim_id=result.get("id", claim_id),
                text=result.get("text", statement),
                status=result.get("status", "UNKNOWN"),
                confidence=result.get("confidence", 0.5),
                note=result.get("note")
            )
            
            # Send any search logs that occurred
            for log in search_logger.get_logs()[len(handler.logs):]:
                await handler.send_search(
                    query=log.get("query", ""),
                    success=log.get("success", False),
                    result=log.get("result_preview")
                )
        
        await handler.send_step(2, 6, "Fact-checking claims", "complete")
        
        # Step 3: Analyze source
        await handler.send_step(3, 6, "Analyzing source reputation")
        await handler.send_log("info", f"Analyzing publisher: {publisher}")
        source_data = await asyncio.to_thread(source_analyzer.analyze, publisher)
        await handler.send_log("source", f"Source credibility: {source_data.get('credibility_score', {}).get('rating_text', 'Unknown')}", source_data)
        await handler.send_step(3, 6, "Analyzing source reputation", "complete")
        
        # Step 4: Analyze political bias
        await handler.send_step(4, 6, "Analyzing political bias")
        bias_data = await asyncio.to_thread(political_bias_analyzer.analyze, text)
        await handler.send_log("bias", f"Political bias: {bias_data.get('rating', 'Unknown')}", bias_data)
        await handler.send_step(4, 6, "Analyzing political bias", "complete")
        
        # Step 5: Analyze media
        await handler.send_step(5, 6, "Analyzing media content")
        media_urls = media_analyzer.extract_media_urls(text)
        await handler.send_log("info", f"Found {len(media_urls)} media URLs", {"urls": media_urls})
        media_data = await asyncio.to_thread(media_analyzer.analyze, text, media_urls)
        deepfake_prob = media_data.get('deepfake_probability_avg', 0)
        try:
            deepfake_prob = float(deepfake_prob) if deepfake_prob else 0.0
            deepfake_msg = f"Deepfake probability: {deepfake_prob:.1%}"
        except (ValueError, TypeError):
            deepfake_msg = f"Deepfake probability: {deepfake_prob}"
        await handler.send_log("media", deepfake_msg, media_data)
        await handler.send_step(5, 6, "Analyzing media content", "complete")
        
        # Step 6: Synthesize verdict
        await handler.send_step(6, 6, "Synthesizing final verdict")
        verdict = await asyncio.to_thread(
            verdict_synthesizer.synthesize,
            claims_results, source_data, bias_data, media_data
        )
        await handler.send_log("verdict", f"Verdict: {verdict.get('status', 'UNKNOWN')} - Score: {verdict.get('overall_score', 0)}/100", verdict)
        await handler.send_step(6, 6, "Synthesizing final verdict", "complete")
        
        # Calculate duration
        end_time = datetime.now()
        duration_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Build cross-references
        cross_refs = []
        for claim in claims_results:
            media_id = claim.get("supported_by_media_id")
            if media_id:
                cross_refs.append({
                    "type": "EVIDENCE_FABRICATION" if claim.get("status") == "DEBUNKED" else "EVIDENCE_SUPPORT",
                    "primary_element_id": claim.get("id"),
                    "secondary_element_id": media_id,
                    "description": f"Claim '{claim.get('id')}' is linked to media '{media_id}'"
                })
        
        # Build final report
        report = {
            "meta": {
                "scan_id": scan_id,
                "timestamp": start_time.isoformat(),
                "url_scanned": source_url,
                "agent_version": "v3.1.0",
                "scan_duration_ms": duration_ms,
                "model_used": model_info['model'],
                "model_provider": model_info['provider'],
                "model_temperature": model_info['temperature']
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
                "credibility_score": source_data.get("credibility_score", {
                    "value": 50, "rating_text": "Medium", "color_code": "#F59E0B"
                }),
                "source_reputation": {
                    "publisher_name": source_data.get("publisher_name", "Unknown"),
                    "domain_rating_score": source_data.get("domain_rating_score", 50),
                    "trust_history_flags": source_data.get("trust_history_flags", 0),
                    "ownership_structure": source_data.get("ownership_structure", "Unknown"),
                    "bias_source": source_data.get("bias_source")
                },
                "political_bias": {
                    "rating": bias_data.get("rating", "Center"),
                    "confidence": bias_data.get("confidence", 0.5),
                    "score_distribution": bias_data.get("score_distribution", [
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
                    for c in claims_results
                ]
            },
            "media_analysis": {
                "deepfake_probability_avg": media_data.get("deepfake_probability_avg", 0),
                "assets": media_data.get("assets", [])
            },
            "cross_references": cross_refs,
            "search_logs": search_logger.get_logs(),
            "search_summary": search_logger.summary()
        }
        
        # Store in Neo4j
        if store_in_neo4j and neo4j_client:
            await handler.send_log("info", "Storing analysis in Neo4j...")
            try:
                await asyncio.to_thread(neo4j_client.store_full_analysis, report)
                await handler.send_log("info", "Stored in Neo4j successfully")
            except Exception as e:
                await handler.send_log("warning", f"Neo4j storage error: {str(e)}")
        
        # Generate detailed report
        await handler.send_log("info", "Generating detailed report...")
        report_generator = ReportGeneratorAgent()
        detailed_report = await asyncio.to_thread(report_generator.generate, report)
        
        # Send final result with report
        await handler.send_result({
            "analysis": report,
            "report": detailed_report
        })
        
        # Cleanup
        if neo4j_client:
            neo4j_client.close()
            
    except Exception as e:
        await handler.send_error(str(e))
        raise


@app.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket):
    """
    WebSocket endpoint for real-time analysis with streaming logs.
    
    Send a JSON message with:
    {
        "input": "text content OR URL to analyze",
        "store_in_neo4j": true
    }
    
    Receives streaming logs with types:
    - info: General information
    - step: Progress step updates
    - search: Search operations with sources
    - claim: Claim verification results
    - claim_start: Claim verification started
    - source: Source analysis result
    - bias: Political bias result
    - media: Media analysis result
    - verdict: Final verdict
    - result: Complete analysis result (final message)
    - error: Error message
    """
    await websocket.accept()
    
    try:
        while True:
            # Wait for analysis request
            data = await websocket.receive_json()
            
            user_input = data.get("input", "")
            store_in_neo4j = data.get("store_in_neo4j", True)
            
            if not user_input.strip():
                await websocket.send_json({
                    "type": "error",
                    "message": "Input cannot be empty"
                })
                continue
            
            # Run analysis with streaming
            await run_analysis_with_streaming(
                websocket=websocket,
                user_input=user_input,
                store_in_neo4j=store_in_neo4j
            )
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
