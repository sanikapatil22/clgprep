import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { CourseLearningMap } from "@/components/course/CourseLearningMap";
import { courses } from "@/features/learning-engine/sample-content";

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = courses.find((item) => item.slug === courseSlug);
  if (!course) notFound();

  return (
    <AppShell>
      <CourseLearningMap course={course} />
    </AppShell>
  );
}
