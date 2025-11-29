# Misinformation Detection System

AI-powered system for detecting, tracking, and analyzing misinformation using Neo4j knowledge graphs and LangChain agents.

## Features

- **Claim Analysis**: Automatically analyze claims for misinformation
- **Fact-Checking**: Integration with Perplexity AI for evidence-based verification
- **Knowledge Graph**: Store claims, sources, and fact-checks in Neo4j
- **Entity Extraction**: Identify key people, organizations, and topics
- **Source Tracking**: Monitor source reliability over time
- **Batch Processing**: Analyze multiple claims efficiently

## Architecture

### Agents

1. **Neo4j Agent** (`Agents/Neo4j_agent.py`)
   - Main orchestrator for the detection pipeline
   - Coordinates between research, storage, and analysis
   - LangGraph workflow for complex reasoning

2. **Research Agent** (`Agents/research_agent.py`)
   - Uses Perplexity AI for fact-checking
   - Gathers evidence from credible sources
   - Assesses source reliability

3. **Entity Agent** (`Agents/entity_agent.py`)
   - Extracts entities (people, orgs, events, topics)
   - Builds entity-claim networks
   - Tracks misinformation patterns by entity

4. **Node Tools** (`Agents/node_tools.py`)
   - Specialized tools for Neo4j operations
   - Claim, source, and fact-check management
   - Organization-level data isolation

## Installation

```bash
# Install dependencies
uv sync

# Or with pip
pip install -r requirements.txt
```

## Configuration

Your `.env` file should contain:

```env
# Anthropic (Claude)
ANTHROPIC_API_KEY=your_key_here

# Perplexity AI
PERPLEXITY_API_KEY=your_key_here

# Neo4j
NEO4J_URI=neo4j+s://your_instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j

# LangSmith (optional)
LANGCHAIN_TRACING_V2=true
LANGSMITH_API_KEY=your_key_here
LANGCHAIN_PROJECT=misinformation-detector
```

## Usage

### Interactive Mode

```bash
python main.py
```

Select option 3 for interactive mode, then enter claims to analyze.

### Programmatic Usage

```python
from Agents.Neo4j_agent import full_misinformation_pipeline
import asyncio

async def analyze():
    result = await full_misinformation_pipeline(
        claim_text="Your claim here",
        source_url="https://example.com",
        org_id="your-org"
    )
    print(result)

asyncio.run(analyze())
```

### Single Claim Analysis

```python
from Agents.misinformation_agent import analyze_claim

result = analyze_claim(
    claim_text="Claim to verify",
    source_url="https://source.com",
    org_id="org-123"
)
```

### Batch Analysis

```python
from main import batch_analyze
import asyncio

claims = [
    {"claim_text": "Claim 1", "source_url": "https://source1.com"},
    {"claim_text": "Claim 2", "source_url": "https://source2.com"}
]

asyncio.run(batch_analyze(claims, org_id="org-123"))
```

## Graph Schema

### Nodes

- **Claim**: Individual claims being tracked
  - Properties: `claim_text`, `credibility_score`, `status`, `org_id`
  
- **Source**: Information sources
  - Properties: `source_name`, `source_url`, `source_type`, `reliability_score`
  
- **FactCheck**: Verification results
  - Properties: `verdict`, `fact_checker`, `evidence`, `confidence`
  
- **Entity Types**: PERSON, ORGANIZATION, LOCATION, EVENT, TOPIC
  - Properties: `name`, `context`, `relevance`

### Relationships

- `(Claim)-[:PUBLISHED_BY]->(Source)`
- `(FactCheck)-[:VERIFIES]->(Claim)`
- `(Claim)-[:MENTIONS]->(Entity)`

## Tools Reference

### Claim Management

- `add_claim_node`: Create new claim
- `add_fact_check_node`: Store fact-check results
- `get_claims_by_verdict`: Query claims by verdict

### Source Management

- `add_source_node`: Create/update source
- `link_claim_to_source`: Connect claim to source
- `get_source_reliability_stats`: Analyze source history

### Entity Analysis

- `extract_and_store_entities`: Extract entities from claim
- `get_entity_misinformation_profile`: Get entity's claim history

## Example Workflow

1. **Submit Claim**: User submits a claim for analysis
2. **Store in Graph**: Claim node created in Neo4j
3. **Research**: Perplexity AI searches for evidence
4. **Extract Entities**: Key entities identified and linked
5. **Fact-Check**: Verdict determined with confidence score
6. **Store Results**: Fact-check node created and linked
7. **Return Analysis**: Complete results returned to user

## License

MIT
