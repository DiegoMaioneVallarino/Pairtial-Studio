import { withSimulation } from "./simulation"
import { withResilience } from "./resilience"
import { databaseExecutor } from "./databaseExecutor"
import { kingExecutor } from "./kingExecutor"

import type {
    NodeKind
} from "../types/types"

import type {
    NodeExecutor
} from "./executor.types"

import {
    agentExecutor
} from "./agentExecutor"

import {
    apiExecutor
} from "./apiExecutor"

import {
    qualityExecutor
} from "./qualityExecutor"

import {
    engineerExecutor
} from "./engineerExecutor"

import {
    supervisorExecutor
} from "./supervisorExecutor"

import {
    hrExecutor
} from "./hrExecutor"


const executors:
    Partial<Record<NodeKind, NodeExecutor>> = {

        db: databaseExecutor,
        king: kingExecutor,
        agent:
            agentExecutor,

        api:
            apiExecutor,

        quality:
            qualityExecutor,

        engineer:
            engineerExecutor,

        supervisor:
            supervisorExecutor,

        hr:
            hrExecutor
    }


/**
 * ¿Este nodo es simulado? Solo entonces se le aplican latencia, fallos y costes
 * ficticios. Agent y Quality (modo llm) dependen del proveedor; Quality
 * heurístico es cálculo real e instantáneo.
 */
export function isSimulated(kind: NodeKind, config: Record<string, unknown>): boolean {
    if (kind === "agent") return config.provider === "mock"
    if (kind === "quality") {
        if (config.mode === "heuristic") return false
        if (config.mode === "llm") return config.provider === "mock"
    }
    return true
}

export function getExecutor(
    kind: NodeKind
): NodeExecutor {

    const executor =
        executors[kind]

    if (!executor) {
        throw new Error(
            `No executor registered for node kind "${kind}"`
        )
    }

    return withResilience(withSimulation(executor, isSimulated))
}
