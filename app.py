"""
Main FastAPI Application for Media Pembelajaran Interaktif Siswa SD.
Serves REST API and Web Single Page Applications for both Students and Operators.
"""

import os
import sys
import json
import csv
import io

# Ensure UTF-8 stdout encoding on Windows
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from database import get_db_connection, init_db
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_operator, require_student
)
from models import (
    StudentLoginRequest, OperatorLoginRequest,
    StudentCreateRequest, StudentUpdateRequest, BatchStudentRequest,
    AvatarUpdateRequest, SlideProgressRequest, ExperimentSubmitRequest,
    GameScoreSubmitRequest, TestSubmitRequest,
    QuestionCreateRequest, QuestionUpdateRequest,
    ModuleCreateRequest, SlideCreateRequest, SettingsUpdateRequest
)
from seed_data import seed_all

# Initialize DB & Seed on startup
init_db()
seed_all()

app = FastAPI(
    title="Media Pembelajaran Interaktif SD",
    description="Sistem Media Pembelajaran Interaktif Siswa SD & Dashboard Operator",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "css"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "js"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "audio"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)

# -------------------------------------------------------------
# PUBLIC SETTINGS & INFO
# -------------------------------------------------------------
@app.get("/api/settings")
def get_settings():
    conn = get_db_connection()
    rows = conn.execute("SELECT key, value FROM media_settings").fetchall()
    conn.close()
    settings = {r['key']: r['value'] for r in rows}
    return {"status": "success", "settings": settings}

# -------------------------------------------------------------
# AUTHENTICATION
# -------------------------------------------------------------
@app.post("/api/student/login")
def student_login(req: StudentLoginRequest):
    """
    Login specifically for registered elementary students.
    Validates Nama, NIM, and PIN issued by Operator.
    """
    nim_clean = req.nim.strip()
    name_clean = req.full_name.strip()
    
    conn = get_db_connection()
    # Case-insensitive comparison for full name and exact match for NIM
    student = conn.execute(
        "SELECT * FROM students WHERE UPPER(nim) = UPPER(?)", (nim_clean,)
    ).fetchone()
    
    if not student:
        conn.close()
        raise HTTPException(
            status_code=401,
            detail="NIM tidak terdaftar. Pastikan operator atau gurumu sudah mendaftarkan akunmu."
        )
        
    if not student['is_active']:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="Akun siswa ini sedang dinonaktifkan oleh operator. Hubungi gurumu."
        )
        
    # Check name similarity (at least matching first word or clean lower)
    db_name = student['full_name'].strip().lower()
    provided_name = name_clean.lower()
    
    if db_name != provided_name and db_name.split()[0] != provided_name.split()[0]:
        conn.close()
        raise HTTPException(
            status_code=401,
            detail=f"Nama tidak cocok dengan NIM {student['nim']}. Periksa ejaan namamu kembali."
        )
        
    # Verify PIN
    if not verify_password(student['pin_hash'], req.pin.strip()):
        conn.close()
        raise HTTPException(
            status_code=401,
            detail="PIN atau kata sandi salah. Minta bantuan gurumu jika lupa PIN."
        )
        
    conn.execute(
        "UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
        (student['id'],)
    )
    conn.commit()
    conn.close()
    
    token = create_access_token({
        "id": student['id'],
        "nim": student['nim'],
        "full_name": student['full_name'],
        "class_name": student['class_name'],
        "avatar": student['avatar'],
        "role": "student"
    })
    
    return {
        "status": "success",
        "message": f"Selamat datang kembali, {student['full_name']}!",
        "token": token,
        "student": {
            "id": student['id'],
            "nim": student['nim'],
            "full_name": student['full_name'],
            "class_name": student['class_name'],
            "avatar": student['avatar']
        }
    }

@app.post("/api/operator/login")
def operator_login(req: OperatorLoginRequest):
    """
    Login for operator/teacher dashboard.
    """
    conn = get_db_connection()
    operator = conn.execute(
        "SELECT * FROM operators WHERE username = ?", (req.username.strip(),)
    ).fetchone()
    conn.close()
    
    if not operator or not verify_password(operator['password_hash'], req.password):
        raise HTTPException(
            status_code=401,
            detail="Username atau kata sandi operator salah."
        )
        
    token = create_access_token({
        "id": operator['id'],
        "username": operator['username'],
        "full_name": operator['full_name'],
        "role": "operator"
    })
    
    return {
        "status": "success",
        "message": f"Selamat datang, {operator['full_name']}",
        "token": token,
        "operator": {
            "id": operator['id'],
            "username": operator['username'],
            "full_name": operator['full_name']
        }
    }

