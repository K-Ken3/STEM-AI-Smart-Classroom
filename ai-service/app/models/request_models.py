from pydantic import BaseModel

class SolveRequest(BaseModel):
    problem: str
    type: str = "math"  # optional: math, physics, chemistry