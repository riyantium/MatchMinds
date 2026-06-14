import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

from services.ai_matcher import find_best_match
from services.profile_manager import add_profile, get_profiles


load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "matchminds-dev-secret")


@app.get("/")
def index():
    return render_template("index.html")


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


if __name__ == "__main__":
    app.run(debug=True)
