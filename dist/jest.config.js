"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_config_1 = require("jest-config");
const config = {
    preset: "ts-jest",
    verbose: true,
    roots: ["<rootDir>/src"],
    projects: ["<rootDir>/test/node/jest.config.ts"],
    moduleFileExtensions: [...jest_config_1.defaults.moduleFileExtensions, "ts", "tsx"],
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
    testPathIgnorePatterns: ["<rootDir>/node_modules/", ".d.ts", ".js"],
};
exports.default = config;
