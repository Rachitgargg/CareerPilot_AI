# Product Requirements Document (PRD)

## 1. Introduction & Goal
This document outlines the product requirements for **CareerPilot AI**, an AI-powered career assistant designed to help candidates optimize their resumes, prepare for interviews, search for matching jobs, and chart career progression.

## 2. Target Audience
- Job seekers (entry-level to senior positions).
- Career transitioners seeking guidance on new industries/roles.
- Professionals aiming for upskilling and promotion paths.

## 3. Core Features & Scope
- **Resume Analyzer**: Upload resume and get real-time scores, keyword gaps, and revision suggestions based on target job descriptions.
- **Mock Interviewer**: Voice or text-based mock interviews with context-aware follow-up questions and comprehensive feedback reports.
- **Job Matching & Recommendation**: Semantic search and fit analysis between user profiles and job roles.
- **Career Path Planning**: AI-generated skill development roadmaps based on career goals.

## 4. Non-Functional Requirements
- **Response Time**: AI-generated responses (except heavy RAG processing) should return within 2 seconds.
- **Data Privacy**: Secure storage of candidate resumes and personal data; compliance with standard security/privacy mandates.
- **Scalability**: Capable of handling concurrent traffic and heavy vector store indexing.
