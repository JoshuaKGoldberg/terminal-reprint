import type { WriteStream } from "node:tty";

export type Print = (context: PrintContext) => string[];

export interface PrintContext {
	columns: number;
	rows: number;
}

export interface Printer {
	reprint(): void;
}

export interface PrinterOptions {
	print: Print;
	stream?: PrintStream;
}

export type PrintStream = Pick<
	WriteStream,
	"clearLine" | "clearScreenDown" | "columns" | "cursorTo" | "rows" | "write"
>;
