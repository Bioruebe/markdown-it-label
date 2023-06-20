import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";

import cssColorNames from "css-color-names";
import StateInline from "markdown-it/lib/rules_inline/state_inline";


export const defaultOptions = {
	/** The class to assign to the span element. Useful for styling the label. */
	cssClassLabel: "mdi-label",

	/**
	 * The CSS class to be used for light label texts.
	 * 
	 * Whether the light or dark class is used depends on the background color
	 * and is chosen automatically to ensure proper contrast.
	 */
	cssClassTextLight: "mdi-label-text-light",

	/**
	 * The CSS class to be used for dark label texts.
	 * 
	 * Whether the light or dark class is used depends on the background color
	 * and is chosen automatically to ensure proper contrast.
	 */
	cssClassTextDark: "mdi-label-text-dark"
};

export type MarkdownItLabelOptions = typeof defaultOptions;
type ColorArray = [number, number, number];


function renderLabel(options: MarkdownItLabelOptions) {
	return function renderLabelToken(tokens: Token[], idx: number, _options: MarkdownIt.Options, env: any) {
		let token = tokens[idx];

		const formatColor = ([r, g, b]: ColorArray) => `rgb(${r}, ${g}, ${b})`;
		const labelColor = token.meta.color ?? parseLabelColor(env.labels[token.meta.text]) ?? [128, 128, 128];

		let textColorClass = getContrastColor(labelColor, options.cssClassTextLight, options.cssClassTextDark);

		// If the text color class is empty, make sure there is no trailing space inside the 'class' tag
		if (textColorClass.length > 0) textColorClass = " " + textColorClass;

		return `<span class="${options.cssClassLabel}${textColorClass}" style="background-color: ${formatColor(labelColor)}">`;
	}
}

// https://www.w3.org/TR/AERT#color-contrast
function getContrastColor([r, g, b]: ColorArray, light: string, dark: string) {
	let brightness = Math.round((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (brightness > 128)? dark: light;
}

function parseLabel(state: StateInline, silent: boolean) {
	let max = state.posMax;
	let start = state.pos;

	if (state.src.charCodeAt(start) !== 0x23/* # */) return false;
	if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) return false;

	let labelStart = state.pos + 2;
	let labelEnd = state.md.helpers.parseLinkLabel(state, labelStart, true);

	// Parser failed to find ']', so it's not a valid label
	if (labelEnd < 0) return false;
	let pos = labelEnd + 1;

	// Opening bracket
	if (pos >= max || state.src.charCodeAt(pos) !== 0x28/* ( */) return false;

	// [label]( <color> )
	//         ^ skipping these spaces
	for (; pos < max; pos++) {
		let code = state.src.charCodeAt(pos);
		if (!state.md.utils.isSpace(code) && code !== 0x0A/* \n */) break;
	}
	if (pos >= max) return false;

	// [label]( <color> )
	//          ^^^^^^^ Parse color
	start = pos;
	let res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
	if (!(pos < max && res.ok)) return false;

	if (!state.env.labels) state.env.labels = {};
	let labelText = state.md.utils.unescapeAll(state.src.slice(labelStart, labelEnd));
	let colorString = res.str;
	
	// Colors only need to be defined once per label. All further labels can use the shorthand [label]().
	// However, the color can be overwritten on a per-label basis.
	let labelColor: ColorArray | undefined;
	if (colorString.length > 0) {
		// Make sure the color is valid
		labelColor = parseLabelColor(colorString);
		if (!labelColor) return false;

		// Only then save the label for shorthand use
		if (!state.env.labels[labelText]) state.env.labels[labelText] = colorString;
	}

	if (!silent) {
		state.pos = labelStart;
		state.posMax = labelEnd;
		let token = state.push("label_tag_open", "span", 1);
		token.meta = {
			text: labelText,
			color: labelColor
		};

		state.md.inline.tokenize(state);

		token = state.push("label_tag_close", "span", -1);
	}

	state.pos = res.pos;
	state.posMax = max;
	return true;
}

function parseLabelColor(colorString: string) {
	if (!colorString) return undefined;

	colorString = colorString.toLowerCase();
	colorString = cssColorNames[colorString as keyof typeof cssColorNames] || colorString;

	const regexRgb = /^#(([\da-f]{3}){1,2})$/;
	let match = colorString.match(regexRgb);
	if (!match) return undefined;

	let hex = match[1];
	let rgb = [0, 0, 0];
	if (hex.length === 3) {
		for (let i = 0; i < 3; i++) {
			rgb[i] = parseInt(hex[i] + hex[i], 16);
		}
	}
	else {
		for (let i = 0; i < 3; i++) {
			rgb[i] = parseInt(hex.substr(i * 2, 2), 16);
		}
	}

	return rgb as ColorArray;
}

/**
 * A markdown-it plugin, which adds labels/tags
 * @param md The markdown-it instance
 * @param options The options for the plugin
 */
export default function labelPlugin(md: MarkdownIt, options: MarkdownItLabelOptions) {
	options = Object.assign({}, defaultOptions, options);

	md.inline.ruler.before("link", "label", parseLabel);
	md.renderer.rules.label_tag_open = renderLabel(options);
};