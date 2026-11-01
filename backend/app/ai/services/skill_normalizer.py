from typing import Dict, List, Optional, Tuple
from app.ai.schemas.ai_schemas import SkillNormalizationResult

# Centralized Skill Ontology and Synonym Aliases
CANONICAL_SKILL_ONTOLOGY: Dict[str, Dict] = {
    "JavaScript": {
        "aliases": ["js", "es6", "vanilla js", "ecmascript"],
        "category": "Frontend",
        "related": ["TypeScript", "Node.js", "React"]
    },
    "TypeScript": {
        "aliases": ["ts", "typescript 5"],
        "category": "Frontend",
        "related": ["JavaScript", "React", "Next.js", "Node.js"]
    },
    "React": {
        "aliases": ["reactjs", "react.js", "react 18", "react 19"],
        "category": "Frontend",
        "related": ["Next.js", "JavaScript", "TypeScript", "Tailwind CSS"]
    },
    "Next.js": {
        "aliases": ["nextjs", "next.js 14", "next.js 15"],
        "category": "Frontend",
        "related": ["React", "TypeScript", "Tailwind CSS"]
    },
    "Python": {
        "aliases": ["python 3", "py", "python3"],
        "category": "Backend",
        "related": ["FastAPI", "Django", "Flask", "PyTorch"]
    },
    "FastAPI": {
        "aliases": ["fast api", "fastapi framework"],
        "category": "Backend",
        "related": ["Python", "REST API", "Pydantic", "SQLAlchemy"]
    },
    "Node.js": {
        "aliases": ["nodejs", "node"],
        "category": "Backend",
        "related": ["Express", "JavaScript", "TypeScript"]
    },
    "Express": {
        "aliases": ["express.js", "expressjs"],
        "category": "Backend",
        "related": ["Node.js", "REST API"]
    },
    "PostgreSQL": {
        "aliases": ["postgres", "psql", "postgresql db"],
        "category": "Database",
        "related": ["SQL", "MySQL", "Redis", "SQLAlchemy"]
    },
    "MySQL": {
        "aliases": ["mysql 8", "mariadb"],
        "category": "Database",
        "related": ["SQL", "PostgreSQL"]
    },
    "MongoDB": {
        "aliases": ["mongo", "mongodb atlas"],
        "category": "Database",
        "related": ["NoSQL", "Node.js"]
    },
    "Redis": {
        "aliases": ["redis cache", "redis key-value"],
        "category": "Database",
        "related": ["PostgreSQL", "Celery"]
    },
    "Docker": {
        "aliases": ["docker containers", "docker compose"],
        "category": "Tools",
        "related": ["Kubernetes", "Linux", "CI/CD"]
    },
    "Kubernetes": {
        "aliases": ["k8s", "kubectl"],
        "category": "Tools",
        "related": ["Docker", "Cloud", "DevOps"]
    },
    "Git": {
        "aliases": ["git version control", "github", "gitlab"],
        "category": "Tools",
        "related": ["CI/CD", "Linux"]
    },
    "Linux": {
        "aliases": ["ubuntu", "debian", "bash", "linux shell"],
        "category": "Tools",
        "related": ["Docker", "Git"]
    },
    "C++": {
        "aliases": ["cpp", "cplusplus", "c/c++"],
        "category": "Embedded",
        "related": ["C", "Embedded C", "Rust"]
    },
    "Embedded C": {
        "aliases": ["embedded", "arduino", "esp32", "microcontrollers"],
        "category": "Embedded",
        "related": ["C++", "C"]
    },
    "Tailwind CSS": {
        "aliases": ["tailwind", "tailwindcss"],
        "category": "Frontend",
        "related": ["CSS", "React", "Next.js"]
    },
    "REST API": {
        "aliases": ["rest", "restful api", "restful apis"],
        "category": "Backend",
        "related": ["FastAPI", "Node.js", "HTTP"]
    },
    "PyTorch": {
        "aliases": ["torch", "pytorch dl"],
        "category": "AI",
        "related": ["Python", "TensorFlow", "Machine Learning"]
    },
    "Machine Learning": {
        "aliases": ["ml", "scikit-learn", "deep learning"],
        "category": "AI",
        "related": ["Python", "PyTorch"]
    }
}

class SkillNormalizerService:
    """Service for deterministic skill normalization and ontology relationships."""

    # Build inverse alias mapping for O(1) lookup
    _alias_map: Dict[str, str] = {}
    for canonical, details in CANONICAL_SKILL_ONTOLOGY.items():
        _alias_map[canonical.lower()] = canonical
        for alias in details["aliases"]:
            _alias_map[alias.lower()] = canonical

    @classmethod
    def normalize_skill(cls, skill_name: str) -> SkillNormalizationResult:
        cleaned = skill_name.strip()
        cleaned_lower = cleaned.lower()

        if cleaned_lower in cls._alias_map:
            canonical = cls._alias_map[cleaned_lower]
            details = CANONICAL_SKILL_ONTOLOGY[canonical]
            return SkillNormalizationResult(
                original_term=cleaned,
                canonical_name=canonical,
                category=details["category"],
                is_known=True,
                related_skills=details.get("related", [])
            )
        
        # Title case default for unrecognized skills
        return SkillNormalizationResult(
            original_term=cleaned,
            canonical_name=cleaned.title(),
            category="Other",
            is_known=False,
            related_skills=[]
        )

    @classmethod
    def are_related(cls, skill_a: str, skill_b: str) -> bool:
        norm_a = cls.normalize_skill(skill_a).canonical_name
        norm_b = cls.normalize_skill(skill_b).canonical_name
        
        if norm_a == norm_b:
            return True
            
        details_a = CANONICAL_SKILL_ONTOLOGY.get(norm_a, {})
        if norm_b in details_a.get("related", []):
            return True

        details_b = CANONICAL_SKILL_ONTOLOGY.get(norm_b, {})
        if norm_a in details_b.get("related", []):
            return True

        return False
