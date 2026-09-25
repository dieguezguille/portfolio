import { file, glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import { experience, work } from "./schemas";

export const collections = {
  experienceEn: defineCollection({ loader: file("src/content/experience/en.yaml"), schema: experience }),
  experienceEs: defineCollection({ loader: file("src/content/experience/es.yaml"), schema: experience }),
  work: defineCollection({
    loader: glob({ base: "./src/content/work", pattern: "**/*.md" }),
    schema: ({ image }) => work(image),
  }),
};
