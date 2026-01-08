export interface VariableState{
    name: string;
    prev?: string;
    curr: string;
    changed: boolean;
}

export interface FrameKey{
    frameId: number;
    depth: number;
    name: string;
}

export interface FrameState{
    id: number;
    file?: string;
    key: FrameKey;
    line: number;
}

export interface DebugState{
    frameVariables: Map<string, Map<string, VariableState>>;
    stackFrames: FrameState[];
    stopReason?: string;
}