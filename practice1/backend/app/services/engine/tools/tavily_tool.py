import os
import time
import httpx
import logging
import itertools
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("nexus.tavily")


class TavilyResult(BaseModel):
    title: str
    url: str
    score: float = 0.0


class TavilyOutput(BaseModel):
    status: str
    query: str
    answer: str
    results_count: int
    results: List[TavilyResult]
    execution_audit: Dict[str, Any]


def _build_tavily_key_cycle() -> itertools.cycle:
    """Load all Tavily keys from env and return an infinite round-robin cycle."""
    raw = os.getenv("TAVILY_API_KEYS", getattr(settings, "TAVILY_API_KEYS", ""))
    keys = [k.strip().strip('"').strip("'") for k in raw.split(",") if k.strip()]
    if not keys:
        raise RuntimeError(
            "No TAVILY_API_KEYS found in environment! "
            "Set TAVILY_API_KEYS=tvly-key1,tvly-key2,... in your .env file."
        )
    logger.info(f"[TAVILY] Loaded {len(keys)} API key(s) into round-robin pool.")
    return itertools.cycle(keys)


class TavilySearchTool:
    """Production Tavily AI Web Search Tool — Real API Only, Round-Robin Keys."""
    _key_cycle: Optional[itertools.cycle] = None

    @classmethod
    def _next_key(cls) -> str:
        if cls._key_cycle is None:
            cls._key_cycle = _build_tavily_key_cycle()
        return next(cls._key_cycle)

    @classmethod
    async def execute(cls, config: Dict[str, Any], query: Optional[str] = None) -> TavilyOutput:
        start_time = time.time()
        search_query = query or (config.get("query") or "").strip()
        if not search_query:
            raise ValueError("Tavily search query is empty! Configure the 'query' field on the node.")

        # Always use round-robin env keys; node-level key overrides only if explicitly set
        node_key = (config.get("apiKey") or "").strip()
        api_key = node_key if (node_key and "demo" not in node_key.lower()) else cls._next_key()
        masked_key = f"{api_key[:8]}...{api_key[-4:]}"

        search_depth = config.get("searchDepth", "advanced")
        topic = config.get("topic", "general")
        max_results = min(10, max(1, int(config.get("maxResults", 5))))
        include_answer = bool(config.get("includeAnswer", True))
        
        inc_domains_raw = config.get("includeDomains") or ""
        include_domains = [d.strip() for d in inc_domains_raw.split(",") if d.strip()]
        exc_domains_raw = config.get("excludeDomains") or ""
        exclude_domains = [d.strip() for d in exc_domains_raw.split(",") if d.strip()]

        url = "https://api.tavily.com/search"
        payload: Dict[str, Any] = {
            "api_key": api_key,
            "query": search_query,
            "search_depth": search_depth,
            "topic": topic,
            "max_results": max_results,
            "include_answer": include_answer,
        }
        if include_domains:
            payload["include_domains"] = include_domains
        if exclude_domains:
            payload["exclude_domains"] = exclude_domains

        logs = [
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] INIT: Tavily search for '{search_query}'",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] AUTH: Using API key {masked_key} (round-robin pool)",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] CONFIG: depth={search_depth}, max_results={max_results}, topic={topic}",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] DISPATCH: HTTP POST -> {url}",
        ]

        print(f"\033[96m[TAVILY]\033[0m 🔍 Searching '{search_query}' | Key: {masked_key}")

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, json=payload)

        latency = round((time.time() - start_time) * 1000, 2)
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] RESPONSE: HTTP {response.status_code} ({latency}ms)")

        if response.status_code != 200:
            error_body = response.text
            logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] ERROR: {error_body}")
            print(f"\033[91m[TAVILY]\033[0m ❌ HTTP {response.status_code}: {error_body}")
            raise RuntimeError(f"Tavily API error {response.status_code}: {error_body}")

        data = response.json()
        results = [
            TavilyResult(
                title=item.get("title", ""),
                url=item.get("url", ""),
                score=item.get("score", 0.0),
            )
            for item in data.get("results", [])
        ]
        answer = data.get("answer") or " ".join(r.title for r in results[:3])
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] SUCCESS: Got {len(results)} results, answer length={len(answer)}")
        print(f"\033[92m[TAVILY]\033[0m ✅ {len(results)} results in {latency}ms")

        return TavilyOutput(
            status="success",
            query=search_query,
            answer=answer,
            results_count=len(results),
            results=results,
            execution_audit={
                "execution_mode": "REAL_TAVILY_API",
                "http_method": "POST",
                "endpoint_url": url,
                "api_key_masked": masked_key,
                "response_status": 200,
                "latency_ms": latency,
                "logs": logs,
            },
        )
