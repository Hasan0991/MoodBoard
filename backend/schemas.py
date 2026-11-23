from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class DesignPreferences(BaseModel):
    room_type: str
    style: str
    description: Optional[str] = Field(
        default=None,
        max_length=3000
    )
    minimalism: int
    cosiness: int
    colourfulness: int

class PriorityInterpretation(BaseModel):
    minimalism: int
    cosiness: int
    colourfulness: int
    