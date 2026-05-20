import type { LearningBlock } from "@/types/learning";
import { AnimationBlock } from "./AnimationBlock";
import { CodeBlock } from "./CodeBlock";
import { DiagramBlock } from "./DiagramBlock";
import { FlashcardBlock } from "./FlashcardBlock";
import { PYQBlock } from "./PYQBlock";
import { QuizBlock } from "./QuizBlock";
import { StepBlock } from "./StepBlock";
import { TextBlock } from "./TextBlock";

export function BlockRenderer({ blocks }: { blocks: LearningBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block) => {
        switch (block.type) {
          case "text":
            return <TextBlock key={block.id} {...block} />;
          case "diagram":
            return <DiagramBlock key={block.id} {...block} />;
          case "animation":
            return <AnimationBlock key={block.id} {...block} />;
          case "quiz":
            return <QuizBlock key={block.id} {...block} />;
          case "flashcard":
            return <FlashcardBlock key={block.id} {...block} />;
          case "pyq":
            return <PYQBlock key={block.id} {...block} />;
          case "step":
            return <StepBlock key={block.id} {...block} />;
          case "code":
            return <CodeBlock key={block.id} {...block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
