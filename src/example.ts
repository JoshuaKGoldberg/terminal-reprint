import { startPrinter } from "./startPrinter.ts";

const printer = startPrinter(() => [
	"a b c d e f g h i j k l m",
	" -> " + performance.now() + " <- ",
	"n o p q r s t u v w x y z",
	"a b c d e f g h i j k l m",
	" -> " + performance.now() + " <- ",
	"n o p q r s t u v w x y z",
]);

setTimeout(() => {
	printer.reprint();
}, 500);
