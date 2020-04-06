/*  eslint-disable camelcase */
const path = require("path");
const generate = require("markdown-it-testgen");
const markdown_it = require("markdown-it");
const assert = require("assert");
const markdown_it_label = require("../");

describe("markdown-it-label", () => {
	const md = markdown_it({
		html: true,
		linkify: true,
		typography: true
	}).use(markdown_it_label);
	generate(path.join(__dirname, "fixtures/label.txt"), {
		header: true
	}, md);
});

describe("markdown-it-label: options - custom css", () => {
	const md = markdown_it({
		html: true,
		linkify: true,
		typography: true
	}).use(markdown_it_label, {
		cssClassLabel: "markdown-tag",
		cssClassTextLight: "color-white",
		cssClassTextDark: "color-black"
	});

	it("Dark text", () => {
		let renderedHtml = md.render("#[label](white)");
		assert.equal(renderedHtml, '<p><span class="markdown-tag color-black" style="background-color: rgb(255, 255, 255)">label</span></p>\n');
	});

	it("Light text", () => {
		let renderedHtml = md.render("#[label](black)");
		assert.equal(renderedHtml, '<p><span class="markdown-tag color-white" style="background-color: rgb(0, 0, 0)">label</span></p>\n');
	});
});

describe("markdown-it-label: options - no light class", () => {
	const md = markdown_it({
		html: true,
		linkify: true,
		typography: true
	}).use(markdown_it_label, {
		cssClassTextLight: ""
	});

	it("Dark text", () => {
		let renderedHtml = md.render("#[label](white)");
		assert.equal(renderedHtml, '<p><span class="mdi-label mdi-label-text-dark" style="background-color: rgb(255, 255, 255)">label</span></p>\n');
	});

	it("Light text", () => {
		let renderedHtml = md.render("#[label](black)");
		assert.equal(renderedHtml, '<p><span class="mdi-label" style="background-color: rgb(0, 0, 0)">label</span></p>\n');
	});
});