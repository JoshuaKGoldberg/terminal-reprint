import type { PrintStream } from "./types.ts";

export function writeDiffedOutput(
	previous: string[],
	next: string[],
	stream: PrintStream,
) {
	for (let i = 0; i < next.length; i += 1) {
		// TODO: Look into clearing multiple lines at a time
		if (previous[i] !== next[i]) {
			stream.cursorTo(0, i);

			// TODO: Look into clearing just the parts that are changed, more intelligently
			stream.clearLine(0);

			stream.write(next[i]);
		}
	}

	if (previous.length < next.length) {
		stream.cursorTo(0, previous.length + 1);
		stream.write(next.slice(previous.length).join("\n"));
	} else if (previous.length > next.length) {
		for (let i = next.length; i < previous.length; i += 1) {
			stream.cursorTo(0, i);
			stream.clearLine(0);
		}
	}

	stream.write("\n");
	stream.write(next[next.length - 1]);
	stream.write("\n");
}