# -------------------------------------------------------------
# STUDENT PORTAL ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/student/profile")
def get_student_profile(user: dict = Depends(require_student)):
    """Returns detailed student profile, dynamic greeting, learning stats & badges."""
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM students WHERE id = ?", (user['id'],)).fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Data siswa tidak ditemukan.")

    # 1. Learning progress
    progress_rows = conn.execute(
        "SELECT * FROM learning_progress WHERE student_id = ?", (user['id'],)
    ).fetchall()
    
    total_slides_count = conn.execute("SELECT COUNT(*) as cnt FROM slides").fetchone()['cnt']
    completed_slides_set = set()
    for pr in progress_rows:
        try:
            completed_slides_set.update(json.loads(pr['completed_slides']))
        except Exception:
            pass
            
    progress_percent = 0
    if total_slides_count > 0:
        progress_percent = min(100, int((len(completed_slides_set) / total_slides_count) * 100))

    # 2. Evaluations (Pre-test & Post-test)
    pretest = conn.execute(
        "SELECT score, completed_at FROM student_evaluations WHERE student_id = ? AND test_type = 'pretest' ORDER BY id DESC LIMIT 1",
        (user['id'],)
    ).fetchone()
    
    posttest = conn.execute(
        "SELECT score, completed_at FROM student_evaluations WHERE student_id = ? AND test_type = 'posttest' ORDER BY id DESC LIMIT 1",
        (user['id'],)
    ).fetchone()

    # 3. Game high scores
    game_scores = conn.execute(
        """SELECT g.code, g.title, MAX(s.score) as high_score, MAX(s.stars) as max_stars
           FROM games g
           LEFT JOIN game_scores s ON g.id = s.game_id AND s.student_id = ?
           WHERE g.is_active = 1
           GROUP BY g.id""",
        (user['id'],)
    ).fetchall()

    # 4. Badges / Achievements
    all_achievements = conn.execute("SELECT * FROM achievements ORDER BY id ASC").fetchall()
    earned_codes = set([
        r['achievement_code'] for r in conn.execute(
            "SELECT achievement_code FROM student_achievements WHERE student_id = ?", (user['id'],)
        ).fetchall()
    ])
    
    badges_list = []
    for a in all_achievements:
        badges_list.append({
            "code": a['code'],
            "title": a['title'],
            "description": a['description'],
            "icon": a['icon'],
            "category": a['category'],
            "is_unlocked": a['code'] in earned_codes
        })

    conn.close()

    return {
        "status": "success",
        "student": {
            "id": student['id'],
            "nim": student['nim'],
            "full_name": student['full_name'],
            "class_name": student['class_name'],
            "avatar": student['avatar'],
            "created_at": student['created_at'],
            "last_login": student['last_login']
        },
        "stats": {
            "progress_percent": progress_percent,
            "completed_slides": len(completed_slides_set),
            "total_slides": total_slides_count,
            "pretest_score": pretest['score'] if pretest else None,
            "posttest_score": posttest['score'] if posttest else None,
            "games": [dict(g) for g in game_scores]
        },
        "badges": badges_list
    }

@app.put("/api/student/avatar")
def update_student_avatar(req: AvatarUpdateRequest, user: dict = Depends(require_student)):
    """Allows student to choose their fun cartoon avatar."""
    valid_avatars = [
        'astronaut', 'boy_glasses', 'girl_hijab', 'boy_sporty',
        'girl_smile', 'scientist_kid', 'cat_pilot', 'robot_buddy'
    ]
    if req.avatar not in valid_avatars:
        raise HTTPException(status_code=400, detail="Avatar tidak valid.")
        
    conn = get_db_connection()
    conn.execute("UPDATE students SET avatar = ? WHERE id = ?", (req.avatar, user['id']))
    conn.commit()
    conn.close()
    return {"status": "success", "avatar": req.avatar}

@app.get("/api/student/module")
def get_student_module(user: dict = Depends(require_student)):
    """Returns the published learning module with all interactive slides."""
    conn = get_db_connection()
    module = conn.execute(
        "SELECT * FROM modules WHERE is_published = 1 ORDER BY order_index ASC LIMIT 1"
    ).fetchone()
    
    if not module:
        conn.close()
        raise HTTPException(status_code=404, detail="Belum ada materi yang dipublikasikan.")

    slides = conn.execute(
        "SELECT * FROM slides WHERE module_id = ? ORDER BY order_index ASC", (module['id'],)
    ).fetchall()

    # Progress record for this student
    progress = conn.execute(
        "SELECT * FROM learning_progress WHERE student_id = ? AND module_id = ?",
        (user['id'], module['id'])
    ).fetchone()

    completed_slide_ids = []
    last_slide_id = None
    if progress:
        try:
            completed_slide_ids = json.loads(progress['completed_slides'])
        except Exception:
            completed_slide_ids = []
        last_slide_id = progress['last_slide_id']

    slides_list = []
    for s in slides:
        interactive = None
        if s['interactive_data']:
            try:
                interactive = json.loads(s['interactive_data'])
            except Exception:
                interactive = None
                
        slides_list.append({
            "id": s['id'],
            "module_id": s['module_id'],
            "title": s['title'],
            "slide_type": s['slide_type'],
            "content": s['content'],
            "interactive_data": interactive,
            "narration_text": s['narration_text'],
            "image_url": s['image_url'],
            "order_index": s['order_index'],
            "is_completed": s['id'] in completed_slide_ids
        })

    conn.close()
    return {
        "status": "success",
        "module": dict(module),
        "slides": slides_list,
        "completed_count": len(completed_slide_ids),
        "total_slides": len(slides_list),
        "last_slide_id": last_slide_id or (slides_list[0]['id'] if slides_list else None)
    }

