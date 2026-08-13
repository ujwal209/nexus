from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class Position(BaseModel):
    x: float
    y: float

class NodeConfig(BaseModel):
    model: Optional[str] = "claude-3-5-sonnet"
    fallbackModel: Optional[str] = "gpt-4o"
    temperature: Optional[float] = 0.2
    topP: Optional[float] = 0.95
    systemPrompt: Optional[str] = None
    maxTokens: Optional[int] = 4096
    responseFormat: Optional[str] = "json_object"
    
    # Tavily Web Search Specific Fields
    query: Optional[str] = None
    searchDepth: Optional[str] = "advanced"
    topic: Optional[str] = "general"
    maxResults: Optional[int] = 5
    includeDomains: Optional[str] = None
    excludeDomains: Optional[str] = None
    includeRawContent: Optional[bool] = False
    includeAnswer: Optional[bool] = True
    includeImages: Optional[bool] = False

    timeout: Optional[int] = 30
    maxRetries: Optional[int] = 3
    retryStrategy: Optional[str] = "exponential"
    memoryLimit: Optional[int] = 512
    concurrency: Optional[int] = 10
    priority: Optional[str] = "high"
    webhookUrl: Optional[str] = None
    connectionString: Optional[str] = None
    apiKey: Optional[str] = None

    # REST API Client & Webhook specific fields
    url: Optional[str] = None
    method: Optional[str] = "GET"
    headers: Optional[Any] = None
    body: Optional[str] = None
    queryList: Optional[List[Dict[str, str]]] = None
    headersList: Optional[List[Dict[str, str]]] = None
    authType: Optional[str] = None
    authToken: Optional[str] = None
    authUsername: Optional[str] = None
    authPassword: Optional[str] = None

    model_config = {
        "extra": "allow"
    }

class CanvasNodeSchema(BaseModel):
    id: str
    type: str
    title: str
    subtitle: Optional[str] = ""
    status: Optional[str] = "idle"
    iconUrl: Optional[str] = ""
    colorClass: Optional[str] = ""
    category: Optional[str] = ""
    config: Optional[NodeConfig] = Field(default_factory=NodeConfig)
    position: Optional[Position] = None

    model_config = {"extra": "allow"}

class EdgeSchema(BaseModel):
    id: str
    fromId: str
    toId: str

class WorkflowSchema(BaseModel):
    graph_id: str
    name: Optional[str] = "nexus_agent_pipeline_v1"
    description: Optional[str] = ""
    engine: Optional[str] = "nexus_agent_v2"
    concurrency_limit: Optional[int] = 5
    timeout_sec: Optional[int] = 300
    logging_level: Optional[str] = "INFO"
    alert_webhook: Optional[str] = ""
    nodes: List[CanvasNodeSchema]
    edges: List[EdgeSchema]

class WorkflowResponse(WorkflowSchema):
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
