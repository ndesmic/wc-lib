export type OobBehavior = 
    | { type: "clamp" } 
    | { type: "wrap" }
    | { type: "mirror" }
    | { type: "report" }
    | { type: "constant", value: number }
