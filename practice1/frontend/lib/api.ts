const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1";

export interface WorkflowPayload {
  graph_id: string;
  name: string;
  engine: string;
  nodes: any[];
  edges: any[];
}

function getAuthHeaders() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nexus-token");
    if (token) {
      return { "Authorization": `Bearer ${token}` };
    }
  }
  return {};
}

export async function saveWorkflowToBackend(workflow: WorkflowPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/workflows`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(workflow),
    });

    if (!res.ok) {
      throw new Error(`Failed to save workflow: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API save failed:", err);
    return null;
  }
}

export async function fetchWorkflowsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/workflows`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) throw new Error("Failed to fetch workflows");
    return await res.json();
  } catch (err) {
    console.warn("Backend API list failed:", err);
    return null;
  }
}

export async function fetchExecutionsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/executions`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) throw new Error("Failed to fetch executions");
    return await res.json();
  } catch (err) {
    console.warn("Backend API executions failed:", err);
    return null;
  }
}

export function connectExecutionWebSocket(
  graphId: string,
  onNodeUpdate: (nodeId: string, status: "idle" | "running" | "success" | "error", output?: any) => void,
  onComplete: () => void,
  onError: (err: any) => void
) {
  const token = typeof window !== "undefined" ? localStorage.getItem("nexus-token") : null;
  const wsUrl = `${WS_BASE_URL}/ws/execute/${graphId}${token ? `?token=${token}` : ""}`;
  console.log(`%c[WS] Connecting to ${wsUrl}`, "color: #a855f7; font-weight: bold");
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log(`%c[WS] ✅ Connected to backend WebSocket | graph_id=${graphId}`, "color: #22c55e; font-weight: bold");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const ts = new Date().toISOString().slice(11, 23);

      switch (data.type) {
        case "execution_start":
          console.log(
            `%c[WS] 🚀 Execution started | nodes=${data.node_count} | waves=${data.wave_count}`,
            "color: #3b82f6; font-weight: bold"
          );
          console.log(`%c[WS] Execution plan:`, "color: #3b82f6", data.plan);
          break;

        case "node_update":
          const statusEmoji = data.status === "running" ? "⏳" : data.status === "success" ? "✅" : "❌";
          console.log(
            `%c[WS] ${statusEmoji} node_update | nodeId=${data.nodeId} | status=${data.status}`,
            data.status === "error" ? "color: #ef4444; font-weight: bold" : "color: #f59e0b"
          );
          if (data.output) {
            console.log(`%c[WS]   └─ output:`, "color: #94a3b8", data.output);
          }
          onNodeUpdate(data.nodeId, data.status, data.output);
          break;

        case "execution_complete":
          console.log(
            `%c[WS] 🎉 Execution complete | graph_id=${data.graph_id}`,
            "color: #22c55e; font-weight: bold"
          );
          onComplete();
          socket.close();
          break;

        case "execution_error":
          console.error(`%c[WS] ❌ Execution error: ${data.error}`, "color: #ef4444; font-weight: bold");
          onError(data.error);
          socket.close();
          break;

        default:
          console.log(`%c[WS] Unknown message type: ${data.type}`, "color: #94a3b8", data);
      }
    } catch (e) {
      console.error("[WS] Failed to parse message:", e, event.data);
    }
  };

  socket.onerror = (error) => {
    console.error("%c[WS] ❌ WebSocket connection error — is the backend running on port 8000?", "color: #ef4444; font-weight: bold", error);
    onError(error);
  };

  socket.onclose = (ev) => {
    console.log(`%c[WS] Connection closed | code=${ev.code} | reason=${ev.reason || "normal"}`, "color: #94a3b8");
  };

  return socket;
}
