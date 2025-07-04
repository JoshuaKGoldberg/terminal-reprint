import type { WriteStream } from "node:tty";

export type Print = (context: PrintContext) => string[];

export interface PrintContext {
	columns: number;
	rows: number;
}

export interface Printer extends Disposable {
	reprint(): void;
}

export interface PrinterOptions {
	print: Print;
	stream?: WriteStream;
}
