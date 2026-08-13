from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ExecutionRequest(BaseModel):
    graph_id: str
    inputs: Optional[Dict[str, Any]] = Field(default_factory=dict)

class NodeExecutionResult(BaseModel):
    status: str
    type: str
    title: str
    executed_at: str
    output: Any

class ExecutionRecord(BaseModel):
    execution_id: str
    graph_id: str
    status: str
    duration_ms: float
    node_results: Dict[str, NodeExecutionResult]
    timestamp: str
