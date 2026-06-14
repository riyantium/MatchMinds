import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

from services.ai_matcher import find_best_match
from services.profile_manager import add_profile, get_profiles


load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "matchminds-dev-secret")

DEMO_PROFILES = [
    {
        "name": "Aman",
        "skills": "React, JavaScript, Firebase",
        "looking_for": "AI Engineer",
        "project_interest": "EdTech",
        "project_idea": "EdTech",
        "is_demo": True,
    },
    {
        "name": "Priya",
        "skills": "UI/UX, Figma, HTML, CSS",
        "looking_for": "Backend Developer",
        "project_interest": "Healthcare",
        "project_idea": "Healthcare",
        "is_demo": True,
    },
    {
        "name": "Arjun",
        "skills": "Python, Machine Learning, Data Science",
        "looking_for": "Frontend Developer",
        "project_interest": "AI Healthcare",
        "project_idea": "AI Healthcare",
        "is_demo": True,
    },
    {
        "name": "Sneha",
        "skills": "FastAPI, Python, SQL",
        "looking_for": "UI/UX Designer",
        "project_interest": "FinTech",
        "project_idea": "FinTech",
        "is_demo": True,
    },
    {
        "name": "Rahul",
        "skills": "Flutter, Dart, Firebase",
        "looking_for": "AI Developer",
        "project_interest": "Agriculture",
        "project_idea": "Agriculture",
        "is_demo": True,
    },
    {
        "name": "Neha",
        "skills": "Node.js, Express, MongoDB",
        "looking_for": "React Developer",
        "project_interest": "Sustainability",
        "project_idea": "Sustainability",
        "is_demo": True,
    },
    {
        "name": "Kabir",
        "skills": "Docker, Kubernetes, AWS, CI/CD",
        "looking_for": "Backend Developer",
        "project_interest": "Cloud Automation",
        "project_idea": "Cloud Automation",
        "is_demo": True,
    },
    {
        "name": "Zoya",
        "skills": "Cybersecurity, Linux, OWASP, Network Security",
        "looking_for": "Full Stack Developer",
        "project_interest": "Digital Safety",
        "project_idea": "Digital Safety",
        "is_demo": True,
    },
    {
        "name": "Ishaan",
        "skills": "Solidity, Ethereum, Smart Contracts, Blockchain",
        "looking_for": "UI/UX Designer",
        "project_interest": "Web3 Social Impact",
        "project_idea": "Web3 Social Impact",
        "is_demo": True,
    },
    {
        "name": "Meera",
        "skills": "Cloud, Azure, Serverless, Terraform",
        "looking_for": "Data Scientist",
        "project_interest": "Climate Tech",
        "project_idea": "Climate Tech",
        "is_demo": True,
    },
]


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/profiles")
def profiles():
    stored_profiles = get_profiles()
    return jsonify(
        {
            "profiles": stored_profiles,
            "count": len(stored_profiles),
        }
    )


@app.post("/submit_profile")
def submit_profile():
    profile_data = request.get_json(silent=True) or {}

    name = str(profile_data.get("name", "")).strip()
    skills = str(profile_data.get("skills", "")).strip()

    if not name or not skills:
        return jsonify({"message": "Name and skills are required."}), 400

    profile_data["name"] = name
    profile_data["skills"] = skills
    stored_profile = add_profile(profile_data)

    return jsonify(
        {
            "message": "Profile submitted successfully.",
            "profile": stored_profile,
        }
    ), 201


@app.post("/find_match")
def find_match():
    request_data = request.get_json(silent=True) or {}
    current_profile = request_data.get("current_profile", request_data)
    all_profiles = get_profiles()
    match_result = find_best_match(current_profile, all_profiles)

    return jsonify(match_result)


@app.post("/load_demo_profiles")
def load_demo_profiles():
    existing_demo_names = {
        profile.get("name")
        for profile in get_profiles()
        if profile.get("is_demo")
    }

    added_profiles = []
    for profile in DEMO_PROFILES:
        if profile["name"] not in existing_demo_names:
            added_profiles.append(add_profile(profile))
            existing_demo_names.add(profile["name"])

    return jsonify(
        {
            "message": "Demo dataset loaded successfully!",
            "added_count": len(added_profiles),
            "demo_profile_count": len(DEMO_PROFILES),
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
