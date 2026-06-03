import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  // Stories are colocated with each component (one folder per component).
  stories: ["../src/**/*.stories.@(tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
