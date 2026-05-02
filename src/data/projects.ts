export interface ProjectSummary {
  title: string;
  description: string;
  techStack: string[];
  href?: string;
  draft?: boolean;
}

export const projectSummaries: ProjectSummary[] = [
  {
    title: "M&V Events Mobile App",
    description:
      "A mobile app for digital savings cards and reward systems, focused on frontend delivery, authenticated flows, and store release work.",
    techStack: ["React Native", "TypeScript", "JWT", "GraphQL", "REST APIs"],
  },
  {
    title: "Draft project case study",
    description:
      "A placeholder entry for future detail-page content that should not render while it remains marked as draft.",
    techStack: ["Draft"],
    draft: true,
  },
];
