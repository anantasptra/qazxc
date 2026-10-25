"""
Database module for Media Pembelajaran Interaktif Siswa SD
Uses SQLite3 with WAL mode for fast, concurrent, and reliable storage.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "learning_media.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Operators Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS operators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nim TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        class_name TEXT NOT NULL DEFAULT 'Kelas 4 SD',
        pin_hash TEXT NOT NULL,
        avatar TEXT DEFAULT 'astronaut',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
    );
    """)

    # 3. Learning Modules / Bab
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 1,
        is_published INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Interactive Slides (Storyline-like slides)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        slide_type TEXT NOT NULL DEFAULT 'standard', -- standard, hotspot, dragdrop, checkpoint, summary
        content TEXT NOT NULL,
        interactive_data TEXT, -- JSON for hotspots, drag-drop items, mini-quiz
        narration_text TEXT,
        image_url TEXT,
        order_index INTEGER DEFAULT 1,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    );
    """)

    # 5. Virtual Experiments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        instruction_steps TEXT NOT NULL, -- JSON list of steps
        hypothesis_question TEXT,
        hypothesis_options TEXT, -- JSON list
        conclusion_prompt TEXT,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 6. Student Experiment Results
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        experiment_id INTEGER NOT NULL,
        hypothesis_answer TEXT,
        notes TEXT,
        conclusion_answer TEXT,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
    );
    """)

    # 7. Educational Games
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        game_type TEXT NOT NULL, -- rapid_quiz, water_cycle_flow, catch_items
        description TEXT,
        instructions TEXT,
        difficulty TEXT DEFAULT 'Sedang',
        time_limit_sec INTEGER DEFAULT 60,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 8. Student Game Scores
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS game_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        stars INTEGER DEFAULT 3,
        played_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );
    """)

    # 9. Question Bank (Pre-test & Post-test)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_type TEXT NOT NULL, -- 'pretest' or 'posttest' or 'both'
        topic TEXT DEFAULT 'Wujud Benda & Siklus Air',
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'multiple_choice', -- multiple_choice, true_false, matching
        image_url TEXT,
        options TEXT NOT NULL, -- JSON list of option strings or objects
        correct_answer TEXT NOT NULL, -- string or JSON
        explanation TEXT,
        points INTEGER DEFAULT 10,
        order_index INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 10. Student Test Attempts & Evaluations (Pre-test & Post-test)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        test_type TEXT NOT NULL, -- 'pretest' or 'posttest'
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        answers_detail TEXT, -- JSON record of questions, selected answers, points
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # 11. Learning Progress per Student
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        completed_slides TEXT DEFAULT '[]', -- JSON list of slide IDs
        is_completed INTEGER DEFAULT 0,
        last_slide_id INTEGER,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, module_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    );
    """)

    # 12. Achievements / Badges Catalog
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL, -- emoji or icon key
        category TEXT DEFAULT 'general'
    );
    """)

    # 13. Student Achievements Earned
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        achievement_code TEXT NOT NULL,
        earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, achievement_code),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # 14. Media Settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS media_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")
