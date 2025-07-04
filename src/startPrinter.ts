import cliCursor from "cli-cursor";

import type { Print, Printer, PrinterOptions } from "./types.ts";

import { writeDiffedOutput } from "./writeDiffedOutput.ts";

export function startPrinter(options: Print | PrinterOptions): Printer {
	const { print, stream = process.stdout } =
		typeof options === "function" ? { print: options } : options;

	let previous = getNewScreen();

	cliCursor.hide(stream);

	stream.cursorTo(0, 0);
	stream.clearScreenDown();
	stream.write(previous.join("\n") + "\n");

	return {
		reprint() {
			const next = getNewScreen();

			writeDiffedOutput(previous, next, stream);

			previous = next;
		},
		[Symbol.dispose]() {
			cliCursor.show(stream);
		},
	};

	function getNewScreen() {
		return print({
			columns: process.stdout.columns,
			rows: process.stdout.rows,
		});
	}
}
