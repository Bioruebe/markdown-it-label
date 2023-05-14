/// <reference types="vite/client" />

import MarkdownIt from "markdown-it";
import { describe, expect, it, test } from "vitest";

import plugin from "../src";


const mdiOptions = {
	html: true,
	linkify: true,
	typographer: true
}

describe("Options", () => {
	describe("Custom css", () => {
		const md = MarkdownIt(mdiOptions).use(plugin, {
			cssClassLabel: "markdown-tag",
			cssClassTextLight: "color-white",
			cssClassTextDark: "color-black"
		});

		test("Dark text", () => {
			let renderedHtml = md.render("#[label](white)");
			expect(renderedHtml).toEqual('<p><span class="markdown-tag color-black" style="background-color: rgb(255, 255, 255)">label</span></p>\n');
		});

		test("Light text", () => {
			let renderedHtml = md.render("#[label](black)");
			expect(renderedHtml).toEqual('<p><span class="markdown-tag color-white" style="background-color: rgb(0, 0, 0)">label</span></p>\n');
		});
	});

	describe("No light class", () => {
		const md = MarkdownIt(mdiOptions).use(plugin, {
			cssClassTextLight: ""
		});

		test("Dark text", () => {
			let renderedHtml = md.render("#[label](white)");
			expect(renderedHtml).toEqual('<p><span class="mdi-label mdi-label-text-dark" style="background-color: rgb(255, 255, 255)">label</span></p>\n');
		});

		test("Light text", () => {
			let renderedHtml = md.render("#[label](black)");
			expect(renderedHtml).toEqual('<p><span class="mdi-label" style="background-color: rgb(0, 0, 0)">label</span></p>\n');
		});
	})
});