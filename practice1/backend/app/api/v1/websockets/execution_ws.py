import asyncio
import time
import traceback as tb_module
import jwt
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.workflow_service import WorkflowService
from app.services.engine.tools.tavily_tool import TavilySearchTool
from app.services.engine.tools.llm_tool import LLMExecutionTool
from app.services.engine.tools.http_tool import HTTPTool
from app.services.engine.tools.gmail_tool import GmailSenderTool
from app.core.database import get_database
from datetime import datetime

router = APIRouter()

JWT_SECRET = "NEXUS_SUPER_SECRET_JWT_KEY_2026"
JWT_ALGORITHM = "HS256"

async def get_credentials_from_token(token: Optional[str]) -> dict:
    if not token:
        return {}
    try:
        # Decode without verification checks if we want to be lax, but verification is safer
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if not email:
            return {}
        db = get_database()
        user = await db["users"].find_one({"email": email})
        if user:
            return user.get("api_credentials", {}) or {}
    except Exception as e:
        print(f"[WS-AUTH] Failed to decode token or load user: {e}")
    return {}

def inject_node_credentials(title: str, node_type: str, config: dict, api_credentials: dict) -> dict:
    if not api_credentials:
        return config
    
    new_config = dict(config)
    title_lower = title.lower()

    if "tavily" in title_lower or (node_type == "tool" and "search" in title_lower):
        if "tavily_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["tavily_api_key"]
    elif node_type == "llm" or any(kw in title_lower for kw in ["groq", "claude", "gpt", "gemini", "llama", "mistral", "deepseek"]):
        model_name = new_config.get("model", "").lower()
        if "claude" in model_name or "anthropic" in title_lower:
            if "anthropic_api_key" in api_credentials:
                new_config["apiKey"] = api_credentials["anthropic_api_key"]
        elif "gpt" in model_name or "openai" in title_lower:
            if "openai_api_key" in api_credentials:
                new_config["apiKey"] = api_credentials["openai_api_key"]
        else:
            if "groq_api_key" in api_credentials:
                new_config["apiKey"] = api_credentials["groq_api_key"]
    elif "slack" in title_lower:
        if "slack_webhook" in api_credentials:
            new_config["webhookUrl"] = api_credentials["slack_webhook"]
    elif "discord" in title_lower:
        if "discord_webhook" in api_credentials:
            new_config["webhookUrl"] = api_credentials["discord_webhook"]
    elif "stripe" in title_lower:
        if "stripe_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["stripe_api_key"]
    elif "notion" in title_lower:
        if "notion_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["notion_api_key"]
    elif "github" in title_lower:
        if "github_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["github_api_key"]
    elif "pagerduty" in title_lower:
        if "pagerduty_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["pagerduty_api_key"]
    elif "gmail" in title_lower or "email" in title_lower:
        if "gmail_email" in api_credentials:
            new_config["email"] = api_credentials["gmail_email"]
        if "gmail_app_password" in api_credentials:
            new_config["password"] = api_credentials["gmail_app_password"]
    elif "hubspot" in title_lower:
        if "hubspot_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["hubspot_api_key"]
    elif "airtable" in title_lower:
        if "airtable_api_key" in api_credentials:
            new_config["apiKey"] = api_credentials["airtable_api_key"]
            
    return new_config


def _get_execution_waves(nodes: list, edges: list) -> list:
    node_ids = {n["id"] for n in nodes}
    in_degree = {n["id"]: 0 for n in nodes}
    graph = {n["id"]: [] for n in nodes}

    for edge in edges:
        f, t = edge.get("fromId"), edge.get("toId")
        if f in node_ids and t in node_ids:
            graph[f].append(t)
            in_degree[t] += 1

    waves = []
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    while queue:
        waves.append(list(queue))
        next_q = []
        for nid in queue:
            for nb in graph[nid]:
                in_degree[nb] -= 1
                if in_degree[nb] == 0:
                    next_q.append(nb)
        queue = next_q
    return waves