@app.post("/api/student/slide-progress")
def record_slide_progress(req: SlideProgressRequest, user: dict = Depends(require_student)):
    """Marks a slide as completed, updates overall progress, and checks badge unlocks."""
    conn = get_db_connection()
    progress = conn.execute(
        "SELECT * FROM learning_progress WHERE student_id = ? AND module_id = ?",
        (user['id'], req.module_id)
    ).fetchone()

    completed_ids = set()
    if progress:
        try:
            completed_ids = set(json.loads(progress['completed_slides']))
        except Exception:
            completed_ids = set()

    completed_ids.add(req.slide_id)
    
    total_slides = conn.execute(
        "SELECT COUNT(*) as cnt FROM slides WHERE module_id = ?", (req.module_id,)
    ).fetchone()['cnt']
    
    is_module_completed = 1 if len(completed_ids) >= total_slides else 0

    if progress:
        conn.execute("""
        UPDATE learning_progress 
        SET completed_slides = ?, is_completed = ?, last_slide_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (json.dumps(list(completed_ids)), is_module_completed, req.slide_id, progress['id']))
    else:
        conn.execute("""
        INSERT INTO learning_progress (student_id, module_id, completed_slides, is_completed, last_slide_id)
        VALUES (?, ?, ?, ?, ?)
        """, (user['id'], req.module_id, json.dumps(list(completed_ids)), is_module_completed, req.slide_id))

    unlocked_badge = None
    if is_module_completed:
        # Award 'matter_master' achievement
        res = conn.execute(
            "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'matter_master')",
            (user['id'],)
        )
        if res.rowcount > 0:
            unlocked_badge = {
                "title": "Pakar Wujud Benda!",
                "icon": "📖",
                "desc": "Kamu berhasil mempelajari seluruh slide materi dengan cemerlang!"
            }

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "completed_count": len(completed_ids),
        "total_slides": total_slides,
        "is_completed": bool(is_module_completed),
        "unlocked_badge": unlocked_badge
    }

@app.get("/api/student/experiments")
def get_student_experiments(user: dict = Depends(require_student)):
    """Returns active experiments and student's prior notes/results."""
    conn = get_db_connection()
    experiments = conn.execute("SELECT * FROM experiments WHERE is_active = 1").fetchall()
    
    res = []
    for exp in experiments:
        # Check student prior result
        prev = conn.execute(
            "SELECT * FROM experiment_results WHERE student_id = ? AND experiment_id = ? ORDER BY id DESC LIMIT 1",
            (user['id'], exp['id'])
        ).fetchone()
        
        steps = []
        try:
            steps = json.loads(exp['instruction_steps'])
        except Exception:
            steps = []
            
        options = []
        if exp['hypothesis_options']:
            try:
                options = json.loads(exp['hypothesis_options'])
            except Exception:
                options = []
                
        res.append({
            "id": exp['id'],
            "code": exp['code'],
            "title": exp['title'],
            "description": exp['description'],
            "steps": steps,
            "hypothesis_question": exp['hypothesis_question'],
            "hypothesis_options": options,
            "conclusion_prompt": exp['conclusion_prompt'],
            "student_result": dict(prev) if prev else None
        })
        
    conn.close()
    return {"status": "success", "experiments": res}

@app.post("/api/student/experiments/submit")
def submit_experiment_result(req: ExperimentSubmitRequest, user: dict = Depends(require_student)):
    """Saves student laboratory notes & awards 'lab_scientist' achievement."""
    conn = get_db_connection()
    conn.execute("""
    INSERT INTO experiment_results (student_id, experiment_id, hypothesis_answer, notes, conclusion_answer)
    VALUES (?, ?, ?, ?, ?)
    """, (user['id'], req.experiment_id, req.hypothesis_answer, req.notes, req.conclusion_answer))

    # Award 'lab_scientist' achievement
    res = conn.execute(
        "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'lab_scientist')",
        (user['id'],)
    )
    unlocked_badge = None
    if res.rowcount > 0:
        unlocked_badge = {
            "title": "Saintis Laboratorium!",
            "icon": "🔬",
            "desc": "Hebat! Kamu telah meneliti perubahan wujud air di laboratorium virtual."
        }

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": "Hasil eksperimen berhasil dicatat di jurnal belajarmu!",
        "unlocked_badge": unlocked_badge
    }

@app.get("/api/student/games")
def get_student_games(user: dict = Depends(require_student)):
    """Returns games list with high scores."""
    conn = get_db_connection()
    games = conn.execute("SELECT * FROM games WHERE is_active = 1").fetchall()
    
    result = []
    for g in games:
        high = conn.execute(
            "SELECT MAX(score) as max_score, MAX(stars) as max_stars FROM game_scores WHERE student_id = ? AND game_id = ?",
            (user['id'], g['id'])
        ).fetchone()
        
        result.append({
            "id": g['id'],
            "code": g['code'],
            "title": g['title'],
            "game_type": g['game_type'],
            "description": g['description'],
            "instructions": g['instructions'],
            "difficulty": g['difficulty'],
            "time_limit_sec": g['time_limit_sec'],
            "high_score": high['max_score'] or 0,
            "stars": high['max_stars'] or 0
        })
    conn.close()
    return {"status": "success", "games": result}

