Please scan this repository and do the following:

- generate `npm install <lib1> <lib2>`  to install all absent libraries.
- generate all code.

Maybe it makes sense to start from:
- generate layout and components according the following design:

```text
┌───────────────────────────────────────────────────────┐
│ TI Knowledge Platform                   User           │
├───────────────────────────────────────────────────────┤
│                 AI Question Generator                 │
│                                                       │
│ Upload documents:                                     │
│ • to generate interview questions                     │
│ • to provide resources for classical RAG              │
│             ┌────────────────────────┐                │
│             │   📎 UPLOAD DOCUMENT   │                │
│             └────────────────────────┘                │
├───────────────────────────────────────────────────────┤
│ Please select the Uploaded Resource for which the questions
│  will be generated :                                  │
│ • java.pdf                                            │
│ • spring-boot.pdf                                     │
│ • aws.pdf                                             │
│ Please select the number of generated question: 10, 20,30
│ Please provide your shor prompt for questions generation:
(Optional can be left empty)
│ ┌─────────────────────────────┐                       │
│ │  your prompt / comment...   │                       │     
│ └─────────────────────────────┘                       │
│             ┌────────────────────────┐                │
│             │   GENERATE QUESTIONS   │                │
│             └────────────────────────┘                │
├───────────────────────────────────────────────────────┤
│ while questions are being generated 
 here is should be default view such as:
 "questions generation is in progress ..."

Generated Interview Questions                           │
│                                                       │
│ ┌────┬──────────────────┬──────────────┬────────────┐ │
│ │ #  │ Interview        │ Short Answer │ Tag        │ │
│ ├────┼──────────────────┼──────────────┼────────────┤ │
│ │ 1  │ What is ...      │ ...          │ Java       │ │
│ │ 2  │ Explain ...      │ ...          │ Spring     │ │
│ └────┴──────────────────┴──────────────┴────────────┘ │
│                                                       │
│                  < 1 2 3 >                            │
├───────────────────────────────────────────────────────┤
│        Save questions in TI Knowledge Platform?       │
│                                                       │
│   [ SAVE ] (This functionality is under construction) │
├───────────────────────────────────────────────────────┤
│ Footer                                                │
└───────────────────────────────────────────────────────┘
```

- generate content of `src/services/rest.service.ts` according to `below http requests`
- link actions in component with provided APIs in `src/services/rest.service.ts`
- generate interfaces for responses and payloads.

Please find below the examples of APIs spec:


| Action | Route or REST API | Request Payload / Response |
|---|---|---|
| Documents (unauthenticated)->List Documents | GET `<server address>/rest/v1/document-agent/documents` | [{"id": 1, "filename": "annual-report.pdf"}, {"id": 2, "filename": "quarterly-summary.docx"}] — HTTP 200 OK (`ResponseEntity.ok(...)`). |
| Documents->Generate Questions for Document | POST `<server address>/rest/v1/document-agent/documents/{id}/question-generation` (example: `/rest/v1/document-agent/documents/1/question-generation`) | Path variable `id: number`. Req: {"userMessage": "Generate questions about revenue trends", "requestedQuestionCount": 5} · Resp: [{"question": "What was the total revenue in 2023?", "answer": "Revenue in 2023 was...", "level": {"id": 1, "code": "EASY"}, "tags": [{"id": 1, "tag": "finance"}], "resources": ["annual-report.pdf:1:3"]}] — HTTP 200 OK (`ResponseEntity.ok(...)`). |


| Action | Route or REST API | Request Payload / Response |
|---|---|---|
| Upload->Upload Document File (unauthenticated) | POST `<server address>/rest/v1/documents` | Req: multipart/form-data, `file: MultipartFile` · Resp: `{"documentId": 1, "filename": "report.pdf", "status": "UPLOADED"}` (HTTP 200) |
| Upload->Load Document From URL (unauthenticated) | POST `<server address>/rest/v1/load-url` | Req: `{"url": "https://example.com/doc.pdf"}` · Resp: `{"documentId": 1, "filename": "doc.pdf", "status": "UPLOADED"}` (HTTP 200) |


Please find below the examples of APIs calling in http format:
*http requests* :
```http request

### Upload a document file — starts async ETL (embeddings + text sections)
POST http://localhost:8080/rest/v1/document/documents
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="file"; filename="quarterly-report.pdf"
Content-Type: application/pdf

< ./quarterly-report.pdf
--WebAppBoundary--

###
### List uploaded documents
GET http://localhost:8080/rest/v1/document-agent/documents
Accept: application/json

###

### Generate questions from a document
POST http://localhost:8080/rest/v1/document-agent/documents/101/question-generation
Content-Type: application/json
Accept: application/json

{
  "userMessage": "Generate questions about the compliance obligations described in this document.",
  "requestedQuestionCount": 3
}

###

```

- and finally generate README.md with last section about "how to run this microservice
  as standalone service" and taking into account the following:

- `src/services/rest.service.ts`
- and to have possibility to run it locally as one standalone microservice to check functionality
  so, please provide set http files for different cases.

As a result, we will have:
- No errors when `npm run dev` command is executed.
- the refactored `README.md` file:
1) structured sections such as: overview, Tech Stack & Key Technologies, Installation, Prerequisites, Available Scripts, Detailed Flow description, Run locally 
2) + "how to run locally and test functionality" - it should be complete guide like:
     -what standalone docker compose should be run - see the list in `/Users/Marina_Pimenova/ti-2026/ti-gateway-api/docker`
