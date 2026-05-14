import re


def _find_skills_in_text(text, skills_list):
    """
    Matches skills using word-boundary regex.
    Handles multi-word skills like 'node js', 'machine learning'.
    Handles symbol skills like 'c++', 'c#'.
    """
    normalized_text = text.lower()
    found_skills = set()

    for skill in skills_list:
        # Word boundary won't work after + or #
        # so use a lookahead/lookbehind for space or end of string
        escaped = re.escape(skill.lower())

        # For skills ending in special chars (c++, c#),
        # match start boundary normally but end on non-alphanumeric
        pattern = r'(?<![a-zA-Z0-9])' + escaped + r'(?![a-zA-Z0-9])'

        if re.search(pattern, normalized_text):
            found_skills.add(skill)

    return found_skills


def extract_and_categorize_skills(text, skills_db, categories):
    """
    Returns:
        - sorted list of all found skills
        - dict of category -> list of found skills in that category
    """
    found_skills = _find_skills_in_text(text, skills_db)

    categorized_skills = {}
    for category, skills in categories.items():
        matched = [skill for skill in skills if skill in found_skills]
        if matched:
            categorized_skills[category] = matched

    return sorted(found_skills), categorized_skills


def analyze_job_description(jd_text, skills_db, categories, resume_skills):
    """
    Compares JD skills against resume skills.
    Returns matched, missing, and categorized JD skills.
    """
    jd_skills = _find_skills_in_text(jd_text, skills_db)
    resume_skill_set = set(resume_skills)

    matched_resume_skills = sorted(jd_skills & resume_skill_set)
    missing_from_resume = sorted(jd_skills - resume_skill_set)

    categorized_jd_skills = {}
    for category, skills in categories.items():
        matched = [skill for skill in skills if skill in jd_skills]
        if matched:
            categorized_jd_skills[category] = matched

    return {
        "job_description_skills": sorted(jd_skills),
        "matched_resume_skills": matched_resume_skills,
        "missing_from_resume": missing_from_resume,
        "categorized_job_description_skills": categorized_jd_skills
    }


def identify_missing_resume_skills(skills_db, found_resume_skills, jd_skills=None):
    """
    Returns skills missing from the resume.
    If jd_skills is provided, only reports gaps relevant to the job.
    If not, reports against the full skills_db (not recommended — huge list).
    """
    found_skill_set = set(found_resume_skills)
    target = set(jd_skills) if jd_skills else set(skills_db)
    return sorted([skill for skill in target if skill not in found_skill_set])