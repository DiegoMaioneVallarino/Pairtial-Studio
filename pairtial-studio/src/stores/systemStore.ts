import {
    create
} from "zustand"

import {
    persist
} from "zustand/middleware"

import type {
    PairtialEdge,
    PairtialNode,
    PairtialSystem
} from "../core/types/types"


type SystemStore = {

    systems:
        PairtialSystem[]

    activeSystemId:
        string | null


    createSystem: () =>
        string

    selectSystem: (
        id: string
    ) => void

    renameSystem: (
        id: string,
        name: string
    ) => void

    deleteSystem: (
        id: string
    ) => void

    updateSystemGraph: (
        id: string,
        nodes: PairtialNode[],
        edges: PairtialEdge[]
    ) => void

}


export const useSystemStore =
    create<SystemStore>()(
        persist(
            (
                set,
                get
            ) => ({

                systems: [],

                activeSystemId: null,


                createSystem: () => {

                    const id =
                        crypto.randomUUID()

                    const now =
                        Date.now()


                    const system:
                        PairtialSystem = {

                        id,

                        name:
                            "Nuevo sistema",

                        nodes: [],

                        edges: [],

                        createdAt:
                            now,

                        updatedAt:
                            now
                    }


                    set(state => ({

                        systems: [
                            ...state.systems,
                            system
                        ],

                        activeSystemId:
                            id

                    }))


                    return id
                },


                selectSystem: (
                    id
                ) => {

                    const exists =
                        get()
                            .systems
                            .some(
                                system =>
                                    system.id === id
                            )


                    if (!exists) {
                        return
                    }


                    set({
                        activeSystemId:
                            id
                    })
                },


                renameSystem: (
                    id,
                    name
                ) => {

                    set(state => ({

                        systems:
                            state.systems.map(
                                system => {

                                    if (
                                        system.id !== id
                                    ) {
                                        return system
                                    }


                                    return {
                                        ...system,

                                        name,

                                        updatedAt:
                                            Date.now()
                                    }

                                }
                            )

                    }))
                },


                deleteSystem: (
                    id
                ) => {

                    set(state => {

                        const systems =
                            state.systems.filter(
                                system =>
                                    system.id !== id
                            )


                        let activeSystemId =
                            state.activeSystemId


                        if (
                            activeSystemId === id
                        ) {

                            activeSystemId =
                                systems[0]?.id ??
                                null
                        }


                        return {
                            systems,
                            activeSystemId
                        }
                    })
                },


                updateSystemGraph: (
                    id,
                    nodes,
                    edges
                ) => {

                    set(state => ({

                        systems:
                            state.systems.map(
                                system => {

                                    if (
                                        system.id !== id
                                    ) {
                                        return system
                                    }


                                    return {
                                        ...system,

                                        nodes,

                                        edges,

                                        updatedAt:
                                            Date.now()
                                    }

                                }
                            )

                    }))
                }

            }),
            {
                name:
                    "pairtial-systems"
            }
        )
    )