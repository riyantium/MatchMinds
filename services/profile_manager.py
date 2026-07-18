import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "profiles.db")

def _get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def _init_db():
    with _get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                skills TEXT NOT NULL,
                looking_for TEXT NOT NULL,
                project_interest TEXT,
                contact TEXT
            )
        """)
        conn.commit()

_init_db()

def add_profile(profile: dict):
    with _get_connection() as conn:
        conn.execute(
            "INSERT INTO profiles (name, skills, looking_for, project_interest, contact) VALUES (?, ?, ?, ?, ?)",
            (profile.get("name"), profile.get("skills"), profile.get("looking_for"), profile.get("project_interest", ""), profile.get("contact", ""))
        )
        conn.commit()
    return profile.copy()

def get_profiles():
    with _get_connection() as conn:
        rows = conn.execute("SELECT * FROM profiles").fetchall()
    return [dict(row) for row in rows]

def clear_profiles():
    with _get_connection() as conn:
        conn.execute("DELETE FROM profiles")
        conn.commit()

def delete_profile(name: str):
    with _get_connection() as conn:
        conn.execute("DELETE FROM profiles WHERE name = ?", (name,))
        conn.commit()