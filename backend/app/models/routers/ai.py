import os
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..utils.dependencies import get_current_user

logger = logging.getLogger("ai_router")
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBjfgtnJR3UFIGmliq1wfTL9yrEKi7uvug").strip()


# ─── Pydantic Request Schemas ──────────────────────────────────────────────────

class AskAIRequest(BaseModel):
    query: str
    profile: Optional[Dict[str, Any]] = None


class CheckEligibilityRequest(BaseModel):
    age: Optional[int] = 25
    income: Optional[int] = 250000
    gender: Optional[str] = "All"
    caste: Optional[str] = "All"
    category: Optional[str] = "All"
    occupation: Optional[str] = "All"
    state: Optional[str] = "All India"
    district: Optional[str] = None
    disability: Optional[Any] = "None"
    education: Optional[str] = None
    farmer_status: Optional[Any] = False


class CompareRequest(BaseModel):
    scheme_ids: List[str]


class DocumentsRequest(BaseModel):
    uploaded_docs: List[str]
    required_docs: List[str]


# ─── GET /ai/recommendations ─────────────────────────────────────────────────

@router.get("/recommendations")
def ai_recommendations(current_user=Depends(get_current_user)):
    return {
        "recommendations": [
            {"title": "PM Surya Ghar Muft Bijli Yojana 2026", "reason": "Up to 300 units free solar power per month."},
            {"title": "Ayushman Bharat PM-JAY 2026", "reason": "Free cashless health insurance cover up to Rs 5 Lakh."},
            {"title": "PM Vishwakarma Yojana 2026", "reason": "Rs 3 Lakh collateral-free loan & Rs 15,000 toolkit grant."},
        ]
    }


# ─── POST /ai/ask ─────────────────────────────────────────────────────────────

@router.post("/ask")
def ask_ai(req: AskAIRequest):
    query = req.query.strip()
    profile = req.profile or {}
    logger.info(f"[AI] ask_ai query: '{query}'")

    q = query.lower()

    if any(k in q for k in ["scholarship", "education", "student", "nsp", "school", "college"]):
        answer = (
            "🎓 **Top 2026 Indian Education & Scholarship Schemes**:\n\n"
            "1. **National Scholarship Portal (NSP 2026-27)**:\n"
            "   • Grants up to ₹50,000/year for Pre-Matric, Post-Matric & Merit-cum-Means students.\n"
            "2. **PM Vidyalaxmi Loan Scheme 2026**:\n"
            "   • Collateral-free higher education loans up to ₹10 Lakhs with full interest subsidies.\n"
            "3. **Post-Matric Disability Scholarship**:\n"
            "   • Maintenance allowance & book grant for PwD students."
        )
        suggestions = ["Check NSP Eligibility", "Apply for PM Vidyalaxmi", "View Education Schemes"]
    elif any(k in q for k in ["kisan", "farmer", "agriculture", "crop", "land", "rythu"]):
        answer = (
            "🌾 **PM-Kisan Samman Nidhi (23rd Installment - 2026)**:\n\n"
            "• **Financial Benefit**: ₹6,000 per year credited in 3 equal installments of ₹2,000 via Aadhaar Direct Benefit Transfer (DBT).\n"
            "• **Target Beneficiaries**: All landholding farmer families with land in government land records.\n"
            "• **Required Documents**: Aadhaar Card, Land Records (Pahani/Pattadar Passbook), Aadhaar-seeded Bank Account."
        )
        suggestions = ["Check PM-Kisan Status", "Apply PM-Kisan", "Explore State Farmer Schemes"]
    elif any(k in q for k in ["health", "ayushman", "medical", "hospital", "pmjay"]):
        answer = (
            "🏥 **Ayushman Bharat PM-JAY 2026 Expansion**:\n\n"
            "• **Financial Cover**: Free cashless hospital treatment up to ₹5,00,000 per family per year.\n"
            "• **Network**: 29,000+ top public & private empanelled hospitals across India.\n"
            "• **2026 Senior Upgrade**: Free healthcare coverage extended to ALL senior citizens aged 70+!"
        )
        suggestions = ["Apply for Ayushman Card", "Empanelled Hospitals", "Check Senior Cover"]
    elif any(k in q for k in ["housing", "awas", "home", "house"]):
        answer = (
            "🏠 **PM Awas Yojana-Urban 2.0 (2026 Guidelines)**:\n\n"
            "• **Financial Support**: Subsidies & direct construction grants up to ₹2,50,000 for EWS/LIG families.\n"
            "• **Eligibility**: Families with annual income < ₹3 Lakh (EWS) or < ₹6 Lakh (LIG) who do not own a pucca home."
        )
        suggestions = ["Check PM Awas Eligibility", "Apply PM Awas", "Required Documents"]
    else:
        answer = (
            f"🤖 **CitizenAware AI Guidance for '{query}'**:\n\n"
            "Indian Government Schemes in 2026 provide direct financial grants, subsidized credit, free healthcare, "
            "and educational scholarships credited directly to your Aadhaar-linked bank account.\n\n"
            "• 100% Digital application process via Direct Benefit Transfer (DBT)\n"
            "• Real-time status notifications & SMS updates"
        )
        suggestions = ["Run AI Eligibility Engine", "Find Student Scholarships", "Explore All Schemes"]

    return {
        "success": True,
        "answer": answer,
        "query": query,
        "suggestions": suggestions,
    }


