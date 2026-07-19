import re
from typing import Dict, Any

def extract_job_requirements(text: str) -> Dict[str, Any]:
    """
    Lightweight Python-based parser to extract job requirements/attributes from free text.
    Uses regex, line capitalization, and keyword heuristics.
    """
    reqs = {
        "job_title": "Unknown Title",
        "company": "Unknown Company",
        "required_skills": [],
        "preferred_skills": [],
        "technologies": [],
        "experience_level": "Not Specified",
        "responsibilities": [],
        "qualifications": []
    }
    
    if not text:
        return reqs
        
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if not lines:
        return reqs
        
    # 1. Attempt to extract job title and company from the first few lines
    first_few = lines[:3]
    for line in first_few:
        # Match "Title at Company"
        match_at = re.search(r"(.+?)\s+at\s+(.+)", line, re.IGNORECASE)
        if match_at:
            reqs["job_title"] = match_at.group(1).strip()
            reqs["company"] = match_at.group(2).strip()
            break
        # Match "Company - Title" or "Title - Company"
        match_dash = re.search(r"(.+?)\s+-\s+(.+)", line)
        if match_dash:
            g1, g2 = match_dash.group(1).strip(), match_dash.group(2).strip()
            role_indicators = {"engineer", "developer", "manager", "architect", "lead", "analyst", "specialist", "intern"}
            if any(ind in g2.lower() for ind in role_indicators):
                reqs["job_title"] = g2
                reqs["company"] = g1
            else:
                reqs["job_title"] = g1
                reqs["company"] = g2
            break
    else:
        # Fallback: use first line as title
        reqs["job_title"] = lines[0]

    # 2. Extract experience level using keyword patterns
    exp_patterns = [
        (r"\b(senior|sr\b|lead|principal|staff|director|manager)\b", "Senior"),
        (r"\b(junior|jr\b|entry\b|associate)\b", "Junior"),
        (r"\b(intern\b|internship)\b", "Intern"),
        (r"(\d+\s*-\s*\d+|\d+\+?)\s*(years|yrs)\b", None)
    ]
    for pattern, label in exp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if label:
                reqs["experience_level"] = label
            else:
                reqs["experience_level"] = match.group(0).strip()
            break
            
    # 3. Extract technologies from a pre-defined set of capital/common words
    known_techs = {
        "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust",
        "aws", "azure", "gcp", "docker", "kubernetes", "fastapi", "django", "flask",
        "react", "angular", "vue", "node", "sql", "postgresql", "mysql", "mongodb",
        "git", "linux", "html", "css", "spark", "hadoop", "tensorflow", "pytorch",
        "machine learning", "ml", "artificial intelligence", "ai", "llm", "nlp"
    }
    found_techs = set()
    # Tokenize text and look for standard matching tokens
    for word in re.findall(r"\b[a-zA-Z0-9+#\.-]+\b", text.lower()):
        if word in known_techs:
            found_techs.add(word)
    reqs["technologies"] = sorted(list(found_techs))
    
    # 4. Process sections (Responsibilities & Qualifications)
    current_section = None
    resp_headings = re.compile(r"\b(responsibilities|duties|what you will do|role|key tasks|about the job)\b", re.IGNORECASE)
    qual_headings = re.compile(r"\b(requirements|qualifications|skills|what we look for|experience|education)\b", re.IGNORECASE)
    
    for line in lines:
        # Check if line looks like a heading
        if len(line) < 60 and (line.endswith(":") or line.isupper() or resp_headings.search(line) or qual_headings.search(line)):
            if resp_headings.search(line):
                current_section = "resp"
            elif qual_headings.search(line):
                current_section = "qual"
            else:
                current_section = None
            continue
            
        # Parse bullet points or list items
        if line.startswith(("-", "*", "•", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
            cleaned_line = re.sub(r"^[-*•\d\.\s]+", "", line).strip()
            if cleaned_line:
                if current_section == "resp":
                    reqs["responsibilities"].append(cleaned_line)
                elif current_section == "qual":
                    reqs["qualifications"].append(cleaned_line)
                    # Sort into required vs preferred
                    if any(kw in cleaned_line.lower() for kw in ["preferred", "plus", "nice to have", "desired", "highly value"]):
                        reqs["preferred_skills"].append(cleaned_line)
                    else:
                        reqs["required_skills"].append(cleaned_line)
                        
    # Fallback to prevent empty fields
    if not reqs["responsibilities"]:
        # Grab first few descriptive lines
        reqs["responsibilities"] = [l for l in lines[1:6] if not l.startswith(("-", "*", "•"))][:4]
        
    if not reqs["qualifications"]:
        # Search lines containing keywords
        for line in lines:
            if any(k in line.lower() for k in ["experience", "degree", "qualification", "skills"]):
                cleaned = re.sub(r"^[-*•\d\.\s]+", "", line).strip()
                if cleaned:
                    reqs["qualifications"].append(cleaned)
                    reqs["required_skills"].append(cleaned)
                    
    return reqs
