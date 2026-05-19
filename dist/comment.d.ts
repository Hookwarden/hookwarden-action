import type { ScanFinding } from "./types.js";
export interface PostCommentInput {
    readonly newFindings: ReadonlyArray<ScanFinding>;
    readonly findingsCount: number;
    readonly isFork: boolean;
    readonly eventName: string;
}
export declare function postOrUpdateStickyComment(input: PostCommentInput): Promise<void>;
