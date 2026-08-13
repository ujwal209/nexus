from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
import httpx
from app.models.workflow import WorkflowSchema
from app.services.workflow_service import WorkflowService
from app.api.v1.endpoints.auth import get_current_user
from app.services.engine.tools.llm_tool import LLMExecutionTool

router = APIRouter()

class GenerateHTMLRequest(BaseModel):
    prompt: str
    variables: Optional[list] = None

@router.post("/workflows", status_code=201, summary="Save or Update Workflow AST")
async def save_or_update_workflow(workflow: WorkflowSchema):
    """Save or update a Workflow AST in MongoDB Atlas."""
    return await WorkflowService.save_or_update(workflow)

@router.get("/workflows", summary="List Saved Workflows")
async def list_workflows(limit: int = Query(20, ge=1, le=100)):
    """List all saved workflows from MongoDB Atlas."""
    workflows = await WorkflowService.list_all(limit=limit)
    return {"count": len(workflows), "workflows": workflows}

@router.get("/workflows/{graph_id}", summary="Get Workflow by Graph ID")
async def get_workflow(graph_id: str):
    """Fetch workflow AST by graph_id."""
    workflow = await WorkflowService.get_by_id(graph_id)
    if not workflow:
        raise HTTPException(status_code=404, detail=f"Workflow graph_id '{graph_id}' not found")
    return workflow

@router.delete("/workflows/{graph_id}", summary="Delete Workflow by Graph ID")
async def delete_workflow(graph_id: str):
    """Delete workflow AST by graph_id."""
    success = await WorkflowService.delete(graph_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Workflow graph_id '{graph_id}' not found")
    return {"status": "deleted", "graph_id": graph_id}

@router.post("/workflows/generate-html", summary="Generate email HTML body with Groq")
async def generate_email_html(req: GenerateHTMLRequest, current_user: Optional[dict] = Depends(get_current_user)):
    """Generate responsive email HTML body with Groq based on a prompt."""
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    # Sourced Groq key: try user key first, then fallback to round-robin
    user_key = ""
    if current_user and "api_credentials" in current_user:
        user_key = current_user["api_credentials"].get("groq_api_key", "").strip()
    
    api_key = user_key if user_key else LLMExecutionTool._next_key()
    
    # Format available variables context for Groq prompt including actual node execution outputs
    import json
    variables_str = ""
    if req.variables:
        for v in req.variables:
            if isinstance(v, dict) and "id" in v and "title" in v:
                node_id = v["id"]
                title = v["title"]
                subtitle = v.get("subtitle", "")
                output_val = v.get("output")
                
                output_str = "None (Workflow has not run yet)"
                if output_val is not None:
                    if isinstance(output_val, (dict, list)):
                        try:
                            output_str = json.dumps(output_val, indent=2)
                        except Exception:
                            output_str = str(output_val)
                    else:
                        output_str = str(output_val)
                
                variables_str += (
                    f"- {{{{ {node_id} }}}} (represents outputs from upstream node '{title}' - '{subtitle}'):\n"
                    f"  [Real Data Context from last run]:\n"
                    f"  ```json\n"
                    f"  {output_str}\n"
                    f"  ```\n\n"
                )
    else:
        variables_str = "- No specific upstream variables detected"
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    system_prompt = (
        "You are an expert responsive email designer. Generate a COMPLETE, stand-alone responsive HTML email document "
        "(including <!DOCTYPE html>, <html>, <head>, <style>, and <body> tags). "
        "Use inline styles for layout elements, but you can also include a <style> block in the head for general page layouts, margins, hover effects, and font sizing. "
        "CRITICAL: Do NOT wrap the HTML in markdown block code wrappers like ```html or ```. Return ONLY raw HTML output. "
        "Use 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif as the primary font family to match the website style. "
        "Keep the theme dark and premium (e.g. background #0a0a0a, card background #111111, borders #222222, violet accents #7c3aed, and soft gray text #d4d4d8). "
        "You MUST only use the following exact context placeholders to inject dynamic data from upstream nodes (do NOT invent other placeholders):\n"
        f"{variables_str}\n"
        "- {{upstream_output}} (represents all upstream node outputs merged)\n"
        "- {{timestamp}} (represents current UTC execution timestamp)\n\n"
        "Integrate these placeholders naturally and beautifully inside your responsive dark-themed HTML layout, e.g., in text boxes, badges, or list blocks."
    )
    user_message = f"Generate HTML template for: {prompt}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1500,
                },
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Groq API error: {resp.text}")
        
        content = resp.json()["choices"][0]["message"]["content"].strip()
        
        # Strip code block wrappers if Groq accidentally generated them
        if content.startswith("```html"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        return {"html": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