async def _run_node(node: dict, context: dict, edges: list, api_credentials: dict = None, node_map: dict = None) -> dict:
    node_id = node["id"]
    node_type = node.get("type", "unknown")
    title = node.get("title", "")
    config = node.get("config") or {}
    
    # Inject user credentials
    config = inject_node_credentials(title, node_type, config, api_credentials or {})

    incoming_ids = [e["fromId"] for e in edges if e["toId"] == node_id]
    upstream = {nid: context[nid] for nid in incoming_ids if nid in context}

    ts = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
    print(f"[WS-EXEC] [{ts}] EXEC '{title}' ({node_type}) | upstream_nodes={list(upstream.keys())}")

    is_gmail_sender = (
        ("gmail" in title.lower() or "email sender" in title.lower() or "send email" in title.lower())
        and node_type in ("app", "tool")
    )
    if is_gmail_sender and node_map:
        config["_node_titles"] = {nid: n.get("title", nid) for nid, n in node_map.items()}
    is_tavily = not is_gmail_sender and (
        "tavily" in title.lower() or (node_type == "tool" and "search" in title.lower())
    )
    is_llm = not is_gmail_sender and (
        node_type == "llm" or any(kw in title.lower() for kw in ["groq", "claude", "gpt", "gemini", "llama", "mistral", "deepseek"])
    )
    is_http = not is_gmail_sender and node_type != "trigger" and any(kw in title.lower() for kw in ["rest", "webhook", "http", "api call"])

    t0 = asyncio.get_event_loop().time()

    if is_gmail_sender:
        print(f"[GMAIL] Sending email via Gmail Sender tool | recipients='{config.get('recipients', '')}'")
        out = await GmailSenderTool.execute(config, upstream)
        output = out.model_dump()
        elapsed = round((asyncio.get_event_loop().time() - t0) * 1000, 2)
        print(f"[GMAIL] Done in {elapsed}ms | recipients={out.recipients}")

    elif is_http:
        print(f"[HTTP] Calling API | method='{config.get('method', 'GET')}' | url='{config.get('url', '')}'")
        out = await HTTPTool.execute(config)
        output = out.model_dump()
        elapsed = round((asyncio.get_event_loop().time() - t0) * 1000, 2)
        print(f"[HTTP] Done in {elapsed}ms | status={out.response_code}")

    elif is_tavily:
        print(f"[TAVILY] Calling Tavily API | query='{config.get('query', 'N/A')}'")
        out = await TavilySearchTool.execute(config)
        output = out.model_dump()
        elapsed = round((asyncio.get_event_loop().time() - t0) * 1000, 2)
        print(f"[TAVILY] Done in {elapsed}ms | results={out.results_count} | answer_len={len(out.answer)}")

    elif is_llm:
        print(f"[LLM] Calling Groq API | model='{config.get('model', 'llama-3.3-70b-versatile')}' | upstream_context_keys={list(upstream.keys())}")
        if upstream:
            for uid, udata in upstream.items():
                if isinstance(udata, dict):
                    print(f"[LLM] upstream[{uid}] keys={list(udata.keys())} | answer_len={len(str(udata.get('answer','')))} chars")
        out = await LLMExecutionTool.execute(title, config, upstream)
        output = out.model_dump()
        elapsed = round((asyncio.get_event_loop().time() - t0) * 1000, 2)
        print(f"[LLM] Done in {elapsed}ms | summary_len={len(out.summary)} chars | model={out.model}")

    else:
        await asyncio.sleep(0.05)
        output = {"status": "success", "message": f"Node '{title}' executed."}
        elapsed = round((asyncio.get_event_loop().time() - t0) * 1000, 2)
        print(f"[GENERIC] Done '{title}' in {elapsed}ms")

    return {"node_id": node_id, "status": "success", "output": output}


