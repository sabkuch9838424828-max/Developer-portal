from typing import Optional
from app.core.config import settings
from app.ai.base_provider import BaseAIProvider
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.grok_provider import GrokProvider
from app.ai.providers.heuristic_provider import HeuristicProvider

class AIProviderFactory:
    """Factory to instantiate and retrieve the configured AI Provider."""

    @staticmethod
    def get_provider(
        provider_name: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> BaseAIProvider:
        provider = (provider_name or settings.AI_PROVIDER).lower()

        if provider == "gemini":
            key = api_key or settings.GEMINI_API_KEY
            mdl = model or settings.GEMINI_MODEL
            if key:
                return GeminiProvider(
                    api_key=key,
                    model=mdl,
                    timeout=settings.AI_TIMEOUT,
                    temperature=settings.AI_TEMPERATURE
                )
            return HeuristicProvider()

        elif provider == "grok":
            key = api_key or settings.GROK_API_KEY
            mdl = model or settings.GROK_MODEL
            if key:
                return GrokProvider(
                    api_key=key,
                    model=mdl,
                    timeout=settings.AI_TIMEOUT,
                    temperature=settings.AI_TEMPERATURE
                )
            return HeuristicProvider()

        # Default fallback
        return HeuristicProvider()
