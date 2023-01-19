"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: "ts-jest",
    displayName: "Browser Environment Tests",
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/test.ts"],
};
exports.default = config;