@router.websocket("/ws/execute/{graph_id}")
async def websocket_execute(websocket: WebSocket, graph_id: str, token: Optional[str] = None):
    await websocket.accept()
    ts = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
    print(f"[WS] [{ts}] Client connected | graph_id={graph_id} | token_present={token is not None}")

    api_credentials = await get_credentials_from_token(token)

    try:
        workflow = await WorkflowService.get_by_id(graph_id)
        nodes: list = workflow.get("nodes", []) if workflow else []
        edges: list = workflow.get("edges", []) if workflow else []
        node_map = {n["id"]: n for n in nodes}

        print(f"[WS] Workflow loaded: {len(nodes)} nodes, {len(edges)} edges")
        for n in nodes:
            print(f"[WS]   node: id={n['id']} type={n.get('type')} title='{n.get('title')}' config_keys={list((n.get('config') or {}).keys())}")
        for e in edges:
            print(f"[WS]   edge: {e.get('fromId')} -> {e.get('toId')}")

        if not nodes:
            await websocket.send_json({
                "type": "execution_error",
                "error": f"Workflow '{graph_id}' has no nodes. Save the workflow first by pressing the Save button."
            })
            return

        waves = _get_execution_waves(nodes, edges)
        print(f"[WS] Execution plan: {len(waves)} wave(s) -> {waves}")

        await websocket.send_json({
            "type": "execution_start",
            "graph_id": graph_id,
            "node_count": len(nodes),
            "wave_count": len(waves),
            "plan": waves,
        })

        t_start = time.time()
        context: dict = {}

        for wave_idx, wave in enumerate(waves):
            print(f"[WS] Wave {wave_idx + 1}/{len(waves)}: {wave}")
            for nid in wave:
                await websocket.send_json({"type": "node_update", "nodeId": nid, "status": "running", "output": None})

            tasks = [_run_node(node_map[nid], context, edges, api_credentials, node_map) for nid in wave]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for nid, result in zip(wave, results):
                if isinstance(result, BaseException):
                    # ── Real exception extraction (format_exc() lies with return_exceptions=True)
                    real_tb = "".join(tb_module.format_exception(type(result), result, result.__traceback__))
                    err_msg = str(result) if str(result) else repr(result)
                    print(f"[WS-ERROR] Node '{nid}' REAL ERROR:\n{real_tb}")
                    context[nid] = {"error": True, "message": err_msg}
                    await websocket.send_json({
                        "type": "node_update",
                        "nodeId": nid,
                        "status": "error",
                        "output": {
                            "error": True,
                            "message": err_msg,
                            "traceback": real_tb,
                            "execution_audit": {
                                "execution_mode": "ERROR",
                                "logs": [
                                    f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] ERROR: {err_msg}",
                                ]
                            }
                        },
                    })
                else:
                    output_data = result.get("output", {})
                    context[nid] = output_data
                    is_error = False
                    if isinstance(output_data, dict):
                        if output_data.get("status") == "error" or output_data.get("error") is True:
                            is_error = True
                    node_status = "error" if is_error else "success"
                    print(f"[WS] Node '{nid}' -> context stored, status={node_status}, output_keys={list(output_data.keys()) if isinstance(output_data, dict) else type(output_data).__name__}")
                    await websocket.send_json({
                        "type": "node_update",
                        "nodeId": nid,
                        "status": node_status,
                        "output": output_data,
                    })

        # Record execution metrics to MongoDB Atlas database
        try:
            duration_ms = round((time.time() - t_start) * 1000, 2)
            has_error = False
            node_results = {}
            for nid, out_val in context.items():
                is_err = False
                if isinstance(out_val, dict):
                    if out_val.get("error") is True or out_val.get("status") == "error":
                        is_err = True
                        has_error = True
                node_results[nid] = {
                    "status": "error" if is_err else "success",
                    "output": out_val
                }
            status = "failed" if has_error else "completed"
            from app.services.execution_service import ExecutionService
            await ExecutionService.record_execution(
                graph_id=graph_id,
                status=status,
                duration_ms=duration_ms,
                node_results=node_results
            )
        except Exception as log_err:
            print(f"[WS-LOG-ERR] Failed to record execution: {log_err}")

        print(f"[WS] Workflow '{graph_id}' completed.")
        await websocket.send_json({"type": "execution_complete", "graph_id": graph_id, "status": "success"})

    except WebSocketDisconnect:
        print(f"[WS] Client disconnected from graph_id={graph_id}")
    except Exception as e:
        real_tb = tb_module.format_exc()
        print(f"[WS-FATAL] Fatal error:\n{real_tb}")
        
        # Record fatal execution failures
        try:
            duration_ms = round((time.time() - t_start) * 1000, 2) if 't_start' in locals() else 0.0
            from app.services.execution_service import ExecutionService
            await ExecutionService.record_execution(
                graph_id=graph_id,
                status="failed",
                duration_ms=duration_ms,
                node_results={"fatal_error": {"status": "error", "output": {"message": str(e), "traceback": real_tb}}}
            )
        except Exception as log_err:
            print(f"[WS-LOG-ERR] Failed to record fatal execution: {log_err}")

        try:
            await websocket.send_json({"type": "execution_error", "error": str(e), "traceback": real_tb})
        except Exception:
            pass
