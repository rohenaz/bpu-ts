import { defaults } from "jest-config";
const config = {
    preset: "ts-jest",
    verbose: true,
    roots: ["<rootDir>/src"],
    projects: ["<rootDir>/test/node/jest.config.ts"],
    moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
    testPathIgnorePatterns: ["<rootDir>/node_modules/", ".d.ts", ".js"],
};
export default config;
