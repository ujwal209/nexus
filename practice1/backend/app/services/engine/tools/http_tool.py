import json
import time
import httpx
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger("nexus.http_tool")


class HTTPOutput(BaseModel):
    status: str
    method: str
    url: str
    response_code: int
    latency_ms: float
    response_body: str
    execution_audit: Dict[str, Any]


class HTTPTool:
    """Production HTTP REST Client Node — Handles REST API and webhook requests."""

    @classmethod
    async def execute(cls, config: Dict[str, Any], query: Optional[str] = None) -> HTTPOutput:
        start_time = time.time()
        method = (config.get("method") or "GET").upper()
        url = (config.get("url") or "").strip()
        if not url:
            logs = [
                f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] ERROR: HTTP Request URL is empty! Configure the 'url' field on the node."
            ]
            print(f"[HTTP/ERROR] HTTP Request URL is empty for {method} request.")
            return HTTPOutput(
                status="error",
                method=method,
                url="",
                response_code=400,
                latency_ms=0.0,
                response_body=json.dumps({
                    "error": "HTTP Request URL is empty! Please configure the 'url' field in node properties.",
                    "status_code": 400
                }, indent=2),
                execution_audit={
                    "http_method": method,
                    "endpoint_url": "",
                    "response_status": 400,
                    "latency_ms": 0.0,
                    "logs": logs,
                }
            )

        # Parse headers
        headers_raw = config.get("headers") or ""
        headers = {}
        if isinstance(headers_raw, str) and headers_raw.strip():
            try:
                headers = json.loads(headers_raw)
            except Exception:
                headers = {}
        elif isinstance(headers_raw, dict):
            headers = headers_raw

        # Default header content type
        if "Content-Type" not in {k.lower(): v for k, v in headers.items()}:
            if method in ["POST", "PUT", "PATCH"]:
                headers["Content-Type"] = "application/json"

        # Parse body
        body_raw = config.get("body") or ""
        body_data = None
        if isinstance(body_raw, str) and body_raw.strip() and method in ["POST", "PUT", "PATCH", "DELETE"]:
            # Check if headers content type is JSON, try to parse it
            is_json = "application/json" in [v.lower() for k, v in headers.items() if k.lower() == "content-type"]
            if is_json:
                try:
                    body_data = json.loads(body_raw)
                except Exception:
                    body_data = body_raw  # Fallback to raw text
            else:
                body_data = body_raw
        else:
            body_data = body_raw

        logs = [
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] INIT: HTTP {method} request to '{url}'",
            f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] HEADERS: {list(headers.keys())}",
        ]

        print(f"[HTTP] Dispatching {method} -> '{url}'")

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                if method == "GET":
                    resp = await client.get(url, headers=headers)
                elif method == "POST":
                    if isinstance(body_data, dict):
                        resp = await client.post(url, headers=headers, json=body_data)
                    else:
                        resp = await client.post(url, headers=headers, content=str(body_data))
                elif method == "PUT":
                    if isinstance(body_data, dict):
                        resp = await client.put(url, headers=headers, json=body_data)
                    else:
                        resp = await client.put(url, headers=headers, content=str(body_data))
                elif method == "DELETE":
                    if isinstance(body_data, dict):
                        resp = await client.request("DELETE", url, headers=headers, json=body_data)
                    else:
                        resp = await client.request("DELETE", url, headers=headers, content=str(body_data))
                elif method == "PATCH":
                    if isinstance(body_data, dict):
                        resp = await client.patch(url, headers=headers, json=body_data)
                    else:
                        resp = await client.patch(url, headers=headers, content=str(body_data))
                else:
                    return HTTPOutput(
                        status="error",
                        method=method,
                        url=url,
                        response_code=400,
                        latency_ms=0.0,
                        response_body=json.dumps({"error": f"Unsupported HTTP method: {method}"}),
                        execution_audit={"logs": logs}
                    )

            latency = round((time.time() - start_time) * 1000, 2)
            response_text = resp.text
            logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] RESPONSE: HTTP {resp.status_code} ({latency}ms)")
            print(f"[HTTP] {method} Response: Status {resp.status_code} in {latency}ms")

            return HTTPOutput(
                status="success" if resp.status_code < 400 else "error",
                method=method,
                url=url,
                response_code=resp.status_code,
                latency_ms=latency,
                response_body=response_text,
                execution_audit={
                    "http_method": method,
                    "endpoint_url": url,
                    "response_status": resp.status_code,
                    "latency_ms": latency,
                    "logs": logs,
                }
            )

        except Exception as e:
            latency = round((time.time() - start_time) * 1000, 2)
            logs.append(f"[{datetime.utcnow().strftime('%H:%M:%S.%f')[:-3]}] FAILED: {str(e)}")
            print(f"[HTTP/ERROR] {method} to '{url}' failed: {e}")
            return HTTPOutput(
                status="error",
                method=method,
                url=url,
                response_code=0,
                latency_ms=latency,
                response_body=json.dumps({"error": f"HTTP Request failed: {str(e)}", "url": url}, indent=2),
                execution_audit={
                    "http_method": method,
                    "endpoint_url": url,
                    "response_status": 0,
                    "latency_ms": latency,
                    "logs": logs,
                }
            )
