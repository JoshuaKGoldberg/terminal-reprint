import type { WriteStream } from "node:tty";

import { describe, expect, it, vi } from "vitest";

import { writeDiffedOutput } from "./writeDiffedOutput.ts";

const mockWrite = vi.fn();

const stream = { write: mockWrite } as unknown as WriteStream;

const csi = "\u001B[";
const clearLineRight = `${csi}0K`;
const clearScreenDown = `${csi}0J`;

function cursorTo(x: number, y: number) {
	return `${csi}${String(y + 1)};${String(x + 1)}H`;
}

describe(writeDiffedOutput, () => {
	it("clears the screen when next is empty", () => {
		writeDiffedOutput(["a", "b"], [], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(0, 0) + clearScreenDown]]);
	});

	it("writes nothing when previous and next are the same", () => {
		writeDiffedOutput(["a", "b"], ["a", "b"], stream);

		expect(mockWrite).not.toHaveBeenCalled();
	});

	it("rewrites only the changed lines in a single write when some shared lines differ", () => {
		writeDiffedOutput(["a", "b", "c"], ["a", "B", "C"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(0, 1) + "B" + cursorTo(0, 2) + "C"],
		]);
	});

	it("rewrites only the changed suffix of a line when the line shares a prefix", () => {
		writeDiffedOutput(["count: 1"], ["count: 2"], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(7, 0) + "2"]]);
	});

	it("does not clear to the right when the changed suffix grows", () => {
		writeDiffedOutput(["count: 9"], ["count: 10"], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(7, 0) + "10"]]);
	});

	it("clears to the right when the changed suffix shrinks", () => {
		writeDiffedOutput(["count: 10"], ["count: 9"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(7, 0) + "9" + clearLineRight],
		]);
	});

	it("clears to the right when the whole line is deleted", () => {
		writeDiffedOutput(["abc"], [""], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(0, 0) + clearLineRight]]);
	});

	it("stops the shared prefix before a wide character", () => {
		writeDiffedOutput(["ab💖cd"], ["ab💖ce"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(2, 0) + "💖ce" + clearLineRight],
		]);
	});

	it("stops the shared prefix before an escape sequence", () => {
		writeDiffedOutput(
			[`${csi}32mok${csi}0m 1`],
			[`${csi}32mok${csi}0m 2`],
			stream,
		);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(0, 0) + `${csi}32mok${csi}0m 2` + clearLineRight],
		]);
	});

	it("clears to the right when the next suffix contains non-ASCII characters", () => {
		writeDiffedOutput(["hi there"], ["hi 💖"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(3, 0) + "💖" + clearLineRight],
		]);
	});

	it("clears to the right when the previous suffix contains non-ASCII characters", () => {
		writeDiffedOutput(["hi 💖"], ["hi there"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(3, 0) + "there" + clearLineRight],
		]);
	});

	it("writes the new lines when next is longer than previous", () => {
		writeDiffedOutput(["a"], ["a", "b", "c"], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(0, 1) + "b\nc"]]);
	});

	it("writes all lines when previous is empty", () => {
		writeDiffedOutput([], ["a", "b"], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(0, 0) + "a\nb"]]);
	});

	it("clears the remaining screen when next is shorter than previous", () => {
		writeDiffedOutput(["a", "b", "c"], ["a"], stream);

		expect(mockWrite.mock.calls).toEqual([[cursorTo(0, 1) + clearScreenDown]]);
	});

	it("rewrites changed lines and writes new lines when next is longer and differs", () => {
		writeDiffedOutput(["a", "b"], ["A", "b", "c"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(0, 0) + "A" + cursorTo(0, 2) + "c"],
		]);
	});

	it("rewrites changed lines and clears the remaining screen when next is shorter and differs", () => {
		writeDiffedOutput(["a", "b", "c"], ["a", "B"], stream);

		expect(mockWrite.mock.calls).toEqual([
			[cursorTo(0, 1) + "B" + cursorTo(0, 2) + clearScreenDown],
		]);
	});
});