@app.post("/api/student/games/score")
def submit_game_score(req: GameScoreSubmitRequest, user: dict = Depends(require_student)):
    """Records game score to database and awards 'game_champion' if score >= 80."""
    conn = get_db_connection()
    game = conn.execute("SELECT id FROM games WHERE code = ?", (req.game_code,)).fetchone()
    if not game:
        conn.close()
        raise HTTPException(status_code=404, detail="Game tidak ditemukan.")
        
    conn.execute("""
    INSERT INTO game_scores (student_id, game_id, score, stars)
    VALUES (?, ?, ?, ?)
    """, (user['id'], game['id'], req.score, req.stars))

    unlocked_badge = None
    if req.score >= 80:
        res = conn.execute(
            "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'game_champion')",
            (user['id'],)
        )
        if res.rowcount > 0:
            unlocked_badge = {
                "title": "Bintang Permainan!",
                "icon": "🎮",
                "desc": "Luar biasa! Kamu meraih skor tinggi dalam permainan sains edukasi!"
            }

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "score": req.score,
        "stars": req.stars,
        "unlocked_badge": unlocked_badge
    }

@app.get("/api/student/test/{test_type}")
def get_student_test(test_type: str, user: dict = Depends(require_student)):
    """
    Returns questions for pretest or posttest.
    IMPORTANT: Does NOT reveal correct answers or explanations to the student beforehand!
    """
    if test_type not in ['pretest', 'posttest']:
        raise HTTPException(status_code=400, detail="Tipe pengujian tidak valid.")

    conn = get_db_connection()
    questions = conn.execute("""
    SELECT id, test_type, topic, question_text, question_type, image_url, options, points, order_index
    FROM questions
    WHERE (test_type = ? OR test_type = 'both') AND is_active = 1
    ORDER BY order_index ASC
    """, (test_type,)).fetchall()

    # Prior attempt
    prior = conn.execute("""
    SELECT score, total_questions, correct_count, completed_at
    FROM student_evaluations
    WHERE student_id = ? AND test_type = ?
    ORDER BY id DESC LIMIT 1
    """, (user['id'], test_type)).fetchone()

    res_q = []
    for q in questions:
        opts = []
        try:
            opts = json.loads(q['options'])
        except Exception:
            opts = []
        res_q.append({
            "id": q['id'],
            "topic": q['topic'],
            "question_text": q['question_text'],
            "question_type": q['question_type'],
            "image_url": q['image_url'],
            "options": opts,
            "points": q['points'],
            "order_index": q['order_index']
        })

    conn.close()
    return {
        "status": "success",
        "test_type": test_type,
        "questions": res_q,
        "total_questions": len(res_q),
        "prior_attempt": dict(prior) if prior else None
    }

