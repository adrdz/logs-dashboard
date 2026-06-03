import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/nextjs-vite";
import * as projectAnnotations from "./preview";

// Applies this project's global decorators/parameters (the providers + theme
// from preview.tsx) to every story when run as a Vitest test.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
