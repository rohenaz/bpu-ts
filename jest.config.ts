import type { Config } from "@jest/types";
import { defaults } from "jest-config";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  verbose: true,
  roots: ["<rootDir>/src"],
  projects: [
    "<rootDir>/test/node/jest.config.ts",
    "<rootDir>/test/browser/jest.config.ts",
  ],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", ".d.ts", ".js"],
};
export default config;
