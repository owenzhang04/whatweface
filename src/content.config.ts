import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { problemSchema, sourceSchema } from "./lib/schemas";

const problems = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/problems" }),
  schema: problemSchema,
});

const sources = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/sources" }),
  schema: sourceSchema,
});

export const collections = { problems, sources };
