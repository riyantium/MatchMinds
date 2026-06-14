#  MatchMinds

An AI-powered hackathon teammate matching platform that helps participants find the most compatible teammate based on skills, interests, and project goals.

---

##  Problem Statement

Finding the right teammate during a hackathon is often time-consuming and random. Many participants struggle to find people with complementary skills and similar interests.

**MatchMinds** solves this by using AI to recommend the best teammate and help teams start building immediately.

---

##  Features

-  Create a new participant profile
-  Select an existing participant
-  AI-powered teammate recommendation
-  Compatibility score
-  Shared interests and skills analysis
-  Complementary skills identification
-  AI-generated hackathon project idea
-  Creative AI-generated team name
-  Combined team skills overview
-  Quick Demo mode with sample participants

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
AI Analysis
        ↓
Best Teammate + Team Starter Pack
```

---

##  Team Starter Pack

In addition to teammate matching, MatchMinds generates:

-  AI Project Idea
-  Team Name
-  Match Explanation
-  Combined Skills Summary

Helping teams start collaborating immediately.

---

##  Future Improvements

- User authentication
- Database integration
- Multi-user support
- Team chat functionality
- Resume import
- LinkedIn/GitHub profile integration
- Advanced recommendation algorithms

---

## Home Page
<img width="1415" height="896" alt="image" src="https://github.com/user-attachments/assets/e925e1ad-cd39-46ed-a365-490d9253cfc8" />

## Analysis page

<img width="1411" height="902" alt="image" src="https://github.com/user-attachments/assets/da5cbb07-3e99-4bf3-8f35-ec3813177a45" />
<img width="1282" height="900" alt="image" src="https://github.com/user-attachments/assets/82f4a7ac-3b86-40ab-9500-1c0753c643d0" />

