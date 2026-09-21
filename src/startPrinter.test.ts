import type { WriteStream } from "node:tty";

import { afterEach, describe, expect, it, vi } from "vitest";

import { startPrinter } from "./startPrinter.ts";

const mockHide = vi.fn();
const mockShow = vi.fn();

vi.mock("cli-cursor", () => ({
	get default() {
		return { hide: mockHide, show: mockShow };
	},
}));

const mockStreamCall = vi.fn<(method: string, ...args: unknown[]) => void>();

function createMockStream(properties: Partial<WriteStream> = {}) {
	return {
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
		...properties,
	} as unknown as typeof process.stdout;
}

const stream = createMockStream();

describe(startPrinter, () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("hides the cursor, clears the screen, and writes the initial screen when given a print function", () => {
		const print = vi.fn().mockReturnValue(["a", "b"]);

		startPrinter({ print, stream });

		expect(mockHide).toHaveBeenCalledWith(stream);
		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["clearScreenDown"],
			["write", "a\nb\n"],
		]);
	});

	it("uses the print function directly when given a function instead of options", () => {
		vi.spyOn(process, "stdout", "get").mockReturnValue(stream);

		const print = vi.fn().mockReturnValue(["a", "b"]);

		startPrinter(print);

		expect(mockHide).toHaveBeenCalledWith(stream);
		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["clearScreenDown"],
			["write", "a\nb\n"],
		]);
	});

	it("defaults the stream to process.stdout when options don't include a stream", () => {
		vi.spyOn(process, "stdout", "get").mockReturnValue(stream);

		startPrinter({ print: () => ["a"] });

		expect(mockHide).toHaveBeenCalledWith(stream);
		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["clearScreenDown"],
			["write", "a\n"],
		]);
	});

	it("passes the stdout dimensions to print when printing", () => {
		vi.spyOn(process, "stdout", "get").mockReturnValue(
			createMockStream({ columns: 80, rows: 24 }),
		);

		const print = vi.fn().mockReturnValue([]);

		startPrinter({ print, stream });

		expect(print).toHaveBeenCalledWith({ columns: 80, rows: 24 });
	});

	it("writes only the changed lines when reprint is called with a different screen", () => {
		const print = vi
			.fn()
			.mockReturnValueOnce(["a", "b"])
			.mockReturnValueOnce(["a", "B", "c"]);

		const printer = startPrinter({ print, stream });

		mockStreamCall.mockClear();

		printer.reprint();

		expect(print).toHaveBeenCalledTimes(2);
		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 1],
			["clearLine", 0],
			["write", "B"],
			["cursorTo", 0, 2],
			["write", "c"],
		]);
	});

	it("diffs against the most recent screen when reprint is called multiple times", () => {
		const print = vi
			.fn()
			.mockReturnValueOnce(["a"])
			.mockReturnValueOnce(["a", "b"])
			.mockReturnValueOnce(["a", "b"]);

		const printer = startPrinter({ print, stream });

		printer.reprint();
		mockStreamCall.mockClear();

		printer.reprint();

		expect(mockStreamCall.mock.calls).toEqual([
			["cursorTo", 0, 0],
			["cursorTo", 0, 2],
		]);
	});

	it("shows the cursor when the printer is disposed", () => {
		const printer = startPrinter({ print: () => [], stream });

		expect(mockShow).not.toHaveBeenCalled();

		printer[Symbol.dispose]();

		expect(mockShow).toHaveBeenCalledWith(stream);
	});
});
