import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request


load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "matchminds-dev-secret")


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/submit_profile")
def submit_profile():
    profile_data = request.get_json(silent=True) or request.form.to_dict()

    # TODO: Validate and store this profile using services/profile_manager.py.
    return jsonify(
        {
            "message": "Profile submission route is ready.",
            "profile": profile_data,
        }
    ), 202


@app.post("/find_match")
def find_match():
    request_data = request.get_json(silent=True) or request.form.to_dict()

    # TODO: Fetch stored profiles and call services/ai_matcher.py.
    return jsonify(
        {
            "message": "Match finding route is ready.",
            "match": None,
            "request": request_data,
        }
    ), 202


if __name__ == "__main__":
    app.run(debug=True)
