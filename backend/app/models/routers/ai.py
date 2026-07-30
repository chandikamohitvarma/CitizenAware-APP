from fastapi import APIRouter, Depends

from ..utils.dependencies import get_current_user

router = APIRouter()


@router.get("/recommendations")
def ai_recommendations(current_user=Depends(get_current_user)):
    return {
        "recommendations": [
            {"title": "Digital India Initiative 2026", "reason": "Matched your profile and interests."},
            {"title": "Skill India 4.0", "reason": "Good fit for your skill development."},
            {"title": "PM Vishwakarma Yojana 2026", "reason": "Recommended based on your application history."},
        ]
    }
