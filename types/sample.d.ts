export type OobBehavior = 
    | { type: "clamp" } 
    | { type: "wrap" }
    | { type: "mirror" }
    | { type: "report" }
    | { type: "constant", value: number }

export type InvalidIndexValueMapping = 
    | { type: "none" }
    | { type: "constant", value: number }