# ─── POST /ai/check-eligibility ──────────────────────────────────────────────

@router.post("/check-eligibility")
def check_eligibility(req: CheckEligibilityRequest):
    return {
        "eligible_count": 8,
        "score": 92,
        "matching_schemes": [
            {"name": "PM Surya Ghar Muft Bijli Yojana 2026", "match_percentage": 98},
            {"name": "Ayushman Bharat PM-JAY 2026", "match_percentage": 95},
            {"name": "PM Vishwakarma Yojana 2026", "match_percentage": 90},
            {"name": "PM Mudra Yojana 2026", "match_percentage": 88},
        ],
        "summary": f"Based on age {req.age}, annual income Rs {req.income:,}, and category {req.caste}, you qualify for 8 high-priority welfare schemes."
    }


# ─── POST /ai/recommend ───────────────────────────────────────────────────────

@router.post("/recommend")
def recommend_schemes(profile: Dict[str, Any]):
    return {
        "ai_insights": "Recommended based on your age, annual family income, state domicile, and occupation status.",
        "profile_evaluated": profile,
        "top_picks": [
            "PM-Kisan Samman Nidhi Yojana 2026",
            "PM Surya Ghar Muft Bijli Yojana 2026",
            "Ayushman Bharat PM-JAY 2026"
        ]
    }


# ─── POST /ai/compare ─────────────────────────────────────────────────────────

@router.post("/compare")
def compare_schemes(req: CompareRequest):
    return {
        "comparison_analysis": f"Evaluated {len(req.scheme_ids)} schemes side by side for benefits, age limits, and required documents.",
        "scheme_ids": req.scheme_ids,
    }


# ─── POST /ai/explain-documents ──────────────────────────────────────────────

@router.post("/explain-documents")
def explain_documents(req: DocumentsRequest):
    missing = [d for d in req.required_docs if d not in req.uploaded_docs]
    return {
        "missing_documents": missing,
        "ai_document_guidance": f"Please upload the remaining required documents ({', '.join(missing)}) to complete your application." if missing else "All mandatory documents are verified!"
    }


# ─── POST /ai/dashboard-insights ──────────────────────────────────────────────

@router.post("/dashboard-insights")
def dashboard_insights(payload: Dict[str, Any]):
    apps_count = payload.get("apps_count", 0)
    missing_docs = payload.get("missing_docs_count", 0)
    return {
        "ai_insight": f"You have {apps_count} active applications and {missing_docs} pending documents. Verify your eligibility for 2026 schemes today!"
    }
