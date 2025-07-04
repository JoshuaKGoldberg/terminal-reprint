import type { WriteStream } from "node:tty";

export function writeDiffedOutput(
	previous: string[],
	next: string[],
	stream: WriteStream,
) {
	stream.cursorTo(0, 0);

	if (next.length === 0) {
		stream.clearScreenDown();
		return;
	}

	const sharedHeight = Math.min(next.length, previous.length);

	for (let i = 0; i < sharedHeight; i += 1) {
		if (previous[i] !== next[i]) {
			stream.cursorTo(0, i);

			// TODO: Look into clearing just the directions that are changed
			stream.clearLine(0);
			stream.write(next[i]);
		}
	}

	stream.cursorTo(0, sharedHeight);

	if (previous.length < next.length) {
		stream.write(next.slice(previous.length, next.length).join("\n"));
	} else if (previous.length > next.length) {
		stream.clearScreenDown();
	}
}
