from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import shutil
import os
import uuid

from utils.extractor import process_resume
from utils.cleaner import clean_text
from utils.analyzer import (
    extract_and_categorize_skills,
    analyze_job_description,
    identify_missing_resume_skills
)
from utils.skills_db import skills_db, categories

app = FastAPI()

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

CONTENT_TYPE_MAP = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt"
}


def resolve_extension(filename: str, content_type: str) -> str:
    """
    Gets file extension from filename.
    Falls back to content_type if filename has no valid extension.
    Raises HTTPException if neither works.
    """
    ext = ""

    if filename and "." in filename:
        ext = filename.split(".")[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        ext = CONTENT_TYPE_MAP.get(content_type, "")

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    return ext


@app.get("/")
def home():
    return {"message": "Resume Analyzer API Running"}


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Debug log — remove after confirming filename is correct
    print(f"RAW FILENAME: '{resume.filename}'")
    print(f"CONTENT TYPE: '{resume.content_type}'")

    # Resolve extension safely
    file_extension = resolve_extension(resume.filename, resume.content_type)

    # Save file to temp directory
    os.makedirs("temp", exist_ok=True)
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"temp/{unique_filename}"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        # Extract and clean resume text
        extracted_text = process_resume(file_path)
        cleaned_resume = clean_text(extracted_text)

        # Analyze resume skills
        found_resume_skills, categorized_resume_skills = extract_and_categorize_skills(
            cleaned_resume, skills_db, categories
        )

        # Analyze job description
        cleaned_jd = clean_text(job_description)
        jd_analysis = analyze_job_description(
            cleaned_jd, skills_db, categories, found_resume_skills
        )

        # Find skills missing from resume, scoped to JD skills only
        missing_resume_skills = identify_missing_resume_skills(
            skills_db,
            found_resume_skills,
            jd_skills=jd_analysis["job_description_skills"]
        )

        return {
            "resume_skills": found_resume_skills,
            "categorized_resume_skills": categorized_resume_skills,
            "job_description_analysis": jd_analysis,
            "missing_resume_skills": missing_resume_skills
        }

    finally:
        # Always clean up the temp file
        if os.path.exists(file_path):
            os.remove(file_path)