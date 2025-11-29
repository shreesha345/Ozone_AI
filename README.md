# 🛡️ OzoneAI - Misinformation Detection System

**AI-powered comprehensive misinformation detection and analysis system with real-time fact-checking, source credibility analysis, political bias detection, and deepfake identification.**

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1.1+-orange.svg)](https://langchain.com/)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.28+-blue.svg)](https://neo4j.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Browser Extension](#-browser-extension)
- [Agent System](#-agent-system)
- [Graph Database](#-graph-database)
- [Development](#-development)
- [Performance Tuning](#-performance-tuning)
- [License](#-license)

---

## 🎯 Overview

OzoneAI is a comprehensive misinformation detection system that combines multiple AI agents to analyze content for accuracy, credibility, bias, and manipulation. The system uses advanced LLMs (Claude, GPT-4, Gemini, or local Ollama models) with web search capabilities to provide evidence-based fact-checking.

### What It Does

- **Extracts factual claims** from text, articles, or URLs
- **Fact-checks each claim** using real-time web search and evidence gathering
- **Analyzes source credibility** and publisher reputation
- **Detects political bias** and ideological leaning
- **Identifies media manipulation** and potential deepfakes
- **Generates comprehensive reports** with actionable insights
- **Stores analysis in Neo4j** knowledge graph for pattern tracking
- **Provides real-time streaming** via WebSocket API

---

## ✨ Key Features

### 🔍 Multi-Agent Analysis Pipeline

1. **Statement Extraction** - Identifies key factual claims in content
2. **Parallel Fact-Checking** - Verifies claims concurrently using web search
3. **Source Reputation Analysis** - Evaluates publisher credibility and history
4. **Political Bias Detection** - Identifies ideological leaning and bias indicators
5. **Media Analysis** - Detects deepfakes and manipulated media
6. **Verdict Synthesis** - Combines all factors into final credibility score

### 🚀 Performance Features

- **Parallel Processing** - Fact-checks multiple claims simultaneously
- **Rate Limit Protection** - Automatic retry with exponential backoff
- **Configurable Limits** - Control API usage and costs
- **Real-time Streaming** - WebSocket support for live progress updates
- **Search Logging** - Track all web searches with source attribution

### 🌐 Multiple Interfaces

- **CLI** - Interactive command-line interface
- **REST API** - FastAPI server with comprehensive endpoints
- **WebSocket API** - Real-time streaming analysis
- **Browser Extension** - Chrome extension with drag-and-drop interface

### 🧠 Model Flexibility

- **Auto-detection** - Automatically selects available model
- **Multi-provider** - OpenAI, Anthropic, Google, or Ollama
- **Local models** - Run completely offline with Ollama
- **Cost control** - Configurable claim limits to manage API costs

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input (Text/URL)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Misinformation Detector (Orchestrator)          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Statement Extractor Agent                         │  │
│  │     → Extracts factual claims from text               │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Fact Checker Agent (Parallel)                     │  │
│  │     → Verifies each claim with web search             │  │
│  │     → Uses Perplexity AI for evidence gathering       │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Source Analyzer Agent                             │  │
│  │     → Evaluates publisher credibility                 │  │
│  │     → Checks trust history and ownership              │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4. Political Bias Agent                              │  │
│  │     → Detects ideological leaning                     │  │
│  │     → Analyzes bias indicators                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  5. Media Analyzer Agent                              │  │
│  │     → Detects deepfakes and manipulation              │  │
│  │     → Reverse image search                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  6. Verdict Synthesizer Agent                         │  │
│  │     → Combines all analysis factors                   │  │
│  │     → Generates final credibility score               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Neo4j Knowledge Graph                     │
│  • Claims  • Sources  • Fact-checks  • Entities              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Comprehensive Report                        │
│  • Verdict  • Claims Analysis  • Risk Factors                │
│  • Source Evaluation  • Recommendations                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- **Python 3.12+**
- **uv** (recommended) or pip
- **Neo4j** (optional, for graph storage)
- **Ollama** (optional, for local models)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd misinformation-system

# Install dependencies with uv (recommended)
uv sync

# Or with pip
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# At minimum, you need:
# - One LLM API key (Anthropic, OpenAI, Google, or use Ollama)
# - PERPLEXITY_API_KEY for web search
```

### Dependencies

Core dependencies:
- `langchain` - LLM orchestration framework
- `langchain-anthropic` - Claude models
- `langchain-openai` - GPT models
- `langchain-google-genai` - Gemini models
- `langchain-ollama` - Local models
- `langgraph` - Agent workflow management
- `fastapi` - REST API server
- `uvicorn` - ASGI server
- `neo4j` - Graph database client
- `beautifulsoup4` - HTML parsing
- `requests` - HTTP client

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# =============================================================================
# MODEL CONFIGURATION
# =============================================================================
# Leave blank for auto-detection, or specify:
MODEL=claude-sonnet-4-5-20250929
# MODEL=gpt-4o
# MODEL=gemini-1.5-pro
# MODEL=gemma3:latest

MODEL_TEMPERATURE=0

# =============================================================================
# PERFORMANCE CONFIGURATION
# =============================================================================
# Max claims to check in parallel (1-10, default: 3)
MAX_PARALLEL_CLAIMS=3

# Max total claims to extract and verify (3-10, default: 5)
MAX_CLAIMS_TO_CHECK=5

# =============================================================================
# API KEYS
# =============================================================================
# Anthropic (for Claude models)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (for GPT models)
OPENAI_API_KEY=sk-...

# Google (for Gemini models)
GOOGLE_API_KEY=AIza...

# Perplexity (REQUIRED for fact-checking)
PERPLEXITY_API_KEY=pplx-...

# =============================================================================
# NEO4J (Optional - for graph storage)
# =============================================================================
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j

# =============================================================================
# OLLAMA (Optional - for local models)
# =============================================================================
OLLAMA_BASE_URL=http://localhost:11434
```

### Model Selection

The system automatically detects which model to use based on available API keys:

1. **Anthropic Claude** (if `ANTHROPIC_API_KEY` is set)
2. **OpenAI GPT** (if `OPENAI_API_KEY` is set)
3. **Google Gemini** (if `GOOGLE_API_KEY` is set)
4. **Ollama** (fallback, no API key needed)

You can override auto-detection by setting the `MODEL` environment variable.

### Performance Tuning

- **`MAX_PARALLEL_CLAIMS`**: Controls concurrent fact-checking
  - Lower (1-2): Avoid rate limits, lower cost
  - Medium (3-5): Balanced performance
  - Higher (6-10): Faster but may hit rate limits

- **`MAX_CLAIMS_TO_CHECK`**: Limits total claims analyzed
  - Lower (3-5): Faster, cheaper, good for quick checks
  - Higher (7-10): More thorough analysis

---

## 🚀 Usage

### 1. Command-Line Interface (CLI)

Interactive mode for analyzing text or URLs:

```bash
python main.py
```

**Features:**
- Paste text or URL to analyze
- Press Enter twice to start analysis
- View real-time progress
- Save JSON reports
- View detailed claim breakdowns

**Example:**

```
Enter text/URL to analyze:
----------------------------------------
https://example.com/article-to-check

[Analysis runs with real-time progress...]

✅ Final Verdict: MISLEADING
   Overall Score: 45/100
   Confidence: 85%

Save full JSON report? (y/n): y
  → Saved to misinfo-scan-20241129-a3f2e1.json

Show detailed claims? (y/n): y
```

### 2. REST API Server

Start the FastAPI server:

```bash
python server.py
# Or with uvicorn
uvicorn server:app --host 0.0.0.0 --port 8000
```

Access the API:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 3. Browser Extension

See [Browser Extension](#-browser-extension) section below.

---

## 📡 API Reference

### REST Endpoints

#### `POST /analyze`

Analyze text or URL for misinformation.

**Request:**
```json
{
  "input": "Text content or URL to analyze",
  "store_in_neo4j": true
}
```

**Response:**
```json
{
  "meta": {
    "scan_id": "misinfo-scan-20241129-a3f2e1",
    "timestamp": "2024-11-29T10:30:00Z",
    "url_scanned": "https://example.com",
    "agent_version": "v3.1.0",
    "scan_duration_ms": 12500
  },
  "final_verdict": {
    "status": "MISLEADING",
    "label": "Content Contains Misleading Information",
    "overall_score": 45,
    "confidence_score": 0.85,
    "summary_statement": "Analysis found 2 debunked claims...",
    "contributing_factors": [...]
  },
  "content_analysis": {
    "credibility_score": {...},
    "source_reputation": {...},
    "political_bias": {...},
    "claims_list": [...]
  },
  "media_analysis": {...},
  "cross_references": [...],
  "search_logs": [...],
  "search_summary": {...}
}
```

#### `POST /analyze/report`

Analyze with detailed human-readable report generation.

**Request:** Same as `/analyze`

**Response:**
```json
{
  "analysis": {...},  // Same as /analyze response
  "report": {
    "executive_summary": "...",
    "verdict_details": {...},
    "claims_analysis": {...},
    "source_evaluation": {...},
    "bias_analysis": {...},
    "media_analysis": {...},
    "risk_factors": [...],
    "recommendations": [...],
    "methodology": "..."
  }
}
```

### WebSocket Endpoint

#### `WS /ws/analyze`

Real-time streaming analysis with progress updates.

**Connect:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/analyze');
```

**Send:**
```json
{
  "input": "Text or URL to analyze",
  "store_in_neo4j": true
}
```

**Receive (streaming):**
```json
// Progress updates
{"type": "step", "message": "[1/6] Extracting statements", "data": {...}}
{"type": "claim", "message": "CLAIM_A1: VERIFIED", "data": {...}}
{"type": "search", "message": "Search: ...", "data": {...}}

// Final result
{"type": "result", "message": "Analysis complete", "data": {"result": {...}}}
```

**Message Types:**
- `info` - General information
- `step` - Progress step updates (1/6, 2/6, etc.)
- `claim_start` - Claim verification started
- `claim` - Claim verification result
- `search` - Web search performed
- `source` - Source analysis result
- `bias` - Political bias result
- `media` - Media analysis result
- `verdict` - Final verdict
- `result` - Complete analysis (final message)
- `error` - Error occurred

---

## 🌐 Browser Extension

### OzoneAI Chrome Extension

A drag-and-drop interface for analyzing web content in real-time.

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The OzoneAI icon appears in your toolbar

### Features

- **Universal Drag & Drop** - Drag ANY content to analyze:
  - ✍️ Text selections
  - 🔗 Links and URLs
  - 🖼️ Images
  - 📱 Social media posts (Twitter, LinkedIn, Facebook, Instagram)
  - 📰 Blog articles (Medium, Substack)
  - 💬 Comments and reviews
  - 📄 Content blocks

- **AI Chatbot Interface** - Perplexity-style conversation UI
- **Chat History** - Persistent conversations stored locally
- **Smart Content Detection** - Auto-recognizes content types
- **Visual Feedback** - Animated drop zones and status indicators
- **Real-time Analysis** - Instant AI responses

### Usage

1. Visit any website
2. Drag content you want to analyze
3. A floating chatbot appears on the right
4. Drop the content into the chatbot
5. AI assistant analyzes and starts conversation
6. Continue chatting or drop more content

### Configuration

Edit `extension/manifest.json` to customize:
- Permissions
- Content script injection
- Background service worker

---

## 🤖 Agent System

### Agent Architecture

The system uses specialized AI agents coordinated by the main orchestrator:

#### 1. Statement Extractor Agent
**Purpose:** Extract factual claims from text

**Capabilities:**
- Identifies verifiable statements
- Filters out opinions and subjective content
- Limits extraction to avoid excessive API calls

**Configuration:**
- `MAX_CLAIMS_TO_CHECK` - Limits total claims extracted

#### 2. Fact Checker Agent
**Purpose:** Verify individual claims using web search

**Capabilities:**
- Searches for evidence using Perplexity AI
- Evaluates claim accuracy
- Provides confidence scores
- Cites verification sources

**Statuses:**
- `VERIFIED` - Claim is accurate
- `DEBUNKED` - Claim is false
- `MISLEADING` - Partially true but misleading
- `MISSING_CONTEXT` - Needs additional context
- `UNVERIFIABLE` - Cannot be verified

**Configuration:**
- `MAX_PARALLEL_CLAIMS` - Controls concurrent checks

#### 3. Source Analyzer Agent
**Purpose:** Evaluate publisher credibility

**Capabilities:**
- Analyzes domain reputation
- Checks trust history
- Identifies ownership structure
- Detects known bias

**Output:**
- Credibility score (0-100)
- Trust history flags
- Ownership information
- Bias indicators

#### 4. Political Bias Agent
**Purpose:** Detect ideological leaning

**Capabilities:**
- Analyzes language patterns
- Identifies bias indicators
- Provides confidence scores
- Generates distribution chart

**Ratings:**
- Far-Left
- Left
- Center
- Right
- Far-Right

#### 5. Media Analyzer Agent
**Purpose:** Detect manipulated media and deepfakes

**Capabilities:**
- Extracts media URLs
- Performs reverse image search
- Analyzes for manipulation indicators
- Calculates deepfake probability

**Output:**
- Media asset list
- Deepfake probability per asset
- Average deepfake probability
- Manipulation indicators

#### 6. Verdict Synthesizer Agent
**Purpose:** Combine all factors into final verdict

**Capabilities:**
- Weighs all analysis factors
- Calculates overall credibility score
- Identifies risk factors
- Generates summary statement

**Verdicts:**
- `ACCURATE` - Content is reliable
- `INACCURATE` - Content contains misinformation
- `MISLEADING` - Content is partially misleading
- `UNVERIFIABLE` - Cannot determine accuracy

### Agent Communication

Agents communicate through the orchestrator using:
- **Shared model instance** - Efficient LLM usage
- **Tool integration** - Web search, database access
- **Rate limit protection** - Automatic retry logic
- **Logging** - Comprehensive search and operation logs

---

## 🗄️ Graph Database

### Neo4j Integration

The system stores analysis results in a Neo4j knowledge graph for:
- Pattern tracking across sources
- Entity relationship mapping
- Historical analysis
- Misinformation network detection

### Graph Schema

**Nodes:**
- `Claim` - Individual factual claims
  - Properties: `claim_text`, `credibility_score`, `status`, `org_id`
- `Source` - Information sources
  - Properties: `source_name`, `source_url`, `reliability_score`
- `FactCheck` - Verification results
  - Properties: `verdict`, `fact_checker`, `evidence`, `confidence`
- `Entity` - People, organizations, locations, events, topics
  - Properties: `name`, `type`, `context`, `relevance`

**Relationships:**
- `(Claim)-[:PUBLISHED_BY]->(Source)`
- `(FactCheck)-[:VERIFIES]->(Claim)`
- `(Claim)-[:MENTIONS]->(Entity)`
- `(Source)-[:HAS_BIAS]->(BiasProfile)`

### Querying the Graph

```python
from Agents.neo4j_tools import Neo4jClient

client = Neo4jClient()

# Get all debunked claims from a source
claims = client.get_claims_by_verdict("DEBUNKED", source_url="example.com")

# Get source reliability stats
stats = client.get_source_reliability_stats("example.com")

# Get entity misinformation profile
profile = client.get_entity_misinformation_profile("Person Name")
```

### Storage Control

Control Neo4j storage via:
- **CLI**: Enabled by default in `main.py`
- **API**: Set `store_in_neo4j: false` in request body
- **Code**: `MisinformationDetector(store_in_neo4j=False)`

---

## 🛠️ Development

### Project Structure

```
misinformation-system/
├── Agents/                      # AI agent modules
│   ├── misinfoAgent.py         # Main orchestrator
│   ├── statementExtractorAgent.py
│   ├── factCheckerAgent.py
│   ├── sourceAnalyzerAgent.py
│   ├── politicalBiasAgent.py
│   ├── mediaAnalyzerAgent.py
│   ├── verdictSynthesizerAgent.py
│   ├── reportGeneratorAgent.py
│   ├── model_factory.py        # LLM model management
│   ├── neo4j_tools.py          # Graph database tools
│   ├── search_utils.py         # Web search utilities
│   ├── rate_limit_utils.py     # Rate limit handling
│   └── prompts.py              # Agent system prompts
├── extension/                   # Chrome extension
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   └── popup.js
├── main.py                      # CLI interface
├── server.py                    # FastAPI server
├── config.py                    # Configuration management
├── pyproject.toml              # Dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

### Adding New Agents

1. Create agent file in `Agents/` directory
2. Inherit from base agent pattern
3. Define system prompt in `Agents/prompts.py`
4. Integrate with orchestrator in `misinfoAgent.py`
5. Add tools if needed (search, database, etc.)

### Testing

```bash
# Test CLI
python main.py

# Test API
python server.py
# Visit http://localhost:8000/docs

# Test specific agent
python test.py
```

### Logging

The system provides comprehensive logging:

**Search Logs:**
```python
from Agents.search_utils import search_logger, print_search_summary

# View all searches
logs = search_logger.get_logs()

# Print summary
print_search_summary()
```

**Analysis Logs:**
- Real-time progress in CLI
- Streaming logs via WebSocket
- Structured logs in JSON output

---

## ⚡ Performance Tuning

### Optimizing for Speed

```bash
# Increase parallel processing
MAX_PARALLEL_CLAIMS=10
MAX_CLAIMS_TO_CHECK=10
```

**Pros:** Faster analysis
**Cons:** Higher API costs, may hit rate limits

### Optimizing for Cost

```bash
# Reduce API calls
MAX_PARALLEL_CLAIMS=1
MAX_CLAIMS_TO_CHECK=3

# Use local model
MODEL=gemma3:latest
```

**Pros:** Lower costs, no rate limits
**Cons:** Slower analysis, may need local GPU

### Optimizing for Accuracy

```bash
# More thorough analysis
MAX_CLAIMS_TO_CHECK=10
MODEL_TEMPERATURE=0

# Use best model
MODEL=claude-sonnet-4-5-20250929
```

**Pros:** Most accurate results
**Cons:** Higher costs, slower

### Rate Limit Handling

The system automatically handles rate limits:
- **Exponential backoff** - Retries with increasing delays
- **Configurable retries** - Default: 3 attempts
- **Graceful degradation** - Returns partial results on failure

### Caching

Consider implementing caching for:
- Repeated source analyses
- Common claim patterns
- Media verification results

---

## 📊 Output Schema

### Analysis Result

```json
{
  "meta": {
    "scan_id": "string",
    "timestamp": "ISO8601",
    "url_scanned": "string",
    "agent_version": "string",
    "scan_duration_ms": "number"
  },
  "final_verdict": {
    "status": "ACCURATE|INACCURATE|MISLEADING|UNVERIFIABLE",
    "label": "string",
    "overall_score": "0-100",
    "confidence_score": "0-1",
    "summary_statement": "string",
    "contributing_factors": [
      {
        "severity": "HIGH|MEDIUM|LOW",
        "module": "string",
        "message": "string",
        "details_link": "string"
      }
    ]
  },
  "content_analysis": {
    "credibility_score": {
      "value": "0-100",
      "rating_text": "High|Medium|Low",
      "color_code": "#hex"
    },
    "source_reputation": {
      "publisher_name": "string",
      "domain_rating_score": "0-100",
      "trust_history_flags": "number",
      "ownership_structure": "string",
      "bias_source": "object"
    },
    "political_bias": {
      "rating": "Far-Left|Left|Center|Right|Far-Right",
      "confidence": "0-1",
      "score_distribution": [
        {"label": "string", "value": "number"}
      ]
    },
    "claims_list": [
      {
        "id": "string",
        "text": "string",
        "status": "VERIFIED|DEBUNKED|MISLEADING|MISSING_CONTEXT|UNVERIFIABLE",
        "confidence": "0-1",
        "verification_source": {
          "name": "string",
          "url": "string"
        },
        "note": "string",
        "supported_by_media_id": "string"
      }
    ]
  },
  "media_analysis": {
    "deepfake_probability_avg": "0-1",
    "assets": [
      {
        "id": "string",
        "type": "image|video|audio",
        "url": "string",
        "is_deepfake": "boolean",
        "deepfake_probability": "0-1",
        "manipulation_indicators": ["string"]
      }
    ]
  },
  "cross_references": [
    {
      "type": "EVIDENCE_SUPPORT|EVIDENCE_FABRICATION",
      "primary_element_id": "string",
      "secondary_element_id": "string",
      "description": "string"
    }
  ],
  "search_logs": [...],
  "search_summary": {...}
}
```

---

## 🔒 Security & Privacy

- **No data retention** - Analysis results not stored unless Neo4j enabled
- **API key security** - Keys stored in `.env` (never committed)
- **Rate limiting** - Prevents abuse and excessive costs
- **Input validation** - Sanitizes all user inputs
- **CORS protection** - Configurable origin restrictions

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional fact-checking sources
- Enhanced deepfake detection
- Multi-language support
- Improved bias detection
- Performance optimizations
- Additional agent types

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **LangChain** - Agent orchestration framework
- **Perplexity AI** - Web search and evidence gathering
- **Neo4j** - Graph database for knowledge storage
- **Anthropic, OpenAI, Google** - LLM providers
- **Ollama** - Local model support

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the API documentation at `/docs`
- Review the `.env.example` for configuration help

---

## 🚀 Quick Start Examples

### Example 1: Analyze a News Article

```bash
python main.py
```
```
Enter text/URL to analyze:
https://example.com/news-article

[Analysis runs...]
✅ Final Verdict: ACCURATE
   Overall Score: 85/100
```

### Example 2: API Request

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "input": "The Earth is flat and NASA is hiding the truth.",
    "store_in_neo4j": true
  }'
```

### Example 3: WebSocket Streaming

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/analyze');

ws.onopen = () => {
  ws.send(JSON.stringify({
    input: "Article text or URL here",
    store_in_neo4j: true
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`[${data.type}] ${data.message}`);
  
  if (data.type === 'result') {
    console.log('Analysis complete:', data.data.result);
  }
};
```

### Example 4: Python API

```python
from Agents.misinfoAgent import MisinformationDetector

detector = MisinformationDetector(store_in_neo4j=True)

result = detector.analyze(
    text="Your article text here",
    url="https://example.com"
)

print(f"Verdict: {result['final_verdict']['status']}")
print(f"Score: {result['final_verdict']['overall_score']}/100")

detector.close()
```

---

**Built with ❤️ for truth and transparency**
