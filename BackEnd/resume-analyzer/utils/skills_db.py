categories = {
    "Programming Languages": [
        "python", "java", "c++", "javascript",
        "c#", "go", "rust", "ruby", "php",
        "r", "swift", "kotlin", "typescript"
    ],

    "Web Development": [
        "html", "css", "react", "node js",
        "frontend", "backend", "fullstack",
        "rest api"
    ],

    "Data Science & ML": [
        "machine learning", "deep learning",
        "nlp", "tensorflow", "pytorch",
        "keras", "scikit learn"
    ],

    "Databases": [
        "sql", "mongodb", "postgresql",
        "mysql"
    ],

    "Cloud & DevOps": [
        "aws", "docker", "kubernetes",
        "git", "jenkins", "devops"
    ],

    "Soft Skills": [
        "communication",
        "leadership",
        "teamwork",
        "problem solving"
    ]
}

# Flat list of all skills for full-text matching
skills_db = list({
    skill
    for skills in categories.values()
    for skill in skills
})