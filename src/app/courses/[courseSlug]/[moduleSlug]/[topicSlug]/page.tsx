import { notFound } from "next/navigation";
import { ConceptWorkspace } from "@/components/topic/ConceptWorkspace";
import { courses } from "@/features/learning-engine/sample-content";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; topicSlug: string }>;
}) {
  const { courseSlug, moduleSlug, topicSlug } = await params;
  const course = courses.find((item) => item.slug === courseSlug);
  const module = course?.modules.find((item) => item.slug === moduleSlug);
  const topic = module?.topics.find((item) => item.slug === topicSlug);
  if (!course || !module || !topic || topic.status === "locked") notFound();

  return <ConceptWorkspace course={course} module={module} topic={topic} />;
}
