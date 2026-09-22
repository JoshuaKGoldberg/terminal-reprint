import type { WriteStream } from "node:tty";

// Each stream.write() on a TTY is a synchronous syscall, so all changes for a
// reprint are collected into a single string and written once.
// These are the same escape sequences Node's readline helpers would emit.
// https://github.com/JoshuaKGoldberg/terminal-reprint/issues/7
const csi = "\u001B[";
const clearLineRight = `${csi}0K`;
const clearScreenDown = `${csi}0J`;

export function writeDiffedOutput(
	previous: string[],
	next: string[],
	stream: WriteStream,
) {
	if (next.length === 0) {
		stream.write(cursorTo(0, 0) + clearScreenDown);
		return;
	}

	let output = "";

	const sharedHeight = Math.min(next.length, previous.length);

	for (let i = 0; i < sharedHeight; i += 1) {
		const previousLine = previous[i];
		const nextLine = next[i];

		if (previousLine === nextLine) {
			continue;
		}

		// Only the portion of the line after the shared prefix is rewritten.
		const prefix = getSafePrefixLength(previousLine, nextLine);

		output += cursorTo(prefix, i) + nextLine.slice(prefix);

		if (!isNoWiderThan(previousLine, nextLine, prefix)) {
			output += clearLineRight;
		}
	}

	if (previous.length < next.length) {
		output +=
			cursorTo(0, sharedHeight) + next.slice(previous.length).join("\n");
	} else if (previous.length > next.length) {
		output += cursorTo(0, sharedHeight) + clearScreenDown;
	}

	if (output) {
		stream.write(output);
	}
}

function cursorTo(x: number, y: number) {
	return `${csi}${String(y + 1)};${String(x + 1)}H`;
}

/**
 * Length of the shared prefix of two lines, only counting characters whose
 * string index is guaranteed to equal their terminal column: printable ASCII.
 * Wide characters, combining marks, and escape sequences stop the prefix so
 * the cursor is never positioned past where the terminal would place it.
 */
function getSafePrefixLength(a: string, b: string) {
	const length = Math.min(a.length, b.length);
	let i = 0;

	for (; i < length; i += 1) {
		const code = a.charCodeAt(i);

		if (code !== b.charCodeAt(i) || !isPrintableAscii(code)) {
			break;
		}
	}

	return i;
}

/**
 * Whether the previous line's remainder can be safely overwritten by the
 * next line's remainder without any leftover characters on screen.
 * Only known when both remainders are printable ASCII (1 character = 1 column).
 */
function isNoWiderThan(previous: string, next: string, from: number) {
	return (
		previous.length <= next.length &&
		isPrintableAsciiFrom(previous, from) &&
		isPrintableAsciiFrom(next, from)
	);
}

function isPrintableAscii(code: number) {
	return code >= 0x20 && code <= 0x7e;
}

function isPrintableAsciiFrom(text: string, from: number) {
	for (let i = from; i < text.length; i += 1) {
		if (!isPrintableAscii(text.charCodeAt(i))) {
			return false;
		}
	}

	return true;
}
