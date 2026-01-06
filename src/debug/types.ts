export interface VariableState{
    name: string;
    prev?: string;
    curr: string;
    changed: boolean;
}

export interface FrameKey{
    name: string;
    file?: string;
}

export interface FrameState{
    id: number;
    key: FrameKey;
    line: number;
}

export interface DebugState{
    frameVariables: Map<string, Map<string, VariableState>>;
    stackFrames: FrameState[];
    stopReason?: string;
}