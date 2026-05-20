export type BlockType = "text" | "diagram" | "quiz" | "animation" | "flashcard" | "pyq" | "step" | "code";

export type LearningBlock =
  | { id: string; type: "text"; title: string; body: string; callout?: string }
  | { id: string; type: "diagram"; title: string; nodes: string[]; edges: [number, number][] }
  | {
      id: string;
      type: "quiz";
      question: string;
      options: string[];
      answer: number;
      explanation: string;
    }
  | { id: string; type: "animation"; title: string; frames: string[] }
  | { id: string; type: "flashcard"; front: string; back: string }
  | { id: string; type: "pyq"; question: string; university: string; year: string }
  | { id: string; type: "step"; title: string; steps: string[] }
  | { id: string; type: "code"; language: string; code: string; caption: string };

export type TopicNode = {
  slug: string;
  title: string;
  status: "complete" | "active" | "locked";
  xp: number;
};
