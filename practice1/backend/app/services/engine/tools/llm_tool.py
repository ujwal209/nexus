import os
import time
import httpx
import logging
import itertools
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("nexus.llm_tool")


class LLMOutput(BaseModel):
    status: str
    provider: str
    model: str
    system_prompt: str
    latency_ms: float
    tps: float
    summary: str
    query_target: Optional[str] = None
    execution_audit: Dict[str, Any]


def _build_groq_key_cycle() -> itertools.cycle:
    """Load all Groq keys from env and return an infinite round-robin cycle."""
    raw = os.getenv("GROQ_API_KEYS", getattr(settings, "GROQ_API_KEYS", ""))
    keys = [k.strip().strip('"').strip("'") for k in raw.split(",") if k.strip()]
    if not keys:
        raise RuntimeError(
            "No GROQ_API_KEYS found in environment! "
            "Set GROQ_API_KEYS=gsk_key1,gsk_key2,... in your .env file."
        )
    logger.info(f"[LLM] Loaded {len(keys)} Groq API key(s) into round-robin pool.")
    return itertools.cycle(keys)


class LLMExecutionTool:
    """Production LLM Execution Tool — Real Groq API Only, Round-Robin Keys, No Fallbacks."""
    _key_cycle: Optional[itertools.cycle] = None

    @classmethod
    def _next_key(cls) -> str:
        if cls._key_cycle is None:
            cls._key_cycle = _build_groq_key_cycle()
        return next(cls._key_cycle)

    @classmethod
    async def execute(
        cls,
        node_title: str,
        config: Dict[str, Any],
        upstream_context: Dict[str, Any],
    ) -> LLMOutput:
        start_time = time.time()
        provider = config.get("provider", "groq")
        model = config.get("model", "llama-3.3-70b-versatile")
        system_prompt = config.get(
            "systemPrompt",
            "You are an autonomous AI research synthesizer. Process the raw context from upstream tools, extract the key verified insights, and format structured executive bullet points with high precision.",
        )

        # ── Round-robin API key ──────────────────────────────────────────────
        node_key = (config.get("apiKey") or "").strip()
        api_key = node_key if (node_key and "demo" not in node_key.lower()) else cls._next_key()
        masked_key = f"gsk_{api_key[4:8]}...{api_key[-4:]}"

        # ── Build upstream context string (all directly connected nodes) ─────
        raw_search_text = ""
        query_target = config.get("query") or "General AI Task"
        extracted_parts = []

        logs = [
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] INIT: Provider='{provider}' model='{model}'",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] AUTH: Using key {masked_key} (round-robin pool)",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] SYSTEM_PROMPT: '{system_prompt[:80]}...'",
        ]

        if upstream_context:
            logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] UPSTREAM: {len(upstream_context)} connected node(s) detected")
            for nid, output in upstream_context.items():
                # Deserialize Pydantic models if needed
                if hasattr(output, "model_dump"):
                    output = output.model_dump()
                elif hasattr(output, "dict"):
                    output = output.dict()

                if isinstance(output, dict):
                    # Prefer answer > results > full json
                    if output.get("answer"):
                        part = str(output["answer"])
                    elif output.get("results"):
                        part = "\n".join(
                            f"- {r['title']} ({r['url']})"
                            for r in (output["results"] if isinstance(output["results"], list) else [])
                            if isinstance(r, dict)
                        )
                    elif output.get("summary"):
                        part = str(output["summary"])
                    else:
                        part = str(output)

                    if output.get("query"):
                        query_target = output["query"]

                    logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] CONTEXT[{nid}]: Extracted {len(part)} chars")
                    extracted_parts.append(part)
                else:
                    extracted_parts.append(str(output))

            raw_search_text = "\n\n".join(extracted_parts)

        user_message = (
            f"Search Query: {query_target}\n\n"
            f"Web Search Results:\n{raw_search_text}\n\n"
            "Based on the above search results, provide a comprehensive, well-structured analysis."
        )

        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] CONTEXT_BUILT: {len(raw_search_text)} chars of upstream context injected")
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] DISPATCH: HTTP POST -> https://api.groq.com/openai/v1/chat/completions")

        print(f"\033[93m[LLM]\033[0m 🧠 Calling Groq '{model}' | Key: {masked_key} | Context: {len(raw_search_text)} chars")

        url = "https://api.groq.com/openai/v1/chat/completions"

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": float(config.get("temperature", 0.3)),
                    "max_tokens": int(config.get("maxTokens", 1024)),
                },
            )

        latency = round((time.time() - start_time) * 1000, 2)
        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] RESPONSE: HTTP {resp.status_code} ({latency}ms)")

        if resp.status_code != 200:
            error_body = resp.text
            logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] ERROR: {error_body}")
            print(f"\033[91m[LLM]\033[0m ❌ Groq HTTP {resp.status_code}: {error_body}")
            raise RuntimeError(f"Groq API error {resp.status_code}: {error_body}")

        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        tps = data.get("usage", {}).get("completion_tokens", 0) / max(latency / 1000, 0.001)

        logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] SUCCESS: Generated {len(content)} chars | ~{tps:.0f} TPS")
        print(f"\033[92m[LLM]\033[0m ✅ Groq response: {len(content)} chars in {latency}ms")

        return LLMOutput(
            status="success",
            provider=f"Groq LPU ({model})",
            model=model,
            system_prompt=system_prompt,
            latency_ms=latency,
            tps=round(tps, 1),
            summary=content,
            query_target=query_target,
            execution_audit={
                "execution_mode": "REAL_GROQ_API",
                "http_method": "POST",
                "endpoint_url": url,
                "api_key_masked": masked_key,
                "response_status": 200,
                "latency_ms": latency,
                "tps": round(tps, 1),
                "logs": logs,
            },
        )
