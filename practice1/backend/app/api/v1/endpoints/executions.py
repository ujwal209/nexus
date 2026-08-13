from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.models.execution import ExecutionRequest
from app.services.workflow_service import WorkflowService
from app.services.execution_service import ExecutionService
from app.services.engine.dag_runner import DAGRunner
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/workflows/{graph_id}/execute", summary="Synchronously Execute Workflow")
async def execute_workflow_sync(
    graph_id: str,
    req: Optional[ExecutionRequest] = None,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Synchronous DAG workflow execution runner."""
    workflow = await WorkflowService.get_by_id(graph_id)
    if not workflow:
        raise HTTPException(status_code=404, detail=f"Workflow graph_id '{graph_id}' not found")

    api_credentials = current_user.get("api_credentials", {}) if current_user else {}

    runner = DAGRunner(
        nodes=workflow.get("nodes", []),
        edges=workflow.get("edges", []),
        api_credentials=api_credentials
    )
    res = await runner.execute_sync()

    record = await ExecutionService.record_execution(
        graph_id=graph_id,
        status="completed",
        duration_ms=res["duration_ms"],
        node_results=res["node_results"]
    )
    return record

@router.get("/executions", summary="List Execution Logs")
async def list_executions(graph_id: Optional[str] = None, limit: int = Query(20, ge=1, le=100)):
    """List execution history logs from MongoDB Atlas."""
    executions = await ExecutionService.list_executions(graph_id=graph_id, limit=limit)
    return {"count": len(executions), "executions": executions}
