# NEXORA AI Intelligence & Multi-Provider Architecture

## 1. Provider Independence
NEXORA supports two leading AI providers seamlessly out of the box:
- **Google Gemini API** (`gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-2.5`)
- **xAI Grok API** (`grok-beta`, `grok-2`)
- **Heuristic Deterministic Fallback Engine** (`deterministic-v1`)

### Configuration in `.env`:
```env
# Choose provider: "gemini" or "grok"
AI_PROVIDER=gemini

# Provider keys
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro

GROK_API_KEY=your_grok_api_key_here
GROK_MODEL=grok-beta

AI_TIMEOUT=60
AI_MAX_RETRIES=3
AI_TEMPERATURE=0.1
AI_FEATURES_ENABLED=true
MATCH_THRESHOLD=75
```

The application layer interacts exclusively with `AIOrchestrator` and `BaseAIProvider`. Switching the provider requires **zero code changes** to the business logic.

---

## 2. Logical AI Tasks & Schemas
1. **Document Intelligence & Requirement Extraction**:
   - Parses raw unstructured PDFs, scanned images, and plain text.
   - Categorizes skills strictly into `mandatory_skills` (non-negotiable criteria) vs `preferred_skills` (nice-to-have bonus competencies).
   - Extracts numeric `experience_min`, `experience_max`, `employment_type`, and `work_mode`.
   - Returns structured `JobRequirementExtractionResult` Pydantic model with confidence score.

2. **Developer Profile Understanding**:
   - Parses resumes and biographies.
   - Identifies verified skill evidence, project demonstrated stacks, and specialization.
   - Populates structured `ProfileAnalysisResult`.

3. **Project Relevance Evaluation**:
   - Compares project problem statements and architecture against job requirements.
   - Evaluates demonstrated vs mentioned technologies.
   - Returns numeric `relevance_score` (0-100) and structured rationale.

4. **Grounded Match Explanation Generator**:
   - Translates deterministic 5-pillar scores into human-readable, grounded justifications.
   - Produces dual perspectives: `recruiter_explanation` and `talent_explanation`.

---

## 3. Deterministic Hybrid Matching Engine
Matches are calculated by deterministic Python application logic rather than hallucinated by an LLM:

$$\text{Total Score} = S_{\text{mandatory}} \times 0.40 + S_{\text{preferred}} \times 0.20 + S_{\text{projects}} \times 0.20 + S_{\text{experience}} \times 0.10 + S_{\text{availability}} \times 0.10$$

### Strict Eligibility Gate:
If `strict_eligibility: true` (default on all jobs):
- A candidate who fails any mandatory requirement is marked as **ineligible**.
- An ineligible candidate will **never** receive targeted notifications or high rankings, regardless of high semantic similarity elsewhere.
