"""
Configuration handler for Misinformation Detection Agent

This module manages all configuration settings including API keys, model selection,
Neo4j connection details, and performance parameters with auto-detection and validation.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration class for the application"""
    
    # Neo4j Configuration
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USERNAME", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
    NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
    
    # Model Configuration
    MODEL = os.getenv("MODEL", None)  # Will be auto-detected if not set
    MODEL_TEMPERATURE = float(os.getenv("MODEL_TEMPERATURE", "0"))
    
    @classmethod
    def _auto_detect_model(cls):
        """Auto-detect available model based on API keys"""
        if cls.MODEL:
            return cls.MODEL
            
        # Check which API keys are available and select accordingly
        if cls.ANTHROPIC_API_KEY:
            return "claude-sonnet-4-5-20250929"
        elif cls.OPENAI_API_KEY:
            return "gpt-4o"
        elif cls.GOOGLE_API_KEY:
            return "gemini-1.5-pro"
        else:
            # Fall back to Ollama (free, local)
            return "gemma3:latest"
    
    @classmethod
    def get_model(cls):
        """Get the model to use (with auto-detection)"""
        if cls.MODEL is None:
            cls.MODEL = cls._auto_detect_model()
        return cls.MODEL
    
    # Performance Configuration
    MAX_PARALLEL_CLAIMS = int(os.getenv("MAX_PARALLEL_CLAIMS", "3"))  # Max concurrent claim checks (reduced to avoid rate limits)
    MAX_CLAIMS_TO_CHECK = int(os.getenv("MAX_CLAIMS_TO_CHECK", "5"))  # Max total claims to extract and verify
    
    # API Keys
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")  # For Gemini
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
    
    # Ollama Configuration
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    @classmethod
    def get_model_provider(cls) -> str:
        """Detect model provider from model name"""
        model = cls.get_model().lower()
        
        if "gpt" in model or "o1" in model or "o3" in model:
            return "openai"
        elif "claude" in model or "anthropic" in model:
            return "anthropic"
        elif "gemini" in model or "google" in model:
            return "google"
        elif "gemma" in model or "llama" in model or "mistral" in model or "ollama" in model:
            return "ollama"
        else:
            # Default to anthropic if unclear
            return "anthropic"
    
    @classmethod
    def validate(cls):
        """Validate that all required configuration is present"""
        errors = []
        warnings = []
        
        # Auto-detect model if not set
        model = cls.get_model()
        provider = cls.get_model_provider()
        
        # Check if the selected model's API key is available
        if provider == "openai" and not cls.OPENAI_API_KEY:
            errors.append(f"OPENAI_API_KEY is required for model '{model}'")
        elif provider == "anthropic" and not cls.ANTHROPIC_API_KEY:
            errors.append(f"ANTHROPIC_API_KEY is required for model '{model}'")
        elif provider == "google" and not cls.GOOGLE_API_KEY:
            errors.append(f"GOOGLE_API_KEY is required for model '{model}'")
        elif provider == "ollama":
            # Ollama doesn't require API key, just check if base URL is set
            if not cls.OLLAMA_BASE_URL:
                warnings.append(f"OLLAMA_BASE_URL not set, using default: http://localhost:11434")
            warnings.append(f"Using Ollama model '{model}' - ensure Ollama is running and model is pulled")
        
        if not cls.PERPLEXITY_API_KEY:
            warnings.append("PERPLEXITY_API_KEY is not set - search functionality may be limited")
        
        if not cls.NEO4J_PASSWORD or cls.NEO4J_PASSWORD == "password":
            warnings.append("NEO4J_PASSWORD should be configured for graph storage")
        
        if errors:
            raise ValueError(
                "Configuration errors:\n" + "\n".join(f"- {e}" for e in errors)
            )
        
        if warnings:
            print("✅ Configuration validated successfully")
            print("⚠️  Configuration warnings:")
            for w in warnings:
                print(f"  - {w}")
        else:
            print("✅ Configuration validated successfully")
        
        return True


# Validate configuration on import
try:
    Config.validate()
except ValueError as e:
    print(f"Warning: {e}")
    print("\nPlease create a .env file with the required configuration.")
    print("See .env.example for the template.")