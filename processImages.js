#!/usr/bin/env node
/* eslint-disable no-console */

const { readdir, writeFile } = require('fs');
const { promisify } = require('util');
const zipObject = require('lodash.zipobject');

const handleError = (description) => (error) => {
	console.error(`Encountered an error ${description}.`);
	console.error(error);
	process.exit(error.errno);
};

promisify(readdir)('./extension/manamoji-slack-master/emojis')
	.catch(handleError('reading manamoji files'))
	.then((files) => [files, files])
	.then(([symbols, files]) => (
		[
			symbols
				.map((symbol) => symbol.replace(/mana-(.+)\.png/, '$1'))
				.map((symbol) => symbol.toUpperCase())

				// for 2-letter symbols, add a slash
				.map((symbol) => (
					symbol.length === 2 && Number.isNaN(Number(symbol))
						? `${symbol[0]}/${symbol[1]}`
						: symbol
				)),
			files,
		]
	))
	.then(([symbols, files]) => zipObject(symbols, files))
	.then((object) => JSON.stringify(object))
	.then((json) => `/*eslint-disable*/\n//Generated by processImages.js, do not touch\nconst symbols = ${json};`)
	.catch(handleError('processing manamoji filenames'))
	.then((js) => promisify(writeFile)('./extension/declarative-content/symbols-list.js', js))
	.then(() => console.log('Successfully generated symbol list.'))
	.catch(handleError('writing symbol list'));