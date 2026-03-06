from fastapi import FastAPI
from pydantic import BaseModel
from sympy import symbols, Eq, solve, sympify

app = FastAPI()

class SolveRequest(BaseModel):
    problem: str

@app.post("/solve")
def solve_equation(request: SolveRequest):
    try:
        equation_str = request.problem.replace(" ", "")

        if "=" not in equation_str:
            return {"error": "Equation must contain '=' sign"}

        left, right = equation_str.split("=")

        x = symbols('x')

        equation = Eq(sympify(left), sympify(right))
        solution = solve(equation, x)

        if not solution:
            return {
                "problem": request.problem,
                "solution": "No solution found",
                "steps": [],
                "topic": "Algebra"
            }

        return {
            "problem": request.problem,
            "solution": str(solution[0]),
            "steps": [
                "Parsed equation",
                "Converted to symbolic expression",
                "Solved using SymPy"
            ],
            "topic": "Algebra"
        }

    except Exception as e:
        return {"error": str(e)}