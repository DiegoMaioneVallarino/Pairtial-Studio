import type { NodeKind } from "../types/types"
export type Field = { key: string; label: string; kind: "text" | "textarea" | "number" | "select"; defaultValue: string | number; options?: string[]; min?: number; max?: number; step?: number }
const text = (key: string, label: string, defaultValue = "", kind: "text" | "textarea" = "text"): Field => ({ key, label, defaultValue, kind })
const select = (key: string, label: string, defaultValue: string, options: string[]): Field => ({ key, label, defaultValue, options, kind: "select" })
const num = (key: string, label: string, defaultValue: number, min: number, max: number, step = 1): Field => ({ key, label, defaultValue, min, max, step, kind: "number" })
export const nodeFields: Partial<Record<NodeKind, Field[]>> = {
 human: [text("prompt","Solicitud","Revisar resultado","textarea"),select("mode","Tipo","approval",["approval","selection","instruction","parameter"]),text("choices","Opciones (una por línea)","A\nB","textarea")],
 fabric: [text("fabricId", "Sistema reutilizable")],
 loop: [num("maxIterations", "Máximo de iteraciones", 5, 1, 100), num("initialScore", "Puntuación inicial", 0, 0, 100), num("targetScore", "Objetivo", 80, 0, 100), num("scoreIncrement", "Incremento simulado", 20, 0, 100), num("iterationDelayMs", "Latencia por iteración", 100, 0, 60000)],
 deferred: [num("delayMs", "Espera adicional (ms)", 1000, 0, 600000)],
 "best-of-two": [num("scoreA", "Puntuación A", 80, 0, 100), num("scoreB", "Puntuación B", 70, 0, 100)],
 agent: [text("prompt", "Prompt", "", "textarea"), select("model", "Modelo simulado", "mock-general", ["mock-general", "mock-reasoning", "mock-fast"]), num("temperature", "Temperatura (informativa)", 0.7, 0, 2, 0.1), num("maxTokens", "Límite de tokens simulados", 1024, 1, 100000), text("response", "Respuesta simulada", "", "textarea")],
 api: [text("url", "URL simulada"), select("method", "Método", "GET", ["GET", "POST", "PUT", "PATCH", "DELETE"]), text("headers", "Headers JSON (sin secretos)", "{}", "textarea"), num("status", "Código HTTP simulado", 200, 100, 599), text("response", "Respuesta JSON", "", "textarea")],
 quality: [text("criteria", "Criterios", "Claridad y precisión", "textarea"), num("score", "Puntuación simulada", 92, 0, 100), num("threshold", "Umbral", 70, 0, 100)],
 engineer: [text("instructions", "Instrucciones", "", "textarea"), select("language", "Lenguaje", "typescript", ["typescript", "javascript", "python", "text"]), select("artifactKind", "Artefacto", "code", ["code", "document", "plan", "json"]), text("artifactName", "Nombre del artefacto"), text("artifactId", "ID para nueva versión (opcional)"), text("content", "Contenido simulado", "", "textarea")],
 supervisor: [text("rules", "Reglas", "", "textarea"), select("strategy", "Estrategia", "manual", ["manual", "quality"]), select("decision", "Decisión manual", "approved", ["approved", "revise", "rejected"])],
 hr: [select("role", "Especialidad", "engineer", ["engineer", "agent", "quality", "supervisor"]), text("reason", "Criterios de selección", "Especialista recomendado (simulado)", "textarea")],
 db: [select("operation", "Operación", "write", ["write", "read", "update", "delete", "search"]), text("key", "Clave", "result"), text("value", "Valor (vacío = entradas)", "", "textarea")],
 king: [text("objective", "Objetivo", "Evaluar resultados", "textarea"), text("policies", "Políticas", "", "textarea"), select("decision", "Decisión simulada", "approve", ["approve", "revise", "reject"])]
}
const latency: Partial<Record<NodeKind, number>> = {agent:500,api:350,quality:250,engineer:700,supervisor:400,hr:450,db:300,king:600}
export function simulationFields(kind: NodeKind): Field[] { return [num("maxRetries", "Reintentos de fallo simulado", 0, 0, 10), num("retryDelayMs", "Espera entre reintentos (ms)", 250, 0, 60000), num("latencyMs", "Latencia (ms)", latency[kind] ?? 500, 0, 60000), num("failureRate", "Probabilidad de fallo (%)", 0, 0, 100), num("simulatedTokens", "Tokens simulados", 0, 0, 1000000), num("simulatedCost", "Coste simulado (USD)", 0, 0, 10000, 0.0001)] }
export function getConfig(kind: NodeKind, data: Record<string, unknown>): Record<string, unknown> {
 const result = {...data}
 for (const f of [...(nodeFields[kind] ?? []), ...simulationFields(kind)]) {
  const v = data[f.key]
  result[f.key] = f.kind === "number" ? (typeof v === "number" && Number.isFinite(v) ? Math.min(f.max!, Math.max(f.min!, v)) : f.defaultValue) : typeof v === "string" && (!f.options || f.options.includes(v)) ? v : f.defaultValue
 }
 return result
}
