export interface QuestionLevel {
    id: number;
    code: string;
}

export interface QuestionTag {
    id: number;
    tag: string;
}

export interface GeneratedQuestion {
    question: string;
    answer: string;
    level: QuestionLevel;
    tags: QuestionTag[];
    resources: string[];
}

export interface QuestionGenerationPayload {
    userMessage: string;
    requestedQuestionCount: number;
}
