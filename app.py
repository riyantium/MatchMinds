import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

from services.ai_matcher import find_best_match
from services.profile_manager import add_profile, get_profiles


load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "matchminds-dev-secret")

DEMO_PROFILES = [
    {"name": "Aryan Mehta", "skills": "Python, Machine Learning, TensorFlow", "looking_for": "Frontend developer or UI/UX designer", "project_interest": "AI-powered healthcare diagnostics"},
    {"name": "Priya Nair", "skills": "React, Figma, UI/UX Design", "looking_for": "Backend developer with ML experience", "project_interest": "Mental health support app"},
    {"name": "Rohan Desai", "skills": "Node.js, Express, MongoDB", "looking_for": "ML engineer or data scientist", "project_interest": "Fintech and personal finance automation"},
    {"name": "Sneha Kulkarni", "skills": "Data Science, Pandas, Power BI", "looking_for": "Full stack developer", "project_interest": "Climate change data visualization"},
    {"name": "Karan Singh", "skills": "Flutter, Dart, Firebase", "looking_for": "AI/ML developer", "project_interest": "EdTech mobile app for rural students"},
    {"name": "Ananya Sharma", "skills": "NLP, Python, HuggingFace", "looking_for": "Frontend developer and product thinker", "project_interest": "AI writing assistant for students"},
    {"name": "Dev Patel", "skills": "React, TypeScript, Tailwind CSS", "looking_for": "Backend or AI developer", "project_interest": "Developer productivity tools"},
    {"name": "Meera Iyer", "skills": "Cybersecurity, Ethical Hacking, Linux", "looking_for": "Full stack developer", "project_interest": "Privacy-first tools and secure communication"},
    {"name": "Aditya Joshi", "skills": "Django, PostgreSQL, REST APIs", "looking_for": "Frontend developer or ML engineer", "project_interest": "Social impact platform for NGOs"},
    {"name": "Ritika Verma", "skills": "Figma, Adobe XD, User Research", "looking_for": "Developer to bring designs to life", "project_interest": "Accessibility tools for differently abled users"},
    {"name": "Sahil Gupta", "skills": "Computer Vision, OpenCV, Python", "looking_for": "Mobile or web developer", "project_interest": "Smart agriculture and crop monitoring"},
    {"name": "Pooja Reddy", "skills": "Java, Spring Boot, Microservices", "looking_for": "Frontend developer and UI designer", "project_interest": "Healthcare appointment and records management"},
    {"name": "Nikhil Bansal", "skills": "Blockchain, Solidity, Web3.js", "looking_for": "Frontend developer and product designer", "project_interest": "Decentralized identity and credential verification"},
    {"name": "Tanvi Chopra", "skills": "Content strategy, pitching, market research", "looking_for": "Technical developer to build the product", "project_interest": "Sustainable fashion and conscious consumerism"},
    {"name": "Harsh Malhotra", "skills": "AWS, Docker, Kubernetes, DevOps", "looking_for": "Full stack developer with a product idea", "project_interest": "Developer tools and cloud infrastructure"},
    {"name": "Ishita Roy", "skills": "Data Analysis, SQL, Tableau", "looking_for": "ML engineer or backend developer", "project_interest": "Women safety and smart city solutions"},
    {"name": "Vikram Nambiar", "skills": "Embedded Systems, Arduino, IoT", "looking_for": "Software developer for companion app", "project_interest": "Smart home and energy efficiency"},
    {"name": "Lavanya Subramanian", "skills": "Python, Flask, REST APIs", "looking_for": "Frontend developer and UI/UX designer", "project_interest": "Online learning and skill development platform"},
    {"name": "Arnav Kapoor", "skills": "Game Development, Unity, C#", "looking_for": "AI developer or storyteller", "project_interest": "Gamification for education and mental wellness"},
    {"name": "Divya Pillai", "skills": "Biotechnology, research writing, data analysis", "looking_for": "ML engineer or web developer", "project_interest": "AI tools for biomedical research and drug discovery"},
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
