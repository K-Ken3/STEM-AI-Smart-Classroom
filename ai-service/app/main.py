from fastapi import FastAPI
from pydantic import BaseModel
from sympy import symbols, Eq, solve, sympify

app = FastAPI()

# Health check route
@app.get("/")
def root():
    return {"message": "STEM AI Solver API is running"}

# Request schema
class SolveRequest(BaseModel):
    problem: str

# Solve endpoint
@app.post("/solve")
def solve_equation(request: SolveRequest):
    try:
        equation_str = request.problem.replace(" ", "")

        if "=" not in equation_str:
            return {
                "success": False,
                "error": "Equation must contain '=' sign"
            }

        left, right = equation_str.split("=")

        x = symbols('x')
        equation = Eq(sympify(left), sympify(right))
        solution = solve(equation, x)

        if not solution:
            return {
                "success": True,
                "problem": request.problem,
                "solution": "No solution found",
                "steps": [],
                "topic": "Algebra"
            }

        return {
            "success": True,
            "problem": request.problem,
            "solution": str(solution[0]),
            "steps": [
                "Parsed equation",
                "Converted equation to symbolic expression",
                "Solved using SymPy"
            ],
            "topic": "Algebra"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }