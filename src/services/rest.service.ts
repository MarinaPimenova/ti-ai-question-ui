import { publicApi } from './axios.config.ts';
import type { DocumentDto, LoadUrlPayload, UploadDocumentResponse } from '../interfaces/document.interface';
import type { GeneratedQuestion, QuestionGenerationPayload } from '../interfaces/question.interface';

const DOCUMENT_WORKER_URL = '/rest/v1/document/documents';
const DOCUMENT_LOAD_URL = '/rest/v1/document/load-url';
const DOCUMENT_AGENT_URL = '/rest/v1/resourceagent/resources';

export const uploadDocument = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return publicApi.post<UploadDocumentResponse>(DOCUMENT_WORKER_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const loadDocumentFromUrl = (payload: LoadUrlPayload) => {
    return publicApi.post<UploadDocumentResponse>(DOCUMENT_LOAD_URL, payload);
};

export const getUploadedResourcesList = () => {
    return publicApi.get<DocumentDto[]>(DOCUMENT_AGENT_URL);
};

export const generateQuestions = (documentId: number, payload: QuestionGenerationPayload) => {
    return publicApi.post<GeneratedQuestion[]>(
        `${DOCUMENT_AGENT_URL}/${documentId}/question-generation`,
        payload
    );
};
