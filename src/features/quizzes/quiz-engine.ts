export type QuizResult = {
  correct: boolean;
  xpEarned: number;
  explanation: string;
};

export function gradeQuiz(answer: number, expected: number, explanation: string): QuizResult {
  const correct = answer === expected;
  return {
    correct,
    xpEarned: correct ? 30 : 5,
    explanation,
  };
}
