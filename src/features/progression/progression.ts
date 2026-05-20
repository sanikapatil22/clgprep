import type { TopicNode } from "@/types/learning";

export function getUnlockSummary(topics: TopicNode[]) {
  const completed = topics.filter((topic) => topic.status === "complete").length;
  const active = topics.find((topic) => topic.status === "active");
  const totalXp = topics.reduce((sum, topic) => sum + topic.xp, 0);

  return {
    completed,
    total: topics.length,
    active,
    totalXp,
    percent: Math.round((completed / topics.length) * 100),
  };
}

export function canUnlock(previousCompleted: boolean, quizScore: number) {
  return previousCompleted && quizScore >= 70;
}
