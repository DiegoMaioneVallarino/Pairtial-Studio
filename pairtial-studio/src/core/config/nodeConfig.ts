import type { NodeKind } from "../types/types"
export type Field = { key: string; label: string; kind: "text" | "textarea" | "number" | "select"; defaultValue: string | number; options?: string[]; min?: number; max?: number; step?: number }
const text = (key: string, label: string, defaultValue = "", kind: "text" | "textarea" = "text"): Field => ({ key, label, defaultValue, kind })
const select = (key: string, label: string, defaultValue: string, options: string[]): Field => ({ key, label, defaultValue, options, kind: "select" })
const num = (key: string, label: string, defaultValue: number, min: number, max: number, step = 1): Field => ({ key, label, defaultValue, min, max, step, kind: "number" })
export const nodeFields: Partial<Record<NodeKind, Field[]>> = {
 agent: [text("prompt", "Prompt", "", "textarea"), text("provider", "Proveedor (mock, anthropic… el registro lo valida al ejecutar)", "mock"), text("model", "Modelo", "mock-general"), num("temperature", "Temperatura", 0.7, 0, 2, 0.1), num("maxTokens", "Máximo de tokens de salida", 1024, 1, 100000), text("response", "Respuesta simulada (solo proveedor mock)", "", "textarea")],
 api: [text("url", "URL simulada"), select("method", "Método", "GET", ["GET", "POST", "PUT", "PATCH", "DELETE"]), text("headers", "Headers JSON (sin secretos)", "{}", "textarea"), num("status", "Código HTTP simulado", 200, 100, 599), text("response", "Respuesta JSON", "", "textarea")],
 quality: [text("criteria", "Criterios", "Claridad y precisión", "textarea"), select("mode", "Modo de evaluación", "manual", ["manual", "heuristic", "llm"]), num("threshold", "Umbral", 70, 0, 100), num("score", "Puntuación fija (manual) / simulada (llm + mock)", 92, 0, 100), num("minLength", "Heurístico: longitud mínima", 0, 0, 1000000), text("mustInclude", "Heurístico: debe incluir (separado por comas)"), text("mustNotInclude", "Heurístico: no debe incluir (separado por comas)"), text("provider", "LLM: proveedor", "mock"), text("model", "LLM: modelo", "mock-general")],
 engineer: [text("instructions", "Instrucciones", "", "textarea"), select("language", "Lenguaje", "typescript", ["typescript", "javascript", "python", "text"]), select("artifactKind", "Artefacto", "code", ["code", "document", "plan"]), text("content", "Contenido simulado", "", "textarea")],
 supervisor: [text("rules", "Reglas", "", "textarea"), select("strategy", "Estrategia", "manual", ["manual", "quality"]), select("decision", "Decisión manual", "approved", ["approved", "revise", "rejected"])],
 hr: [select("role", "Especialidad", "engineer", ["engineer", "agent", "quality", "supervisor"]), text("reason", "Criterios de selección", "Especialista recomendado (simulado)", "textarea")],
 db: [select("operation", "Operación", "write", ["write", "read", "update", "delete", "search"]), text("key", "Clave", "result"), text("value", "Valor (vacío = entradas)", "", "textarea")],
 king: [text("objective", "Objetivo", "Evaluar resultados", "textarea"), text("policies", "Políticas", "", "textarea"), select("decision", "Decisión simulada", "approve", ["approve", "revise", "reject"])]
}
const latency: Partial<Record<NodeKind, number>> = {agent:500,api:350,quality:250,engineer:700,supervisor:400,hr:450,db:300,king:600}
/** Reintentos y timeout: aplican a todos los nodos, simulados o reales. */
export function resilienceFields(): Field[] { return [num("retries", "Reintentos", 0, 0, 10), num("retryDelayMs", "Espera inicial entre reintentos (ms, se duplica)", 500, 0, 60000), num("timeoutMs", "Timeout por intento (ms, 0 = sin límite)", 0, 0, 600000)] }
export function simulationFields(kind: NodeKind): Field[] { return [num("latencyMs", "Latencia (ms)", latency[kind] ?? 500, 0, 60000), num("failureRate", "Probabilidad de fallo (%)", 0, 0, 100), num("simulatedTokens", "Tokens simulados", 0, 0, 1000000), num("simulatedCost", "Coste simulado (USD)", 0, 0, 10000, 0.0001)] }
export function getConfig(kind: NodeKind, data: Record<string, unknown>): Record<string, unknown> {
 const result = {...data}
 for (const f of [...(nodeFields[kind] ?? []), ...simulationFields(kind), ...resilienceFields()]) {
  const v = data[f.key]
  result[f.key] = f.kind === "number" ? (typeof v === "number" && Number.isFinite(v) ? Math.min(f.max!, Math.max(f.min!, v)) : f.defaultValue) : typeof v === "string" && (!f.options || f.options.includes(v)) ? v : f.defaultValue
 }
 return result
}
