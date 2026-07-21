from pydantic import BaseModel, Field
from typing import List

class ProjectCheckpoint(BaseModel):
    id: str = Field(description="Unique identifier for the checkpoint")
    label: str = Field(description="Text description of the checkpoint task")
    completed: bool = Field(default=False, description="Completion status of the checkpoint")

class ProjectMilestone(BaseModel):
    id: str = Field(description="Unique identifier for the milestone")
    title: str = Field(description="Title of the milestone")
    checkpoints: List[ProjectCheckpoint] = Field(default_factory=list, description="Checkpoints under this milestone")

class ActiveProject(BaseModel):
    id: str = Field(description="Unique identifier of the project")
    title: str = Field(description="Title of the project")
    description: str = Field(description="Detailed project brief and implementation steps")
    difficulty: str = Field(description="Difficulty level (Beginner / Intermediate / Advanced)")
    technologies: List[str] = Field(default_factory=list, description="Technologies to build the project")
    status: str = Field(default="idle", description="Project status: idle / in_progress / completed")
    milestones: List[ProjectMilestone] = Field(default_factory=list, description="Structured milestones roadmap")
