import { publicApi} from "./axios.config.ts";

const DOCUMENT_WORKER_URL = '/rest/v1/document/documents';
const DOCUMENT_AGENT_URL = '/rest/v1/document-agent/documents';

export const uploadResources = (?) => {
    return publicApi.post<(DOCUMENT_WORKER_URL, ?);
};

export const getUploadedResourcesList = () => {
    return publicApi.get<?>(
        DOCUMENT_AGENT_URL
    );
};

export const generateQuestions = (documentId: number, payload: QuestionGenerationPayload) => {
    return publicApi.post<string, any>(
        `${DOCUMENT_AGENT_URL}/${documentId}/question-generation`, payload);
};

