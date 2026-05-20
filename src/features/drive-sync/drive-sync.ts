export type DriveFile = {
  id: string;
  name: string;
  webViewLink: string;
  mimeType: string;
  path: string[];
};

export type TopicResourceLink = {
  course: string;
  module: string;
  topic: string;
  title: string;
  url: string;
  type: "NOTES" | "PYQ" | "CHEATSHEET" | "DRIVE_FILE";
};

export function mapDriveFilesToTopicResources(files: DriveFile[]): TopicResourceLink[] {
  return files
    .filter((file) => file.path.length >= 3)
    .map((file) => {
      const [course, module, topic] = file.path;
      const lower = file.name.toLowerCase();
      const type = lower.includes("pyq")
        ? "PYQ"
        : lower.includes("cheatsheet")
          ? "CHEATSHEET"
          : lower.includes("notes")
            ? "NOTES"
            : "DRIVE_FILE";

      return {
        course,
        module,
        topic,
        title: file.name,
        url: file.webViewLink,
        type,
      };
    });
}
