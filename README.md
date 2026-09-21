<h1 align="center">Terminal Reprint</h1>

<p align="center">
	Efficiently (re)-prints text into your terminal.
	🖨
</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/JoshuaKGoldberg/terminal-reprint/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/terminal-reprint" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/JoshuaKGoldberg/terminal-reprint?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/JoshuaKGoldberg/terminal-reprint/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<a href="http://npmjs.com/package/terminal-reprint" target="_blank"><img alt="📦 npm version" src="https://img.shields.io/npm/v/terminal-reprint?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

```shell
npm i terminal-reprint
```

```ts
import { startPrinter } from "terminal-reprint";

let prints = 1;

using printer = startPrinter(() => [
	"Hello, world! 💖",
	`I have printed: ${prints} time(s).`,
]);

setInterval(() => {
	prints += 1;
	printer.reprint();
}, 1000);
```

<picture>
	<source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/a8368aca-5c5c-428a-83b3-ff5f159f338e" />
	<source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/588883a2-9f80-4bef-ab95-87a82c6ecb02" />
	<img alt="A terminal printing 'Hello, world! 💖' and a count of how many times it has printed, updating every second." src="https://github.com/user-attachments/assets/588883a2-9f80-4bef-ab95-87a82c6ecb02" />
</picture>

## `startPrinter`

Calling `startPrinter` clears the terminal screen, hides the cursor with [`cli-cursor`](http://github.com/sindresorhus/cli-cursor), and prints the lines returned by the provided print function.
It will then update the screen efficiently whenever the return printer's `reprint` method is called.

Printer functions receive a [`PrinterContext`](#printercontext) object.

Created printers are _disposable_: they should be created with a `using` statement.
Upon disposable, they show the cursor again.

### `startPrinter` Options

`startPrinter` accepts either a print function or an object containing:

- `print` _(required)_: the same print function
- `stream` _(optional)_: a writable stream to print to (by default, `process.stdout`)

```ts
using printer = startPrinter({
	print: () => ["Hello, world! 💖"],
	stream: process.stderr,
});

printer.reprint();
```

### `PrinterContext`

The context object provided to print functions contains:

- `columns`: the number of columns in the output stream
- `rows`: the number of rows in the output stream

```ts
using printer = startPrinter((context) => [
	`I have ${context.columns} columns.`,
	`I have ${context.rows} rows.`,
]);

printer.reprint();
```

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 💖

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/terminal-reprint/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/terminal-reprint/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo framework](https://create.bingo).
