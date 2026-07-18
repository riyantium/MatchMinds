import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")


def find_best_match(current_profile: dict, all_profiles: list):
    current_profile = current_profile or {}
    all_profiles = all_profiles or []

    if len(all_profiles) < 2:
        return _empty_match(
            "Add at least one more profile before finding a teammate match."
        )

    candidates = [
        profile
        for profile in all_profiles
        if not _is_same_user(current_profile, profile)
    ]

    if not candidates:
        return _empty_match(
            "No other profiles are available yet. Add another participant first."
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _fallback_match(
            current_profile,
            candidates,
            "OpenAI API key is not configured, so a simple skill-based match was used.",
        )

    try:
        return _openai_match(current_profile, candidates, api_key)
    except Exception:
        return _fallback_match(
            current_profile,
            candidates,
            "OpenAI matching is unavailable right now, so a simple skill-based match was used.",
        )


def _openai_match(current_profile, candidates, api_key):
    client = OpenAI(api_key=api_key)
    numbered_candidates = [
        {"candidate_number": index + 1, "profile": candidate}
        for index, candidate in enumerate(candidates)
    ]

    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You match hackathon participants with compatible teammates. "
                    "Return only valid JSON."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Find the best teammate for the current profile.\n\n"
                    f"Current profile:\n{json.dumps(current_profile)}\n\n"
                    f"Candidate profiles:\n{json.dumps(numbered_candidates)}\n\n"
                    "Return JSON with a 'matches' array containing the top 3 best teammates ranked by compatibility. "
                    "Each match should have these fields: "
                    "candidate_number, best_teammate, compatibility_score, "
                    "shared_interests_or_skills, complementary_skills, explanation, "
                    "why_good_match, project_idea, team_name, combined_skills. "
                    "Use a compatibility_score from 0 to 100. "
                    "Keep explanation and why_good_match to one or two short sentences. "
                    "Make project_idea one practical hackathon idea based on both profiles. "
                    "Make team_name short and memorable. "
                    "Make combined_skills a list using skills from both profiles."
                ),
            },
        ],
    )

    content = response.choices[0].message.content or "{}"
    result = json.loads(content)
    return _normalize_ai_results(result, candidates)

def _normalize_ai_results(result, candidates):
    matches = result.get("matches", [])
    normalized = []
    for match in matches[:3]:
        try:
            normalized.append(_normalize_ai_result(match, candidates))
        except Exception:
            continue
    if not normalized:
        raise ValueError("AI response did not include usable matches.")
    return {"matches": normalized}


def _normalize_ai_result(result, candidates):
    candidate_number = result.get("candidate_number")
    best_teammate = None

    try:
        candidate_index = int(candidate_number) - 1
        best_teammate = candidates[candidate_index].copy()
    except (TypeError, ValueError, IndexError):
        if isinstance(result.get("best_teammate"), dict):
            best_teammate = result["best_teammate"].copy()

    if best_teammate is None:
        raise ValueError("AI response did not include a usable teammate.")

    return {
        "best_teammate": best_teammate,
        "compatibility_score": _clamp_score(result.get("compatibility_score", 0)),
        "shared_interests_or_skills": _as_list(
            result.get("shared_interests_or_skills")
        ),
        "complementary_skills": _as_list(result.get("complementary_skills")),
        "explanation": str(result.get("explanation", "")).strip(),
        "why_good_match": str(result.get("why_good_match", "")).strip(),
        "project_idea": str(result.get("project_idea", "")).strip(),
        "team_name": str(result.get("team_name", "")).strip(),
        "combined_skills": _as_list(result.get("combined_skills")),
        "source": "openai",
    }


