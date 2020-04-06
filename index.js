// Process #[label text](color)
const cssColors = require("css-color-names");

function label(state, silent) {
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

	// We found the end of the link, and know for a fact it's a valid link;
	// so all that's left to do is to call tokenizer.
	if (!silent) {
		if (!state.env.labels) state.env.labels = {};
		let labelText = state.md.utils.unescapeAll(state.src.slice(labelStart, labelEnd));

		if (res.str.length < 1) res.str = state.env.labels[labelText] || "grey";

		let labelColor = parseLabelColor(res.str);
		if (!labelColor) return false;
		state.env.labels[labelText] = res.str;

		state.pos = labelStart;
		state.posMax = labelEnd;
		let token = state.push("label_tag_open", "span", 1);
		token.attrs = [["color", labelColor]];

		state.md.inline.tokenize(state);

		token = state.push("label_tag_close", "span", -1);
	}

	state.pos = res.pos;
	state.posMax = max;
	return true;
}

function renderLabel(md, options) {
	return function renderLabelToken(tokens, index) {
		let token = tokens[index];

		const formatColor = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
		let labelColor = getAttribute(token.attrs, "color");
		let textColorClass = getContrastColor(labelColor, options.cssClassTextLight, options.cssClassTextDark);

		// If the text color class is empty, make sure there is no trailing space inside the 'class' tag
		if (textColorClass.length > 0) textColorClass = " " + textColorClass;

		return `<span class="${options.cssClassLabel}${textColorClass}" style="background-color: ${formatColor(labelColor)}">`;
	};
}

function getAttribute(attributes, name) {
	if (!attributes || attributes.length < 1) return null;

	for (let att of attributes) {
		if (!att || att.length < 2) continue;

		if (att[0] === name) return att[1];
	}

	return null;
}

function getContrastColor([r, g, b], light, dark) {
	// https://www.w3.org/TR/AERT#color-contrast
	let brightness = Math.round((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (brightness > 128) ? dark : light;
}

function parseLabelColor(colorString) {
	if (colorString === undefined) return undefined;

	colorString = colorString.toLowerCase();
	colorString = cssColors[colorString] || colorString;

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

	return rgb;
}

const defaultOptions = {
	cssClassLabel: "mdi-label",
	cssClassTextLight: "mdi-label-text-light",
	cssClassTextDark: "mdi-label-text-dark"
};

/* eslint-disable camelcase */
module.exports = function labelPlugin(md, options) {
	options = Object.assign({}, defaultOptions, options);

	md.inline.ruler.before("link", "label", label);
	md.renderer.rules.label_tag_open = renderLabel(md, options);
};