export interface UploadSarifInput {
    readonly sarifPath: string;
    readonly isFork: boolean;
}
export declare function uploadSarif(input: UploadSarifInput): Promise<void>;
