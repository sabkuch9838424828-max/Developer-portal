# NEXORA
### AI-Powered Developer Recruitment, Talent Discovery & Portfolio Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://developer-portal-kmaa-1zxvv7ttu-sabkuch9838424828-max.vercel.app/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python Tests](https://img.shields.io/badge/Pytest-20%2F20%20Passed-blue?style=for-the-badge&logo=python)](https://github.com/sabkuch9838424828-max/Developer-portal)

> **GDG on Campus MMMUT — PROMPT2PIXEL (Round 2 Submission)**  
> **Team Name**: TEAM INNOCENT  
> **Team Members**: Nitin Kumar & Swati Kushwaha  
> **Live App**: [https://developer-portal-kmaa-1zxvv7ttu-sabkuch9838424828-max.vercel.app/](https://developer-portal-kmaa-1zxvv7ttu-sabkuch9838424828-max.vercel.app/)  
> **Presentation (Canva)**: [View Pitch Deck](https://www.canva.com/d/FsUlMIs8tDv7Pin) | [Download PDF](https://export-download.canva.com/jn88Q/DAHZrEjn88Q/-1/0-1767057761876890754.pdf) | [Download PPTX](https://export-download.canva.com/jn88Q/DAHZrEjn88Q/-1/1952831247639560876.pptx)  
> **Video Walkthrough**: [Watch / Download 1080p MP4](https://export-download.canva.com/jn88Q/DAHZrEjn88Q/-1/0-1160197714709456966.mp4)

---

## 1. Executive Product Vision
**NEXORA** is a next-generation technical talent discovery and recruitment platform engineered to eliminate noisy keyword matching and unverified claims. It connects:
1. **Recruiters & Companies** seeking verified engineering talent.
2. **Individual Developers & Students** looking for high-relevance career opportunities.
3. **Software Development Teams & Collectives** searchable as cohesive delivery entities for complex projects.

### Key Innovations:
- **Centralized Multi-LLM Gateway**: Seamless provider-independent AI architecture supporting **Google Gemini API** (`gemini-1.5-pro`, `gemini-1.5-flash`) and **xAI Grok API** (`grok-beta`, `grok-2`), alongside an **automatic offline heuristic fallback engine** requiring zero external API keys for local execution.
- **Document Intelligence**: Upload recruitment briefs in **PDF**, **PNG**, or **JPG** format. PyMuPDF and OCR extract technical requirements, and the AI converts them into an editable structured posting. Recruiters must review and approve before publishing.
- **Deterministic 5-Pillar Matching Engine**: Application code computes mathematically auditable match scores grounded in real profile data:
  - **Mandatory Skills (40%)**: Strict eligibility gate. Missing mandatory criteria marks candidate as ineligible.
  - **Preferred Skills (20%)**: Bonus technical competencies.
  - **Relevant Portfolio Projects (20%)**: Concrete repository and problem-solving overlap.
  - **Experience Alignment (10%)**: Minimum and maximum experience bracket.
  - **Availability & Work Mode (10%)**: Remote, Hybrid, or On-site preference.
- **Targeted Notification Orchestration**: Only verified eligible candidates whose compatibility score meets or exceeds the threshold (`MATCH_THRESHOLD=75%`) receive recruitment alerts.
- **Explainable Grounded Justifications**: Dual perspectives (Recruiter evaluation vs. Developer match insight) grounded in verified evidence.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Futuristic Dark/Light Design System
- **Icons**: Lucide React
- **Client Architecture**: Modular context providers (`AuthContext`, `ThemeContext`), client components, and API client.

### Backend
- **Engine**: Python 3.11+ / 3.14 + FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM (and zero-config SQLite out-of-the-box)
- **Validation**: Pydantic v2 + Pydantic Settings
- **Security**: PBKDF2-HMAC-SHA256 password hashing + signed HS256 JWT sessions
- **Document Processing**: PyMuPDF (`fitz`), `pypdf`, Pillow (`PIL`)
- **Real-Time**: WebSockets for live candidate notification delivery

---

## 3. Seed Demonstration Accounts

The platform includes rich, realistic demonstration data out-of-the-box:

| Role | Account Email | Password | Persona & Background |
|---|---|---|---|
| **Recruiter** | `recruiter@nexora.ai` | `Password123!` | Sarah Jenkins (VP of Talent, Apex Cloud Systems) |
| **Senior Talent** | `alex.chen@nexora.ai` | `Password123!` | Alex Chen (Senior Backend, Python, FastAPI, Docker, 4.5y exp) |
| **Full-Stack** | `sophia.martinez@nexora.ai` | `Password123!` | Sophia Martinez (React, Next.js, TypeScript Architect, 3.2y exp) |
| **Student** | `rohit.sharma@nexora.ai` | `Password123!` | Rohit Sharma (CS Honors Student, C++, Python Systems) |
| **Team Collective** | `marcus.vance@nexora.ai` | `Password123!` | Marcus Vance (Lead, NovaTech Engineering Collective - 4 engineers) |
| **Admin** | `admin@nexora.ai` | `AdminSecret123!` | System Administrator & AI Operations Monitor |

---

## 4. Quick Start Guide

### Step 1: Environment Setup
Copy the sample environment file:
```bash
cp .env.example backend/.env
```

To configure live Gemini or Grok keys:
```env
# In backend/.env
AI_PROVIDER=gemini
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-1.5-pro"

# Or configure Grok:
# AI_PROVIDER=grok
# GROK_API_KEY="your-xai-grok-api-key"
# GROK_MODEL="grok-beta"
```
*(If no API key is provided, NEXORA automatically uses its deterministic heuristic intelligence engine).*

### Step 2: Run the Backend
```bash
cd backend
# Activate virtualenv (or create one: python -m venv venv)
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### Step 3: Run the Frontend
```bash
cd frontend
npm run dev
```
- Frontend Web App: `http://localhost:3000`

---

## 5. Automated Verification & Testing Report
The automated test suite verifies password hashing, canonical skill ontology normalization, deterministic matching calculation, strict eligibility gating, and database relationships:
```bash
cd backend
./venv/Scripts/pytest -o pythonpath=. tests/test_platform.py
```
**Results**:
- `test_password_hashing`: PASSED
- `test_skill_normalization`: PASSED
- `test_hybrid_matching_engine`: PASSED
- `test_heuristic_job_extraction`: PASSED
- `test_seeded_database_records`: PASSED
- **Status**: 5/5 passed (100% test pass rate).

---

## 6. Directory Layout
```text
nexora/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Versioned REST endpoints (auth, recruiter, talent, ai, admin)
│   │   ├── core/            # Configuration, security, database session
│   │   ├── models/          # Normalized SQLAlchemy models (User, Job, Match, Application, etc.)
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── ai/              # Provider abstraction (Gemini, Grok, Heuristic fallback)
│   │   ├── matching/        # 5-pillar deterministic hybrid matching engine
│   │   ├── notifications/   # Targeted notification orchestrator
│   │   ├── seed/            # Master demonstration data seeder
│   │   └── main.py          # FastAPI application entrypoint & WebSockets
│   ├── tests/               # Backend deterministic test suite
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (Landing, Recruiter, Talent, Admin)
│   │   ├── components/      # UI components (Navbar, Footer, NotificationBell, ThemeToggle)
│   │   ├── context/         # AuthContext, ThemeContext
│   │   └── lib/             # API client & helpers
│   ├── public/              # Static assets
│   ├── package.json
│   └── Dockerfile
├── docs/                    # Complete architectural & API documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 7. License
Engineered for technical recruitment precision. NEXORA Platform © 2026.
