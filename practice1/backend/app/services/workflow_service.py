from typing import List, Optional
from datetime import datetime
from app.core.database import get_database
from app.models.workflow import WorkflowSchema

class WorkflowService:
    @staticmethod
    async def save_or_update(workflow: WorkflowSchema) -> dict:
        db = get_database()
        collection = db["workflows"]

        workflow_dict = workflow.model_dump()
        workflow_dict["updated_at"] = datetime.utcnow().isoformat()

        existing = await collection.find_one({"graph_id": workflow.graph_id})
        if existing:
            await collection.update_one(
                {"graph_id": workflow.graph_id},
                {"$set": workflow_dict}
            )
            return {"status": "updated", "graph_id": workflow.graph_id}
        else:
            workflow_dict["created_at"] = datetime.utcnow().isoformat()
            await collection.insert_one(workflow_dict)
            return {"status": "created", "graph_id": workflow.graph_id}

    @staticmethod
    async def get_by_id(graph_id: str) -> Optional[dict]:
        db = get_database()
        return await db["workflows"].find_one({"graph_id": graph_id}, {"_id": 0})

    @staticmethod
    async def list_all(limit: int = 20) -> List[dict]:
        db = get_database()
        cursor = db["workflows"].find({}, {"_id": 0}).limit(limit)
        return await cursor.to_list(length=limit)

    @staticmethod
    async def delete(graph_id: str) -> bool:
        db = get_database()
        result = await db["workflows"].delete_one({"graph_id": graph_id})
        return result.deleted_count > 0
