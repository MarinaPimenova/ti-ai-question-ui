import { useCallback, useEffect, useState } from 'react';
import { Button, Divider, Input, Radio, Spin, Table, Tag, Tooltip, Typography } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PaperClipOutlined } from '@ant-design/icons';
import {
    generateQuestions,
    getUploadedResourcesList,
    loadDocumentFromUrl,
    uploadDocument,
} from '../services/rest.service';
import type { DocumentDto } from '../interfaces/document.interface';
import type { GeneratedQuestion } from '../interfaces/question.interface';
import { useNotifyStore } from '../store/notify/notify.store';
import { openNotificationWithIcon } from '../services/axios.config';
import { NotificationType } from '../services/notifications.enum';
import './dashboard.scss';

const QUESTION_COUNT_OPTIONS = [10, 20, 30] as const;

interface QuestionRow extends GeneratedQuestion {
    no: number;
}

export const Dashboard = () => {
    const notifyApi = useNotifyStore((state) => state.notifyApi);

    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [documentUrl, setDocumentUrl] = useState('');
    const [urlLoading, setUrlLoading] = useState(false);

    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [requestedQuestionCount, setRequestedQuestionCount] = useState<number>(10);
    const [userMessage, setUserMessage] = useState('');

    const [generating, setGenerating] = useState(false);
    const [questions, setQuestions] = useState<QuestionRow[] | null>(null);

    const notify = useCallback(
        (type: (typeof NotificationType)[keyof typeof NotificationType], title: string, desc: string) => {
            openNotificationWithIcon(notifyApi, type, title, desc, `${type}-${Date.now()}`);
        },
        [notifyApi]
    );

    const fetchDocuments = useCallback(() => {
        setDocumentsLoading(true);
        return getUploadedResourcesList()
            .then((response) => {
                setDocuments(response.data);
            })
            .finally(() => setDocumentsLoading(false));
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUpload = (file: File) => {
        setUploading(true);
        uploadDocument(file)
            .then((response) => {
                notify(
                    NotificationType.success,
                    'Document uploaded',
                    `"${response.data.filename}" was uploaded successfully.`
                );
                return fetchDocuments();
            })
            .catch(() => {
                /* global axios interceptor already surfaces the error notification */
            })
            .finally(() => setUploading(false));
        return false;
    };

    const handleLoadUrl = () => {
        if (!documentUrl.trim()) {
            return;
        }
        setUrlLoading(true);
        loadDocumentFromUrl({ url: documentUrl.trim() })
            .then((response) => {
                notify(
                    NotificationType.success,
                    'Document loaded',
                    `"${response.data.filename}" was loaded successfully.`
                );
                setDocumentUrl('');
                return fetchDocuments();
            })
            .catch(() => {
                /* global axios interceptor already surfaces the error notification */
            })
            .finally(() => setUrlLoading(false));
    };

    const handleGenerate = () => {
        if (selectedDocumentId === null) {
            return;
        }
        setGenerating(true);
        setQuestions(null);
        generateQuestions(selectedDocumentId, {
            userMessage,
            requestedQuestionCount,
        })
            .then((response) => {
                setQuestions(response.data.map((q, idx) => ({ ...q, no: idx + 1 })));
            })
            .catch(() => {
                setQuestions([]);
            })
            .finally(() => setGenerating(false));
    };

    const columns: ColumnsType<QuestionRow> = [
        {
            title: '#',
            dataIndex: 'no',
            key: 'no',
            width: 56,
        },
        {
            title: 'Interview Question',
            dataIndex: 'question',
            key: 'question',
        },
        {
            title: 'Short Answer',
            dataIndex: 'answer',
            key: 'answer',
        },
        {
            title: 'Tag',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: GeneratedQuestion['tags']) => (
                <>
                    {tags?.map((tag) => (
                        <Tag key={tag.id}>{tag.tag}</Tag>
                    ))}
                </>
            ),
        },
    ];

    return (
        <div className="ai-question-generator">
            <Typography.Title level={2} className="ai-question-generator__title">
                AI Question Generator
            </Typography.Title>

            <div className="ai-question-generator__section">
                <div className="ai-question-generator__intro">
                    <p>Upload documents:</p>
                    <ul>
                        <li>to generate interview questions</li>
                        <li>to provide resources for classical RAG</li>
                    </ul>
                </div>
                <div className="ai-question-generator__upload-actions">
                    <Button
                        type="primary"
                        icon={<PaperClipOutlined />}
                        loading={uploading}
                        onClick={() => document.getElementById('ai-question-upload-input')?.click()}
                    >
                        UPLOAD DOCUMENT
                    </Button>
                    <input
                        id="ai-question-upload-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) {
                                handleUpload(file);
                            }
                        }}
                    />
                    <div className="ai-question-generator__upload-url">
                        <span>or load from URL:</span>
                        <Input
                            placeholder="https://example.com/doc.pdf"
                            value={documentUrl}
                            onChange={(e) => setDocumentUrl(e.target.value)}
                            onPressEnter={handleLoadUrl}
                        />
                        <Button loading={urlLoading} onClick={handleLoadUrl}>
                            Load
                        </Button>
                    </div>
                </div>
            </div>

            <div className="ai-question-generator__section">
                <div className="ai-question-generator__field">
                    <span className="ai-question-generator__field-label">
                        Please select the Uploaded Resource for which the questions will be generated:
                    </span>
                    <Spin spinning={documentsLoading}>
                        {documents.length === 0 ? (
                            <span className="ai-question-generator__field-hint">
                                No documents uploaded yet. Upload a document above to get started.
                            </span>
                        ) : (
                            <Radio.Group
                                value={selectedDocumentId}
                                onChange={(e: RadioChangeEvent) => setSelectedDocumentId(e.target.value)}
                                className="ai-question-generator__resource-list"
                            >
                                {documents.map((doc) => (
                                    <Radio key={doc.id} value={doc.id}>
                                        {doc.filename}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </Spin>
                </div>

                <div className="ai-question-generator__field">
                    <span className="ai-question-generator__field-label">
                        Please select the number of generated questions:
                    </span>
                    <Radio.Group
                        value={requestedQuestionCount}
                        onChange={(e: RadioChangeEvent) => setRequestedQuestionCount(e.target.value)}
                        optionType="button"
                        options={QUESTION_COUNT_OPTIONS.map((count) => ({ label: count, value: count }))}
                    />
                </div>

                <div className="ai-question-generator__field">
                    <span className="ai-question-generator__field-label">
                        Please provide your short prompt for questions generation:
                    </span>
                    <span className="ai-question-generator__field-hint">(Optional, can be left empty)</span>
                    <Input.TextArea
                        rows={3}
                        placeholder="your prompt / comment..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                    />
                </div>

                <div className="ai-question-generator__generate">
                    <Button
                        type="primary"
                        size="large"
                        disabled={selectedDocumentId === null}
                        loading={generating}
                        onClick={handleGenerate}
                    >
                        GENERATE QUESTIONS
                    </Button>
                </div>
            </div>

            <Divider />

            <div className="ai-question-generator__section ai-question-generator__results">
                <Typography.Title level={3} className="ai-question-generator__results-title">
                    Generated Interview Questions
                </Typography.Title>

                {generating && (
                    <div className="ai-question-generator__progress">
                        <Spin size="large" />
                        <span>Questions generation is in progress ...</span>
                    </div>
                )}

                {!generating && questions !== null && (
                    <Table
                        columns={columns}
                        dataSource={questions}
                        rowKey="no"
                        pagination={{ pageSize: 10 }}
                    />
                )}

                {!generating && questions === null && (
                    <div className="ai-question-generator__empty">
                        No questions generated yet. Select a resource and click "GENERATE QUESTIONS".
                    </div>
                )}
            </div>

            <Divider />

            <div className="ai-question-generator__section ai-question-generator__save">
                <Typography.Title level={4}>Save questions in TI Knowledge Platform?</Typography.Title>
                <Tooltip title="This functionality is under construction">
                    <Button disabled>SAVE</Button>
                </Tooltip>
                <span className="ai-question-generator__save-hint">
                    (This functionality is under construction)
                </span>
            </div>
        </div>
    );
};
