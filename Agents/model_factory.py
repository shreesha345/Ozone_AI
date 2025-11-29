"""
Model Factory
Creates the appropriate LLM model based on configuration.
"""
from config import Config


def create_model(temperature: float = None):
    """
    Create an LLM model based on the MODEL environment variable.
    
    Supports:
    - OpenAI (gpt-4o, gpt-4-turbo, gpt-3.5-turbo, o1, o3, etc.)
    - Anthropic (claude-3-5-sonnet, claude-3-opus, etc.)
    - Google (gemini-pro, gemini-1.5-pro, etc.)
    - Ollama (gemma3:latest, llama3, mistral, etc.)
    
    Auto-detects and falls back to Ollama if no API keys are available.
    
    Args:
        temperature: Override default temperature (optional)
        
    Returns:
        Configured LLM model instance
    """
    provider = Config.get_model_provider()
    model_name = Config.get_model()
    temp = temperature if temperature is not None else Config.MODEL_TEMPERATURE
    
    if provider == "openai":
        from langchain_openai import ChatOpenAI
        
        if not Config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required but not set in environment")
        
        return ChatOpenAI(
            model=model_name,
            temperature=temp,
            api_key=Config.OPENAI_API_KEY
        )
    
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        
        if not Config.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required but not set in environment")
        
        return ChatAnthropic(
            model=model_name,
            temperature=temp,
            api_key=Config.ANTHROPIC_API_KEY
        )
    
    elif provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        if not Config.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is required but not set in environment")
        
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temp,
            google_api_key=Config.GOOGLE_API_KEY
        )
    
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        
        return ChatOllama(
            model=model_name,
            temperature=temp,
            base_url=Config.OLLAMA_BASE_URL
        )
    
    else:
        raise ValueError(f"Unsupported model provider: {provider}")


def get_model_info() -> dict:
    """Get information about the configured model"""
    return {
        "model": Config.get_model(),
        "provider": Config.get_model_provider(),
        "temperature": Config.MODEL_TEMPERATURE
    }
