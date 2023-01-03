import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  displayName: "Browser Environment Tests",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test.ts"],
};

export default config;
