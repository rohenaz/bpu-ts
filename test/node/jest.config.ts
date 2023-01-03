import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  displayName: "Node Environment Tests",
  testEnvironment: "node",
  testMatch: ["<rootDir>/test.ts"],
};

export default config;
