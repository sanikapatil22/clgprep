"use client";

import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import type { TopicNode } from "@/types/learning";

export function RoadmapGraph({ topics }: { topics: TopicNode[] }) {
  const nodes: Node[] = topics.map((topic, index) => ({
    id: topic.slug,
    position: { x: index * 190, y: index % 2 === 0 ? 20 : 120 },
    data: { label: topic.title },
    style: {
      background:
        topic.status === "complete"
          ? "rgba(52, 211, 153, 0.16)"
          : topic.status === "active"
            ? "rgba(56, 189, 248, 0.18)"
            : "rgba(30, 41, 59, 0.86)",
      border: "1px solid rgba(148, 163, 184, 0.25)",
      borderRadius: 8,
      color: topic.status === "locked" ? "#64748b" : "#e2e8f0",
      fontWeight: 700,
      width: 150,
    },
  }));

  const edges: Edge[] = topics.slice(0, -1).map((topic, index) => ({
    id: `${topic.slug}-${topics[index + 1].slug}`,
    source: topic.slug,
    target: topics[index + 1].slug,
    animated: topics[index + 1].status === "active",
  }));

  return (
    <div className="h-72 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background color="#334155" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
