export interface DocumentDto {
    id: number;
    filename: string;
}

export type DocumentUploadStatus = 'UPLOADED' | 'PROCESSING' | 'FAILED' | string;

export interface UploadDocumentResponse {
    documentId: number;
    filename: string;
    status: DocumentUploadStatus;
}

export interface LoadUrlPayload {
    url: string;
}
