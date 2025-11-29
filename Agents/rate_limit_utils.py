"""
Rate Limit Utilities for Claude API
Handles rate limiting with automatic retry and delay.

This module provides decorators and utilities for handling API rate limits with exponential
backoff and automatic retry logic to ensure robust API interactions.
"""
import time
import functools
from anthropic import RateLimitError


def with_rate_limit_retry(func):
    """
    Decorator that handles rate limit errors with 1-2 second delay and retry.
    
    Usage:
        @with_rate_limit_retry
        def my_api_call():
            ...
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        max_retries = 3
        retry_delay = 1.5  # 1.5 seconds (between 1-2 seconds)
        
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except RateLimitError as e:
                if attempt < max_retries - 1:
                    print(f"  ⏳ Rate limit hit, waiting {retry_delay}s before retry ({attempt + 1}/{max_retries})...")
                    time.sleep(retry_delay)
                else:
                    raise e
        
        return func(*args, **kwargs)
    
    return wrapper


def invoke_with_rate_limit_retry(agent, input_data: dict, max_retries: int = 3) -> dict:
    """
    Invoke an agent with rate limit retry handling.
    
    Args:
        agent: The LangChain agent to invoke
        input_data: The input dictionary for the agent
        max_retries: Maximum number of retries (default: 3)
        
    Returns:
        The agent response
    """
    retry_delay = 1.5  # 1.5 seconds (between 1-2 seconds)
    
    for attempt in range(max_retries):
        try:
            return agent.invoke(input_data)
        except RateLimitError as e:
            if attempt < max_retries - 1:
                print(f"  ⏳ Rate limit hit, waiting {retry_delay}s before retry ({attempt + 1}/{max_retries})...")
                time.sleep(retry_delay)
            else:
                raise e
    
    return agent.invoke(input_data)
