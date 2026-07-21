import random
from typing import List, Dict, Any, Optional

# A rich set of mock companies to generate realistic job listings
MOCK_COMPANIES = [
    "Google", "Meta", "Stripe", "OpenAI", "Anthropic", "Databricks", 
    "Vercel", "Retool", "Linear", "Supabase", "Microsoft", "Amazon",
    "Netflix", "Airbnb", "Snowflake", "Clerk", "Resend", "Pinecone"
]

MOCK_LOCATIONS = [
    "Remote", "San Francisco, CA", "New York, NY", "Seattle, WA", 
    "Austin, TX", "Boston, MA", "Chicago, IL"
]

EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"]

SKILLS_POOL = [
    "Python", "JavaScript", "TypeScript", "FastAPI", "Django", "React", "Vue", "Next.js", 
    "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Machine Learning", "LLMs", "RAG", "LangChain", "PyTorch", "TensorFlow", "Node.js",
    "Go", "Rust", "C++", "Java", "System Design", "Git", "CI/CD"
]

def search_jobs(
    preferred_role: Optional[str] = None,
    location: Optional[str] = None,
    skills: List[str] = None,
    career_interests: List[str] = None,
    is_student: bool = False,
    graduation_year: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Search for jobs dynamically building query filters and returning a pool of 20-30 realistic listings.
    If location is Remote, prioritizes Remote.
    If student or graduation year indicates recent/upcoming grad, includes Internships and Entry-level roles.
    """
    role = preferred_role.strip() if preferred_role else "Software Engineer"
    loc = location.strip() if location else "Remote"
    candidate_skills = skills if skills else ["Python", "JavaScript"]
    interests = career_interests if career_interests else [role]
    
    # Determine experience level constraints
    if is_student or (graduation_year and graduation_year in ["2025", "2026", "2027"]):
        exp_levels = ["Internship", "Entry-level"]
        emp_types = ["Internship", "Full-time"]
    else:
        exp_levels = ["Mid-level", "Senior", "Lead"]
        emp_types = ["Full-time", "Contract"]
        
    jobs = []
    random.seed(role + loc) # Seed for deterministic results per query parameter set
    
    # Programmatically synthesize 25 highly relevant jobs
    for i in range(25):
        company = random.choice(MOCK_COMPANIES)
        job_loc = loc if loc.lower() == "remote" or random.random() < 0.4 else random.choice(MOCK_LOCATIONS)
        emp_type = random.choice(emp_types)
        exp_level = random.choice(exp_levels)
        
        # Build realistic title variations
        title_prefixes = ["Junior ", "", "Senior ", "Lead ", "Staff "]
        if exp_level == "Internship":
            title = f"{role} Intern"
        elif exp_level == "Senior":
            title = f"Senior {role}"
        elif exp_level == "Lead":
            title = f"Lead {role}"
        else:
            title = f"{role}"
            
        # Determine job skills (some overlapping with candidate skills, some new to create skills gaps)
        num_skills = random.randint(4, 7)
        job_skills = set()
        
        # 1. Add some matching candidate skills (guarantees match relevance)
        overlap_count = min(num_skills - 2, len(candidate_skills))
        if overlap_count > 0:
            job_skills.update(random.sample(candidate_skills, overlap_count))
            
        # 2. Add some missing/additional skills from the general pool
        while len(job_skills) < num_skills:
            job_skills.add(random.choice(SKILLS_POOL))
            
        job_skills_list = list(job_skills)
        
        # Application URL generator using official company careers page
        COMPANY_CAREERS_MAP = {
            "Google": "https://careers.google.com",
            "Meta": "https://www.metacareers.com",
            "Stripe": "https://stripe.com/jobs",
            "OpenAI": "https://openai.com/careers",
            "Anthropic": "https://www.anthropic.com/careers",
            "Databricks": "https://www.databricks.com/company/careers",
            "Vercel": "https://vercel.com/careers",
            "Retool": "https://retool.com/careers",
            "Linear": "https://linear.app/careers",
            "Supabase": "https://supabase.com/careers",
            "Microsoft": "https://careers.microsoft.com",
            "Amazon": "https://www.amazon.jobs",
            "Netflix": "https://jobs.netflix.com",
            "Airbnb": "https://careers.airbnb.com",
            "Snowflake": "https://www.snowflake.com/trending/careers",
            "Clerk": "https://clerk.com/careers",
            "Resend": "https://resend.com/careers",
            "Pinecone": "https://www.pinecone.io/careers"
        }
        url = COMPANY_CAREERS_MAP.get(company, "https://careers.google.com")
        
        jobs.append({
            "title": title,
            "company": company,
            "location": job_loc,
            "employment_type": emp_type,
            "experience_level": exp_level,
            "required_skills": job_skills_list,
            "url": url
        })
        
    return jobs
