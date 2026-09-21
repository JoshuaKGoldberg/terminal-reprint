import type { WriteStream } from "node:tty";

import { describe, expect, it, vi } from "vitest";

import { writeDiffedOutput } from "./writeDiffedOutput.ts";

const mockStreamCall = vi.fn<(method: string, ...args: unknown[]) => void>();

const stream = {
	clearLine: (...args: unknown[]) => {
		mockStreamCall("clearLine", ...args);
	},
	clearScreenDown: (...args: unknown[]) => {
		mockStreamCall("clearScreenDown", ...args);
	},
	cursorTo: (...args: unknown[]) => {
		mockStreamCall("cursorTo", ...args);
	},
	write: (...args: unknown[]) => {
		mockStreamCall("write", ...args);
	},
} as unknown as WriteStream;

describe("writeDiffedOutput", () => {
	it("clears the screen when next is empty", () => {
		writeDiffedOutput(["a", "b"], [], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["clearScreenDown"],
		]);
	});

	it("only moves the cursor when previous and next are the same", () => {
		writeDiffedOutput(["a", "b"], ["a", "b"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 2],
		]);
	});

	it("rewrites only the changed lines when some shared lines differ", () => {
		writeDiffedOutput(["a", "b", "c"], ["a", "B", "C"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 1],
			["clearLine", 0],
			["write", "B"],
			["cursorTo", 0, 2],
			["clearLine", 0],
			["write", "C"],
			["cursorTo", 0, 3],
		]);
	});

	it("writes the new lines when next is longer than previous", () => {
		writeDiffedOutput(["a"], ["a", "b", "c"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 1],
			["write", "b\nc"],
		]);
	});

	it("writes all lines when previous is empty", () => {
		writeDiffedOutput([], ["a", "b"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 0],
			["write", "a\nb"],
		]);
	});

	it("clears the remaining screen when next is shorter than previous", () => {
		writeDiffedOutput(["a", "b", "c"], ["a"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 1],
			["clearScreenDown"],
		]);
	});

	it("rewrites changed lines and writes new lines when next is longer and differs", () => {
		writeDiffedOutput(["a", "b"], ["A", "b", "c"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 0],
			["clearLine", 0],
			["write", "A"],
			["cursorTo", 0, 2],
			["write", "c"],
		]);
	});

	it("rewrites changed lines and clears the remaining screen when next is shorter and differs", () => {
		writeDiffedOutput(["a", "b", "c"], ["a", "B"], stream);

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 1],
			["clearLine", 0],
			["write", "B"],
			["cursorTo", 0, 2],
			["clearScreenDown"],
		]);
	});
});
