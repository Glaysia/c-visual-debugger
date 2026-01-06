import { DebugState, VariableState, FrameState, FrameKey } from "./types";

function frameKeyToString(key: FrameKey): string{
    return `${key.name}@${key.file ?? "unknown"}`;
}

export class DebugStateStore{
    private state: DebugState = {
        frameVariables: new Map(),
        stackFrames: []
    };

    updateVariable(frameKey: FrameKey, name: string, value: string): VariableState{
        const keyStr = frameKeyToString(frameKey);
        let frameVars = this.state.frameVariables.get(keyStr);

        if (!frameVars){
            frameVars = new Map();
            this.state.frameVariables.set(keyStr, frameVars);
        }

        const prev = frameVars.get(name)?.curr;
        const changed = prev !== undefined && prev !== value;

        const v: VariableState = {
            name,
            prev, 
            curr: value,
            changed
        };

        frameVars.set(name, v);
        return v;
    }

    setStackFrames(frames: FrameState[]){
        this.state.stackFrames = frames;
    }

    setStopReason(reason?: string){
        this.state.stopReason = reason;
    }

    getState(): DebugState{
        return this.state;
    }

    clearVariables(){
        this.state.frameVariables.clear();
    }

    reset(){
        this.clearVariables();
        this.state.stackFrames = [];
        this.state.stopReason = undefined;
    }
}