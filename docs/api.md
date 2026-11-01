# NEXORA REST & WebSocket API Documentation

All API endpoints are versioned under `/api/v1`.

## Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register/recruiter` | Register employer/recruiter account and company profile |
| `POST` | `/auth/register/talent` | Register talent profile (developer, student, or team) |
| `POST` | `/auth/login` | Authenticate user and return signed JWT token |
| `GET` | `/auth/me` | Fetch active user identity and profile metadata |
| `POST` | `/auth/forgot-password` | Request password reset instructions |

## Recruiter (`/api/v1/recruiter`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/recruiter/dashboard` | Dashboard metrics (active jobs, matches, applications, shortlist) |
| `GET` | `/recruiter/company` | Retrieve company profile |
| `PUT` | `/recruiter/company` | Update company description, website, size, and social links |
| `GET` | `/recruiter/jobs` | List recruiter's jobs with application & match counts |
| `POST` | `/recruiter/jobs` | Post new job opportunity (draft or published) |
| `GET` | `/recruiter/jobs/{id}` | Detailed job information and skill requirements |
| `POST` | `/recruiter/jobs/{id}/publish` | Publish job, trigger matching engine & targeted alerts |
| `POST` | `/recruiter/jobs/{id}/pause` | Pause active job |
| `POST` | `/recruiter/jobs/{id}/close` | Close job posting |
| `GET` | `/recruiter/jobs/{id}/matches` | List pre-ranked candidate matches with score breakdowns |
| `GET` | `/recruiter/applications` | List applications across all published roles |
| `PUT` | `/recruiter/applications/{id}` | Update pipeline stage (Under Review, Shortlist, Interview, Offer) |
| `POST` | `/recruiter/invitations` | Dispatch direct recruitment invitation to candidate |

## Talent & Teams (`/api/v1/talent`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/talent/dashboard` | Talent dashboard metrics and profile completion % |
| `GET` | `/talent/profile` | Retrieve developer profile |
| `PUT` | `/talent/profile` | Update bio, headline, specialization, and availability |
| `GET` | `/talent/skills` | List categorized skills and proficiency levels |
| `POST` | `/talent/skills` | Add new skill with experience years and evidence |
| `DELETE` | `/talent/skills/{id}` | Remove skill from profile |
| `GET` | `/talent/projects` | List portfolio projects |
| `POST` | `/talent/projects` | Add project with architecture, contribution, and repo URLs |
| `DELETE` | `/talent/projects/{id}` | Delete project |
| `GET` | `/talent/opportunities` | AI-matched opportunities inbox with score breakdown |
| `POST` | `/talent/opportunities/{id}/apply` | 1-Click apply to matched role |
| `GET` | `/talent/applications` | Active application status tracking |
| `GET` | `/talent/invitations` | Direct recruiter invitations |
| `PUT` | `/talent/invitations/{id}/respond` | Accept or decline invitation |
| `GET` | `/talent/teams` | Manage development teams |
| `POST` | `/talent/teams` | Create new team entity |

## AI Operations (`/api/v1/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/extract-requirements` | Extract structured requirements from text |
| `POST` | `/ai/analyze-profile` | Analyze developer background and technical strengths |
| `POST` | `/ai/normalize-skills` | Normalize terms against canonical ontology |
| `GET` | `/ai/test-connection` | Live round-trip connectivity test to Gemini / Grok |
| `GET` | `/ai/status` | Real-time AI request count, success rate, and latency |
| `POST` | `/ai/configure` | Admin endpoint to dynamically update provider settings |

## Document Intelligence (`/api/v1/documents`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/documents/upload` | Upload PDF or image (PNG/JPG), extract text & structure |
| `GET` | `/documents/{id}` | Document processing status and extraction result |

## Notifications (`/api/v1/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications` | List user in-app notifications |
| `PUT` | `/notifications/{id}/read` | Mark notification as read |
| `PUT` | `/notifications/read-all` | Mark all notifications as read |
| `GET` | `/notifications/preferences` | Get user notification delivery preferences |
| `PUT` | `/notifications/preferences` | Update min match score and channel toggles |

## Real-Time WebSocket
- `ws://localhost:8000/ws/{user_id}`: Bi-directional event stream for real-time match alerts and application pipeline advances.
