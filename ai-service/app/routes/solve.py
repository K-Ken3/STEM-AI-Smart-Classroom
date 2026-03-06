from fastapi import APIRouter
from app.models.request_models import SolveRequest
from app.services.solver_service import solve_problem

router = APIRouter()

@router.post("/solve")
def solve(request: SolveRequest):
    result = solve_problem(request.problem)
    return result