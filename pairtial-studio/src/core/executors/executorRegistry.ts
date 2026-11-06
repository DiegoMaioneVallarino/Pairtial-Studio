
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

    return executor
}
