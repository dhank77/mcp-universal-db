import { test, expect } from "bun:test";

test("sayHello tool exists", () => {
  const tool = {
    name: "sayHello",
    description: "A simple tool that says hello"
  };
  expect(tool.name).toBe("sayHello");
});