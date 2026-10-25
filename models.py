"""
Pydantic data models and schemas for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Authentication
class StudentLoginRequest(BaseModel):
    nim: str
    full_name: str
    pin: str

class OperatorLoginRequest(BaseModel):
    username: str
    password: str

# Student Management (Operator)
class StudentCreateRequest(BaseModel):
    nim: str
    full_name: str
    class_name: str = "Kelas 4 SD"
    pin: str
    avatar: str = "astronaut"
    is_active: int = 1

class StudentUpdateRequest(BaseModel):
    full_name: str
    class_name: str
    pin: Optional[str] = None
    avatar: Optional[str] = None
    is_active: Optional[int] = None

class BatchStudentRequest(BaseModel):
    class_name: str
    count: int
    prefix: str = "SD"
    default_pin: str = "1234"

# Student self-profile
class AvatarUpdateRequest(BaseModel):
    avatar: str

# Learning Progress & Storyline Slides
class SlideProgressRequest(BaseModel):
    module_id: int
    slide_id: int
    is_completed: bool = False

# Virtual Lab Experiment
class ExperimentSubmitRequest(BaseModel):
    experiment_id: int
    hypothesis_answer: str
    notes: str
    conclusion_answer: str

# Educational Games
class GameScoreSubmitRequest(BaseModel):
    game_code: str
    score: int
    stars: int = 3

# Test Evaluation (Pre-test and Post-test)
class TestSubmitRequest(BaseModel):
    test_type: str # 'pretest' or 'posttest'
    answers: Dict[str, str] # { "question_id": "selected_option" }

# Question Bank Management (Operator)
class QuestionCreateRequest(BaseModel):
    test_type: str # 'pretest' or 'posttest' or 'both'
    topic: str
    question_text: str
    question_type: str = "multiple_choice"
    image_url: Optional[str] = None
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    points: int = 10
    order_index: int = 1
    is_active: int = 1

class QuestionUpdateRequest(BaseModel):
    test_type: str
    topic: str
    question_text: str
    question_type: str
    image_url: Optional[str] = None
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    points: int
    order_index: int
    is_active: int

# Module & Slide Management (Operator)
class ModuleCreateRequest(BaseModel):
    code: str
    title: str
    description: str
    order_index: int = 1
    is_published: int = 1

class SlideCreateRequest(BaseModel):
    module_id: int
    title: str
    slide_type: str = "standard"
    content: str
    interactive_data: Optional[str] = None
    narration_text: Optional[str] = None
    image_url: Optional[str] = None
    order_index: int = 1

# Media Settings
class SettingsUpdateRequest(BaseModel):
    settings: Dict[str, str]