@app.post("/api/student/test/submit")
def submit_student_test(req: TestSubmitRequest, user: dict = Depends(require_student)):
    """
    CRITICAL: Evaluates test answers 100% on the server side to prevent cheating/tampering.
    Calculates final score, records attempt, returns comprehensive explanations,
    and shows pre-test vs post-test score comparisons!
    """
    if req.test_type not in ['pretest', 'posttest']:
        raise HTTPException(status_code=400, detail="Tipe pengujian tidak valid.")

    conn = get_db_connection()
    questions = conn.execute("""
    SELECT id, question_text, options, correct_answer, explanation, points
    FROM questions
    WHERE (test_type = ? OR test_type = 'both') AND is_active = 1
    ORDER BY order_index ASC
    """, (req.test_type,)).fetchall()

    if not questions:
        conn.close()
        raise HTTPException(status_code=400, detail="Tidak ada soal aktif untuk pengujian ini.")

    total_possible_points = sum(q['points'] for q in questions)
    earned_points = 0
    correct_count = 0
    details = []

    for q in questions:
        qid_str = str(q['id'])
        student_choice = req.answers.get(qid_str, "").strip().upper()
        # Answer might be just 'A' or 'B'
        correct_key = q['correct_answer'].strip().upper()
        is_correct = False
        
        # Check matching (either single letter 'C' == 'C' or text contains)
        if student_choice and (student_choice == correct_key or student_choice.startswith(correct_key)):
            is_correct = True
            earned_points += q['points']
            correct_count += 1

        opts = []
        try:
            opts = json.loads(q['options'])
        except Exception:
            opts = []

        details.append({
            "question_id": q['id'],
            "question_text": q['question_text'],
            "options": opts,
            "student_choice": student_choice,
            "correct_answer": correct_key,
            "is_correct": is_correct,
            "explanation": q['explanation'],
            "points_earned": q['points'] if is_correct else 0
        })

    # Normalized score out of 100
    final_score = round((earned_points / total_possible_points) * 100, 1) if total_possible_points > 0 else 0

    # Save to database
    conn.execute("""
    INSERT INTO student_evaluations (student_id, test_type, score, total_questions, correct_count, answers_detail)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user['id'], req.test_type, final_score, len(questions), correct_count, json.dumps(details)
    ))

    # Badge unlocks
    unlocked_badge = None
    if req.test_type == 'pretest':
        res = conn.execute(
            "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'pretest_champ')",
            (user['id'],)
        )
        if res.rowcount > 0:
            unlocked_badge = {
                "title": "Pemberani Awal!",
                "icon": "🎯",
                "desc": "Hebat! Kamu telah menuntaskan pengujian awal (pre-test)!"
            }
    elif req.test_type == 'posttest':
        if final_score >= 70:
            res = conn.execute(
                "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'posttest_star')",
                (user['id'],)
            )
            if res.rowcount > 0:
                unlocked_badge = {
                    "title": "Juara Evaluasi!",
                    "icon": "🏆",
                    "desc": "Luar biasa! Kamu meraih nilai evaluasi di atas 70!"
                }

    # Fetch pretest score if this is posttest to show comparison
    comparison = None
    if req.test_type == 'posttest':
        pre = conn.execute(
            "SELECT score FROM student_evaluations WHERE student_id = ? AND test_type = 'pretest' ORDER BY id DESC LIMIT 1",
            (user['id'],)
        ).fetchone()
        if pre:
            delta = round(final_score - pre['score'], 1)
            comparison = {
                "pretest_score": pre['score'],
                "posttest_score": final_score,
                "delta": delta,
                "is_improved": delta >= 0
            }

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "score": final_score,
        "correct_count": correct_count,
        "total_questions": len(questions),
        "details": details,
        "comparison": comparison,
        "unlocked_badge": unlocked_badge
    }

@app.post("/api/student/guide-complete")
def complete_guide(user: dict = Depends(require_student)):
    """Awards 'first_step' achievement for reading guide."""
    conn = get_db_connection()
    res = conn.execute(
        "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'first_step')",
        (user['id'],)
    )
    unlocked = None
    if res.rowcount > 0:
        unlocked = {
            "title": "Langkah Pertama!",
            "icon": "🌟",
            "desc": "Selamat! Kamu telah membaca panduan cara belajar."
        }
    conn.commit()
    conn.close()
    return {"status": "success", "unlocked_badge": unlocked}

@app.post("/api/student/conclusion-complete")
def complete_conclusion(user: dict = Depends(require_student)):
    """Checks overall completion and awards 'completionist' if everything done."""
    conn = get_db_connection()
    
    # Check if student completed module, lab, game, pretest, posttest
    has_pretest = conn.execute(
        "SELECT id FROM student_evaluations WHERE student_id = ? AND test_type = 'pretest'", (user['id'],)
    ).fetchone()
    has_posttest = conn.execute(
        "SELECT id FROM student_evaluations WHERE student_id = ? AND test_type = 'posttest'", (user['id'],)
    ).fetchone()
    has_lab = conn.execute(
        "SELECT id FROM experiment_results WHERE student_id = ?", (user['id'],)
    ).fetchone()
    has_game = conn.execute(
        "SELECT id FROM game_scores WHERE student_id = ?", (user['id'],)
    ).fetchone()

    unlocked = None
    if has_pretest and has_posttest and has_lab and has_game:
        res = conn.execute(
            "INSERT OR IGNORE INTO student_achievements (student_id, achievement_code) VALUES (?, 'completionist')",
            (user['id'],)
        )
        if res.rowcount > 0:
            unlocked = {
                "title": "Master Sains Cilik!",
                "icon": "👑",
                "desc": "Selamat luar biasa! Kamu telah menuntaskan seluruh 8 menu petualangan sains!"
            }

    conn.commit()
    conn.close()
    return {"status": "success", "unlocked_badge": unlocked}

# -------------------------------------------------------------
# OPERATOR / TEACHER DASHBOARD ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/operator/me")
def get_operator_info(user: dict = Depends(require_operator)):
    conn = get_db_connection()
    op = conn.execute("SELECT id, username, full_name, created_at FROM operators WHERE id = ?", (user['id'],)).fetchone()
    conn.close()
    return {"status": "success", "operator": dict(op)}

# A. Student Management
@app.get("/api/operator/students")
def list_students(
    search: Optional[str] = None,
    class_name: Optional[str] = None,
    user: dict = Depends(require_operator)
):
    conn = get_db_connection()
    query = "SELECT id, nim, full_name, class_name, avatar, is_active, created_at, last_login FROM students WHERE 1=1"
    params = []
    
    if search:
        query += " AND (full_name LIKE ? OR nim LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if class_name:
        query += " AND class_name = ?"
        params.append(class_name)
        
    query += " ORDER BY id DESC"
    students = conn.execute(query, params).fetchall()

    # Get distinct classes for filter dropdown
    classes = [r['class_name'] for r in conn.execute("SELECT DISTINCT class_name FROM students").fetchall()]
    conn.close()

    return {
        "status": "success",
        "students": [dict(s) for s in students],
        "classes": classes
    }

@app.post("/api/operator/students")
def create_student(req: StudentCreateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    # Check unique NIM
    existing = conn.execute("SELECT id FROM students WHERE nim = ?", (req.nim.strip(),)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Siswa dengan NIM {req.nim} sudah terdaftar.")

    conn.execute("""
    INSERT INTO students (nim, full_name, class_name, pin_hash, avatar, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        req.nim.strip(),
        req.full_name.strip(),
        req.class_name.strip(),
        hash_password(req.pin.strip()),
        req.avatar,
        req.is_active
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Siswa {req.full_name} berhasil didaftarkan!"}

@app.put("/api/operator/students/{student_id}")
def update_student(student_id: int, req: StudentUpdateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    student = conn.execute("SELECT id FROM students WHERE id = ?", (student_id,)).fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan.")

    query = "UPDATE students SET full_name = ?, class_name = ?"
    params = [req.full_name.strip(), req.class_name.strip()]

    if req.pin:
        query += ", pin_hash = ?"
        params.append(hash_password(req.pin.strip()))
    if req.avatar:
        query += ", avatar = ?"
        params.append(req.avatar)
    if req.is_active is not None:
        query += ", is_active = ?"
        params.append(req.is_active)

    query += " WHERE id = ?"
    params.append(student_id)

    conn.execute(query, params)
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Data siswa berhasil diperbarui!"}

@app.delete("/api/operator/students/{student_id}")
def delete_student(student_id: int, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Akun siswa berhasil dihapus."}

@app.post("/api/operator/students/batch")
def batch_generate_students(req: BatchStudentRequest, user: dict = Depends(require_operator)):
    """Quickly generates N student accounts with sequential NIMs."""
    if req.count < 1 or req.count > 100:
        raise HTTPException(status_code=400, detail="Jumlah siswa harus antara 1 sampai 100.")

    conn = get_db_connection()
    created_count = 0
    hashed_pin = hash_password(req.default_pin)

    # Find highest existing number
    for i in range(1, req.count + 1):
        nim = f"{req.prefix}{datetime_num()}{i:03d}"
        name = f"Siswa {req.class_name} #{i}"
        try:
            conn.execute("""
            INSERT INTO students (nim, full_name, class_name, pin_hash, avatar, is_active)
            VALUES (?, ?, ?, ?, 'astronaut', 1)
            """, (nim, name, req.class_name, hashed_pin))
            created_count += 1
        except Exception:
            pass

    conn.commit()
    conn.close()
    return {"status": "success", "message": f"{created_count} akun siswa berhasil dibuat otomatis."}

def datetime_num():
    from datetime import datetime
    return datetime.now().strftime("%y%m")

@app.get("/api/operator/students/export-csv")
def export_students_csv(user: dict = Depends(require_operator)):
    conn = get_db_connection()
    students = conn.execute("SELECT id, nim, full_name, class_name, is_active, created_at, last_login FROM students ORDER BY id ASC").fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "NIM", "Nama Lengkap", "Kelas", "Status Aktif", "Dibuat Pada", "Login Terakhir"])
    for s in students:
        writer.writerow([
            s['id'], s['nim'], s['full_name'], s['class_name'],
            "Aktif" if s['is_active'] else "Nonaktif",
            s['created_at'], s['last_login'] or "-"
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=daftar_siswa_sd.csv"}
    )

@app.post("/api/operator/students/import-csv")
async def import_students_csv(file: UploadFile = File(...), user: dict = Depends(require_operator)):
    contents = await file.read()
    text = contents.decode('utf-8-sig', errors='replace')
    reader = csv.reader(io.StringIO(text))
    
    header = next(reader, None)
    conn = get_db_connection()
    imported_count = 0
    default_hash = hash_password("1234")

    for row in reader:
        if len(row) >= 2:
            nim = row[0].strip()
            name = row[1].strip()
            class_name = row[2].strip() if len(row) >= 3 and row[2].strip() else "Kelas 4 SD"
            pin = row[3].strip() if len(row) >= 4 and row[3].strip() else None
            pin_hash = hash_password(pin) if pin else default_hash
            
            try:
                conn.execute("""
                INSERT OR REPLACE INTO students (nim, full_name, class_name, pin_hash, avatar, is_active)
                VALUES (?, ?, ?, ?, 'astronaut', 1)
                """, (nim, name, class_name, pin_hash))
                imported_count += 1
            except Exception:
                pass

    conn.commit()
    conn.close()
    return {"status": "success", "message": f"{imported_count} siswa berhasil diimpor dari CSV."}

# B. Module & Slide Management
@app.get("/api/operator/modules")
def operator_list_modules(user: dict = Depends(require_operator)):
    conn = get_db_connection()
    modules = conn.execute("""
    SELECT m.*, COUNT(s.id) as slide_count
    FROM modules m
    LEFT JOIN slides s ON m.id = s.module_id
    GROUP BY m.id
    ORDER BY m.order_index ASC
    """).fetchall()
    conn.close()
    return {"status": "success", "modules": [dict(m) for m in modules]}

@app.post("/api/operator/modules")
def operator_create_module(req: ModuleCreateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("""
    INSERT INTO modules (code, title, description, order_index, is_published)
    VALUES (?, ?, ?, ?, ?)
    """, (req.code, req.title, req.description, req.order_index, req.is_published))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Bab/Materi berhasil ditambahkan!"}

@app.put("/api/operator/modules/{module_id}")
def operator_update_module(module_id: int, req: ModuleCreateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("""
    UPDATE modules SET code = ?, title = ?, description = ?, order_index = ?, is_published = ?
    WHERE id = ?
    """, (req.code, req.title, req.description, req.order_index, req.is_published, module_id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Bab/Materi berhasil diperbarui!"}

@app.delete("/api/operator/modules/{module_id}")
def operator_delete_module(module_id: int, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("DELETE FROM modules WHERE id = ?", (module_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Bab/Materi dan seluruh slidenya berhasil dihapus."}

@app.get("/api/operator/slides/{module_id}")
def operator_list_slides(module_id: int, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    slides = conn.execute(
        "SELECT * FROM slides WHERE module_id = ? ORDER BY order_index ASC", (module_id,)
    ).fetchall()
    conn.close()
    return {"status": "success", "slides": [dict(s) for s in slides]}

@app.post("/api/operator/slides")
def operator_create_slide(req: SlideCreateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("""
    INSERT INTO slides (module_id, title, slide_type, content, interactive_data, narration_text, image_url, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.module_id, req.title, req.slide_type, req.content,
        req.interactive_data, req.narration_text, req.image_url, req.order_index
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Slide interaktif berhasil ditambahkan!"}

@app.put("/api/operator/slides/{slide_id}")
def operator_update_slide(slide_id: int, req: SlideCreateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("""
    UPDATE slides SET title = ?, slide_type = ?, content = ?, interactive_data = ?, narration_text = ?, image_url = ?, order_index = ?
    WHERE id = ?
    """, (
        req.title, req.slide_type, req.content,
        req.interactive_data, req.narration_text, req.image_url, req.order_index, slide_id
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Slide berhasil diperbarui!"}

@app.delete("/api/operator/slides/{slide_id}")
def operator_delete_slide(slide_id: int, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("DELETE FROM slides WHERE id = ?", (slide_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Slide berhasil dihapus."}

# C. Question Bank Management
@app.get("/api/operator/questions")
def operator_list_questions(
    test_type: Optional[str] = None,
    user: dict = Depends(require_operator)
):
    conn = get_db_connection()
    query = "SELECT * FROM questions WHERE 1=1"
    params = []
    if test_type:
        query += " AND (test_type = ? OR test_type = 'both')"
        params.append(test_type)
    query += " ORDER BY order_index ASC, id ASC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    questions = []
    for r in rows:
        opts = []
        try:
            opts = json.loads(r['options'])
        except Exception:
            opts = []
        q_dict = dict(r)
        q_dict['options'] = opts
        questions.append(q_dict)
        
    return {"status": "success", "questions": questions}

@app.post("/api/operator/questions")
def operator_create_question(req: QuestionCreateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("""
    INSERT INTO questions (test_type, topic, question_text, question_type, image_url, options, correct_answer, explanation, points, order_index, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.test_type, req.topic, req.question_text, req.question_type,
        req.image_url, json.dumps(req.options), req.correct_answer.strip().upper(),
        req.explanation, req.points, req.order_index, req.is_active
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Soal evaluasi berhasil ditambahkan!"}

@app.put("/api/operator/questions/{question_id}")
def operator_update_question(question_id: int, req: QuestionUpdateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("""
    UPDATE questions SET test_type = ?, topic = ?, question_text = ?, question_type = ?, image_url = ?, options = ?, correct_answer = ?, explanation = ?, points = ?, order_index = ?, is_active = ?
    WHERE id = ?
    """, (
        req.test_type, req.topic, req.question_text, req.question_type,
        req.image_url, json.dumps(req.options), req.correct_answer.strip().upper(),
        req.explanation, req.points, req.order_index, req.is_active, question_id
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Soal evaluasi berhasil diperbarui!"}

@app.delete("/api/operator/questions/{question_id}")
def operator_delete_question(question_id: int, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    conn.execute("DELETE FROM questions WHERE id = ?", (question_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Soal berhasil dihapus dari bank soal."}

# D. Learning Analytics & Class Reports
@app.get("/api/operator/analytics")
def operator_get_analytics(user: dict = Depends(require_operator)):
    conn = get_db_connection()
    students = conn.execute("SELECT id, nim, full_name, class_name FROM students WHERE is_active = 1 ORDER BY nim ASC").fetchall()
    total_slides = conn.execute("SELECT COUNT(*) as cnt FROM slides").fetchone()['cnt']
    
    student_reports = []
    pretest_scores = []
    posttest_scores = []

    for s in students:
        sid = s['id']
        
        # Pre-test
        pre = conn.execute(
            "SELECT score FROM student_evaluations WHERE student_id = ? AND test_type = 'pretest' ORDER BY id DESC LIMIT 1",
            (sid,)
        ).fetchone()
        
        # Post-test
        post = conn.execute(
            "SELECT score FROM student_evaluations WHERE student_id = ? AND test_type = 'posttest' ORDER BY id DESC LIMIT 1",
            (sid,)
        ).fetchone()

        pre_val = pre['score'] if pre else None
        post_val = post['score'] if post else None
        
        if pre_val is not None:
            pretest_scores.append(pre_val)
        if post_val is not None:
            posttest_scores.append(post_val)

        # Progress
        progress_rows = conn.execute(
            "SELECT completed_slides FROM learning_progress WHERE student_id = ?", (sid,)
        ).fetchall()
        completed_set = set()
        for pr in progress_rows:
            try:
                completed_set.update(json.loads(pr['completed_slides']))
            except Exception:
                pass
        progress_pct = round((len(completed_set) / total_slides * 100), 1) if total_slides > 0 else 0

        # Games high score
        game_high = conn.execute(
            "SELECT MAX(score) as mscore FROM game_scores WHERE student_id = ?", (sid,)
        ).fetchone()['mscore'] or 0

        # Lab completed
        lab_done = conn.execute(
            "SELECT COUNT(*) as cnt FROM experiment_results WHERE student_id = ?", (sid,)
        ).fetchone()['cnt'] > 0

        # Delta improvement
        delta = None
        if pre_val is not None and post_val is not None:
            delta = round(post_val - pre_val, 1)

        student_reports.append({
            "id": s['id'],
            "nim": s['nim'],
            "full_name": s['full_name'],
            "class_name": s['class_name'],
            "pretest": pre_val,
            "posttest": post_val,
            "delta": delta,
            "progress_percent": progress_pct,
            "game_score": game_high,
            "lab_completed": lab_done
        })

    avg_pre = round(sum(pretest_scores) / len(pretest_scores), 1) if pretest_scores else 0
    avg_post = round(sum(posttest_scores) / len(posttest_scores), 1) if posttest_scores else 0
    class_gain = round(avg_post - avg_pre, 1)

    conn.close()

    return {
        "status": "success",
        "summary": {
            "total_students": len(students),
            "pretest_takers": len(pretest_scores),
            "posttest_takers": len(posttest_scores),
            "avg_pretest": avg_pre,
            "avg_posttest": avg_post,
            "class_gain": class_gain
        },
        "reports": student_reports
    }

@app.get("/api/operator/analytics/export-csv")
def export_analytics_csv(user: dict = Depends(require_operator)):
    analytics = operator_get_analytics(user)
    reports = analytics['reports']

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["NIM", "Nama Lengkap", "Kelas", "Nilai Pre-test", "Nilai Post-test", "Peningkatan", "Progres Materi (%)", "Skor Game", "Status Lab"])
    for r in reports:
        writer.writerow([
            r['nim'],
            r['full_name'],
            r['class_name'],
            r['pretest'] if r['pretest'] is not None else "-",
            r['posttest'] if r['posttest'] is not None else "-",
            f"+{r['delta']}" if r['delta'] is not None and r['delta'] > 0 else (r['delta'] if r['delta'] is not None else "-"),
            f"{r['progress_percent']}%",
            r['game_score'],
            "Selesai" if r['lab_completed'] else "Belum"
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=laporan_hasil_belajar_sd.csv"}
    )

# E. Settings Update
@app.put("/api/operator/settings")
def update_settings(req: SettingsUpdateRequest, user: dict = Depends(require_operator)):
    conn = get_db_connection()
    for k, v in req.settings.items():
        conn.execute("INSERT OR REPLACE INTO media_settings (key, value) VALUES (?, ?)", (k, v))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Pengaturan media pembelajaran berhasil disimpan!"}

# -------------------------------------------------------------
# STATIC FILE SERVING & SPA ENTRYPOINTS
# -------------------------------------------------------------
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse)
def index_page():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>Memuat Media Pembelajaran Interaktif Siswa SD...</h1>")

@app.get("/operator", response_class=HTMLResponse)
def operator_page():
    op_path = os.path.join(STATIC_DIR, "operator.html")
    if os.path.exists(op_path):
        with open(op_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>Memuat Dashboard Operator...</h1>")

if __name__ == "__main__":
    import uvicorn
    import webbrowser
    import threading
    import socket

    def get_local_ip():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    local_ip = get_local_ip()

    print("=" * 70)
    print("🚀 SERVER MEDIA PEMBELAJARAN INTERAKTIF SISWA SD BERHASIL AKTIF!")
    print("=" * 70)
    print("💻 Akses dari Laptop ini (Google Chrome / Browser):")
    print("   👉 Portal Siswa:    http://localhost:8000")
    print("   👉 Portal Operator: http://localhost:8000/operator")
    print("")
    print(f"📱 Akses dari HP / Tablet / Orang Lain di Jaringan yang Sama:")
    print(f"   👉 Portal Siswa:    http://{local_ip}:8000")
    print(f"   👉 Portal Operator: http://{local_ip}:8000/operator")
    print("")
    print("👤 Akun Operator:")
    print("   Username: Ananta")
    print("   Password: 12345")
    print("")
    print("🎓 Contoh Akun Siswa:")
    print("   NIM: SD2026001 | Nama: Ahmad Faiz Pratama | PIN: 1234")
    print("   NIM: SD2026002 | Nama: Siti Nur Azizah    | PIN: 1234")
    print("=" * 70)

    # Otomatis buka browser setelah 1 detik
    def open_browser():
        import time
        time.sleep(1.2)
        webbrowser.open("http://localhost:8000")

    threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
