import asyncio
import time
import logging
from typing import Dict, Any, List
from datetime import datetime

from app.services.engine.tools.tavily_tool import TavilySearchTool
from app.services.engine.tools.llm_tool import LLMExecutionTool
from app.services.engine.tools.http_tool import HTTPTool
from app.services.engine.tools.gmail_tool import GmailSenderTool

logger = logging.getLogger("nexus.dag_runner")


def _get_topological_waves(nodes: dict, edges: list) -> List[List[str]]:
    """Kahn's Algorithm — returns ordered execution waves."""
    in_degree = {nid: 0 for nid in nodes}
    graph = {nid: [] for nid in nodes}

    for edge in edges:
        f, t = edge.get("fromId"), edge.get("toId")
        if f in nodes and t in nodes:
            graph[f].append(t)
            in_degree[t] += 1

    waves = []
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    while queue:
        waves.append(list(queue))
        next_queue = []
        for nid in queue:
            for neighbor in graph[nid]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    next_queue.append(neighbor)
        queue = next_queue

    return waves


class DAGRunner:
    """Simple DAG Execution Engine — context-passing, wave-based."""

    def __init__(self, nodes: List[dict], edges: List[dict], api_credentials: dict = None):
        self.nodes = {n["id"]: n for n in nodes}
        self.edges = edges
        self.api_credentials = api_credentials or {}

    def get_topological_waves(self) -> List[List[str]]:
        return _get_topological_waves(self.nodes, self.edges)

    async def execute_node(self, node_id: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        if context is None:
            context = {}
        node = self.nodes[node_id]
        node_type = node.get("type", "unknown")
        title = node.get("title", "")
        config = dict(node.get("config") or {})

        # Inject user credentials with highest priority
        if self.api_credentials:
            title_lower = title.lower()
            if "tavily" in title_lower or (node_type == "tool" and "search" in title_lower):
                if "tavily_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["tavily_api_key"]
            elif node_type == "llm" or any(kw in title_lower for kw in ["groq", "claude", "gpt", "gemini", "llama", "mistral", "deepseek"]):
                model_name = config.get("model", "").lower()
                if "claude" in model_name or "anthropic" in title_lower:
                    if "anthropic_api_key" in self.api_credentials:
                        config["apiKey"] = self.api_credentials["anthropic_api_key"]
                elif "gpt" in model_name or "openai" in title_lower:
                    if "openai_api_key" in self.api_credentials:
                        config["apiKey"] = self.api_credentials["openai_api_key"]
                else:
                    if "groq_api_key" in self.api_credentials:
                        config["apiKey"] = self.api_credentials["groq_api_key"]
            elif "slack" in title_lower:
                if "slack_webhook" in self.api_credentials:
                    config["webhookUrl"] = self.api_credentials["slack_webhook"]
            elif "discord" in title_lower:
                if "discord_webhook" in self.api_credentials:
                    config["webhookUrl"] = self.api_credentials["discord_webhook"]
            elif "stripe" in title_lower:
                if "stripe_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["stripe_api_key"]
            elif "notion" in title_lower:
                if "notion_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["notion_api_key"]
            elif "github" in title_lower:
                if "github_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["github_api_key"]
            elif "pagerduty" in title_lower:
                if "pagerduty_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["pagerduty_api_key"]
            elif "gmail" in title_lower or "email" in title_lower:
                if "gmail_email" in self.api_credentials:
                    config["email"] = self.api_credentials["gmail_email"]
                if "gmail_app_password" in self.api_credentials:
                    config["password"] = self.api_credentials["gmail_app_password"]
            elif "hubspot" in title_lower:
                if "hubspot_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["hubspot_api_key"]
            elif "airtable" in title_lower:
                if "airtable_api_key" in self.api_credentials:
                    config["apiKey"] = self.api_credentials["airtable_api_key"]

        # Build upstream context from direct predecessors only
        incoming_ids = [e["fromId"] for e in self.edges if e["toId"] == node_id]
        upstream = {nid: context[nid] for nid in incoming_ids if nid in context}

        t_start = time.time()
        ts = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
        print(f"[DAG] [{ts}] EXEC Node '{title}' ({node_type}) | upstream={list(upstream.keys())}")

        is_gmail_sender = (
            ("gmail" in title.lower() or "email sender" in title.lower() or "send email" in title.lower())
            and node_type in ("app", "tool")
        )
        if is_gmail_sender:
            config["_node_titles"] = {nid: n.get("title", nid) for nid, n in self.nodes.items()}
        is_tavily = not is_gmail_sender and (
            "tavily" in title.lower() or (node_type == "tool" and "search" in title.lower())
        )
        is_llm = not is_gmail_sender and (
            node_type == "llm" or any(kw in title.lower() for kw in ["groq", "claude", "gpt", "gemini", "llama", "mistral", "deepseek"])
        )
        is_http = not is_gmail_sender and node_type != "trigger" and any(kw in title.lower() for kw in ["rest", "webhook", "http", "api call"])

        output_data = None
        status = "success"

        try:
            if is_gmail_sender:
                out = await GmailSenderTool.execute(config, upstream)
                output_data = out.model_dump()
                elapsed = round((time.time() - t_start) * 1000, 2)
                print(f"[DAG/GMAIL] '{title}' in {elapsed}ms | recipients={out.recipients}")

            elif is_http:
                out = await HTTPTool.execute(config)
                output_data = out.model_dump()
                elapsed = round((time.time() - t_start) * 1000, 2)
                print(f"[DAG/HTTP] '{title}' in {elapsed}ms | status={out.response_code}")

            elif is_tavily:
                out = await TavilySearchTool.execute(config)
                output_data = out.model_dump()
                elapsed = round((time.time() - t_start) * 1000, 2)
                print(f"[DAG/TAVILY] '{title}' in {elapsed}ms | {out.results_count} results")

            elif is_llm:
                out = await LLMExecutionTool.execute(title, config, upstream)
                output_data = out.model_dump()
                elapsed = round((time.time() - t_start) * 1000, 2)
                print(f"[DAG/LLM] '{title}' in {elapsed}ms | {len(out.summary)} chars")

            else:
                await asyncio.sleep(0.1)
                output_data = {"status": "success", "message": f"Node '{title}' executed."}
                elapsed = round((time.time() - t_start) * 1000, 2)
                print(f"[DAG/GENERIC] '{title}' in {elapsed}ms")

        except Exception as e:
            output_data = {"error": True, "message": str(e)}
            status = "error"
            print(f"\033[91m[DAG/ERROR]\033[0m ❌ '{title}': {e}")

        return {
            "status": status,
            "type": node_type,
            "title": title,
            "executed_at": datetime.utcnow().isoformat(),
            "output": output_data,
        }

    async def execute_sync(self) -> Dict[str, Any]:
        start_time = time.time()
        node_results = {}
        context: Dict[str, Any] = {}
        waves = self.get_topological_waves()

        print(f"\n\033[95m[DAG ENGINE]\033[0m Executing {len(waves)} wave(s) for {len(self.nodes)} nodes")

        for wave in waves:
            tasks = [self.execute_node(nid, context) for nid in wave]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for nid, result in zip(wave, results):
                if isinstance(result, Exception):
                    result = {"status": "error", "type": "unknown", "title": nid, "output": {"error": True, "message": str(result)}}
                node_results[nid] = result
                context[nid] = result.get("output", {})

        duration_ms = round((time.time() - start_time) * 1000, 2)
        print(f"\033[92m[DAG ENGINE]\033[0m ✅ Completed in {duration_ms}ms")
        return {"duration_ms": duration_ms, "node_results": node_results}