def _fallback_match(current_profile, candidates, message):
    current_skills = _tokens(current_profile.get("skills", ""))
    current_interests = _tokens(
        current_profile.get("project_idea", "")
        or current_profile.get("domain_interest", "")
        or current_profile.get("interests", "")
    )
    current_needs = _tokens(current_profile.get("looking_for", ""))

    scored_candidates = []
    for candidate in candidates:
        candidate_skills = _tokens(candidate.get("skills", ""))
        candidate_interests = _tokens(
            candidate.get("project_idea", "")
            or candidate.get("domain_interest", "")
            or candidate.get("interests", "")
        )
        candidate_needs = _tokens(candidate.get("looking_for", ""))

        shared = current_skills & candidate_skills
        shared_interests = current_interests & candidate_interests
        complementary = (
            (candidate_skills & current_needs)
            | (current_skills & candidate_needs)
            | (candidate_skills - current_skills)
        )

        score = (len(shared) * 30) + (len(shared_interests) * 20)
        score += min(len(complementary), 3) * 10

        scored_candidates.append(
            {
                "profile": candidate,
                "score": min(score, 100),
                "shared": sorted(shared | shared_interests),
                "complementary": sorted(complementary),
            }
        )

    best = max(scored_candidates, key=lambda item: item["score"])
    best_profile = best["profile"].copy()
    current_name = current_profile.get("name", "This participant")
    teammate_name = best_profile.get("name", "their teammate")
    current_interest = _profile_interest(current_profile)
    teammate_interest = _profile_interest(best_profile)
    combined_skills = _combined_skills(current_profile, best_profile)
    explanation = (
        "This teammate has the strongest overlap with your skills or interests "
        "and brings useful skills that can complement the project."
    )
    project_theme = current_interest or teammate_interest or "hackathon collaboration"

    return {
        "message": message,
        "best_teammate": best_profile,
        "compatibility_score": best["score"],
        "shared_interests_or_skills": best["shared"],
        "complementary_skills": best["complementary"],
        "explanation": explanation,
        "why_good_match": explanation,
        "project_idea": (
            f"Build a {project_theme} prototype that combines "
            f"{current_name}'s strengths with {teammate_name}'s skills."
        ),
        "team_name": _team_name(current_profile, best_profile),
        "combined_skills": combined_skills,
        "source": "fallback",
    }


def _empty_match(message):
    return {
        "message": message,
        "best_teammate": None,
        "compatibility_score": 0,
        "shared_interests_or_skills": [],
        "complementary_skills": [],
        "explanation": "",
        "why_good_match": "",
        "project_idea": "",
        "team_name": "",
        "combined_skills": [],
        "source": "none",
    }


def _is_same_user(current_profile, candidate):
    if current_profile is candidate or current_profile == candidate:
        return True

    current_name = str(current_profile.get("name", "")).strip().lower()
    candidate_name = str(candidate.get("name", "")).strip().lower()
    return bool(current_name and candidate_name and current_name == candidate_name)


def _tokens(value):
    return {
        token.strip().lower()
        for token in re.split(r"[,;/|]+", str(value))
        if token.strip()
    }


def _as_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _profile_interest(profile):
    return (
        str(
            profile.get("project_interest")
            or profile.get("project_idea")
            or profile.get("domain_interest")
            or profile.get("interests")
            or ""
        )
        .strip()
    )


def _skills_list(profile):
    return [
        skill.strip()
        for skill in re.split(r"[,;|]+", str(profile.get("skills", "")))
        if skill.strip()
    ]


def _combined_skills(current_profile, teammate_profile):
    skills = []
    seen = set()

    for skill in _skills_list(current_profile) + _skills_list(teammate_profile):
        normalized = skill.lower()
        if normalized not in seen:
            skills.append(skill)
            seen.add(normalized)

    return skills


def _team_name(current_profile, teammate_profile):
    current_interest = _profile_interest(current_profile)
    teammate_interest = _profile_interest(teammate_profile)
    theme = current_interest or teammate_interest or "Hack"
    keyword = re.split(r"\s+", theme.strip())[0] if theme.strip() else "Hack"
    return f"Team {keyword.title()} Spark"


def _clamp_score(value):
    try:
        return max(0, min(100, int(value)))
    except (TypeError, ValueError):
        return 0
