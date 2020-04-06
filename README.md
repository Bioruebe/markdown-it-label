# markdown-it-label

> A markdown-it plugin, which adds labels/tags

## Preview

![preview](docs/preview.png)

## Usage

### Install

```bash
npm install markdown-it-label
```

### Enable

```js
const markdown_it = require("markdown-it");
const markdown_it_label = require("markdown-it-label");
const md = markdown_it().use(markdown_it_label, options);
```
### Syntax

```md
#[label_text](color)
```

e.g.

```md
#[important](red)
```

is interpreted as

```html
<p>
    <span class="label" style="background-color: rgb(255, 0, 0); color: white;">
        important
    </span>
</p>
```

#### Colors

Colors can be specified in the following ways:

- [Color names](https://www.w3schools.com/colors/colors_names.asp): `red`, `gold`,  `WhiteSmoke`
- Hex colors: `#FF0000`, `#F5F5F5`
- Shorthand hexadecimal form: `#000`, `#09C`

The background color is set automatically based on the brightness of the background. Dark and light text colors can be set via options object.

### Example CSS

```css
.mdi-label {
    padding: .2em .6em .3em;
    font-size: 75%;
    font-weight: 700;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25em;
}

.mdi-label-text-light {
    color: white
}

.mdi-label-text-dark {
    color: #332900
}
```



## Options

###### Default values

```json
{
	cssClassLabel: "mdi-label",
	cssClassTextLight: "mdi-label-text-light",
	cssClassTextDark: "mdi-label-text-dark"
}
```

###### cssClassLabel

The class to assign to the `span` element. Useful for styling the label.

###### cssClassTextLight, cssClassTextDark

The CSS class to be used for the label text. Which of the two is used depends on the background color and is chosen automatically to ensure proper contrast.

