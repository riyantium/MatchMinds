#  MatchMinds

An AI-powered hackathon teammate matching platform that helps participants find the most compatible teammate based on skills, interests, and project goals.

> Originally prototyped at the **OpenAI Codex Hackathon Pune 2026** , continued and expanded for **OpenAI Build Week 2026**.
---

##  Problem Statement

Finding the right teammate during a hackathon is often time-consuming and random. Many participants struggle to find people with complementary skills and similar interests.

**MatchMinds** solves this by using AI to recommend the best teammates and help teams start building immediately.

---

##  Features

-  Create and delete participant profile
-  Select an existing participant
-  AI-powered teammate recommendation
-  Compatibility score, shared interests and skills analysis
-  Complementary skills identification
-  AI-generated hackathon project idea
-  Creative AI-generated team name
-  Combined team skills overview
-  Quick Demo mode with sample participants
-  Participants can contact each other via email or LinkedIn
-  Allows to download PDF for future references
  
---

##  Tech Stack

- **Backend:** Flask (Python)
- **Frontend:** HTML, CSS, JavaScript
- **AI:** OpenAI API
- **Environment Variables:** python-dotenv
- **Storage:** In-memory Python list (MVP)

---

##  Project Structure

```
MatchMinds/
│
├── app.py
├── .env
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
└── services/
    ├── ai_matcher.py
    └── profile_manager.py
```

---

##  How It Works

1. Create a participant profile or load demo participants.
2. Select a participant.
3. Click **Find My Match**.
4. The AI analyzes:
   - Skills
   - Interests
   - Project goals
   - Complementary abilities
5. The application returns:
   - Best teammate
   - Compatibility score
   - Match explanation
   - Suggested hackathon idea
   - Creative team name
   - Combined skills
   - Contact details
6. Click on delete profile if you wish to delete it
7. Use "Save as PDF" for saving the potential teammates' info

---

## How I Built This with Codex & GPT-5.6

### Development with Codex
I used OpenAI Codex throughout the development of MatchMinds as an AI coding agent. Codex helped me:

- **Scaffold the project structure** - setting up the Flask app, routing, and service layer separation between `ai_matcher.py` and `profile_manager.py`
- **Build the matching logic** - Codex helped implement the fallback rule-based matching system when the API is unavailable
- **Debug issues faster** - particularly the SQLite schema migration when adding the contact column, and fixing the Render deployment configuration
- **Iterate on the frontend** - generating and refining the 3-card match results layout and responsive CSS grid

### Key Decisions I Made
While Codex accelerated the building, the core product decisions were mine:
- Choosing to show **top 3 matches** instead of just 1 - giving users agency
- Adding **persistent SQLite storage** so profiles survive server restarts
- Building a **smart contact button** that detects email vs LinkedIn automatically
- Designing the **demo dataset** with 20 diverse realistic profiles to showcase AI reasoning

### GPT-5.6 Luna in Action
The matching engine uses **GPT-5.6 Luna** - OpenAI's latest cost-efficient model - to:
- Analyze each participant's skills, project interests, and what they're looking for
- Reason about compatibility between profiles holistically, not just keyword matching
- Generate a compatibility score (0–100) with a human-readable explanation
- Suggest a practical hackathon project idea tailored to the matched pair
- Return results as structured JSON for seamless frontend rendering

The combination of Codex for building and GPT-5.6 Luna for matching made it possible to go from idea to deployed product rapidly while maintaining quality.

---

##  Example Workflow

```
Create Profile
        ↓
Store Participant
        ↓
Select Participant
        ↓
Find My Match
        ↓
AI Analysis (OpenAI API)
        ↓
Top 3 Best Teammates + compatibilty score + contact details

```

---

## Live Demo 

https://matchminds.onrender.com/

## Disclaimer

The participant profiles used in the Quick Demo dataset are entirely fictional and created for demonstration purposes only. Any resemblance to real persons, email addresses, or LinkedIn profiles is purely coincidental.

##  Future Improvements

- User authentication and login
- Real-time team chat (WebSockets)
- Resume and GitHub profile import
- LinkedIn OAuth integration
- College/hackathon-specific filtering
- Email notifications when matched
- Advanced recommendation with ML models

---

## Home Page
<img width="1060" height="906" alt="image" src="https://github.com/user-attachments/assets/e1c8dabb-f02e-4395-a386-ec54c33e5d23" />


## Analysis page

<img width="1088" height="717" alt="image" src="https://github.com/user-attachments/assets/c045ecf4-64fc-4b48-943a-f61ecd085c08" />

<img width="1013" height="757" alt="image" src="https://github.com/user-attachments/assets/3c8b5197-6165-4f32-8487-d798012e5479" />


