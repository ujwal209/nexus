import time
from typing import List, Optional
from datetime import datetime
from app.core.database import get_database

class ExecutionService:
    @staticmethod
    async def record_execution(graph_id: str, status: str, duration_ms: float, node_results: dict) -> dict:
        db = get_database()
        execution_id = f"exec_{int(time.time() * 1000)}"

        record = {
            "execution_id": execution_id,
            "graph_id": graph_id,
            "status": status,
            "duration_ms": duration_ms,
            "node_results": node_results,
            "timestamp": datetime.utcnow().isoformat()
        }

        await db["executions"].insert_one(record)
        record.pop("_id", None)
        return record

    @staticmethod
    async def list_executions(graph_id: Optional[str] = None, limit: int = 20) -> List[dict]:
        db = get_database()
        query = {"graph_id": graph_id} if graph_id else {}
        cursor = db["executions"].find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
        return await cursor.to_list(length=limit)
