import {
  JsonLd,
  buildCreativeWorkJsonLd,
  buildPageMetadata,
} from "@core/seo";
import { notFound } from "next/navigation";

import {
  getProjectBySlug,
  portfolioConfig,
  portfolioProjects,
  ProjectDetail,
} from "@modules/portfolio";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return buildPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/work/${slug}`,
    siteName: portfolioConfig.name,
    type: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <JsonLd
        id={`work-${project.slug}`}
        data={buildCreativeWorkJsonLd({
          name: project.title,
          description: project.summary,
          path: `/work/${project.slug}`,
          datePublished: `${project.year}-01-01`,
          authorName: portfolioConfig.name,
        })}
      />
      <ProjectDetail project={project} />
    </>
  );
}
