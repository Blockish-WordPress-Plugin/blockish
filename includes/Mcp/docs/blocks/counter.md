### `blockish/counter`

An animated counting number. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `startNumber` | Scalar (number) | `0` | |
| `endNumber` | Scalar (number) | `100` | |
| `numberPrefix` | Scalar (string) | `""` | |
| `numberSuffix` | Scalar (string) | `""` | |
| `animationDuration` | Scalar (number, seconds) | `2` | |
| `thousandSeparator` | Scalar (boolean) | `true` | `true` → `1,000`; `false` → `1000` |
| `separator` | Option | `{"label":"Default","value":"default"}` | Only shown/used when `thousandSeparator` is `true`. Options: `[{"label":"Default (,)","value":"default"},{"label":"Dot (.)","value":"dot"},{"label":"Space","value":"space"},{"label":"Underscore (_)","value":"underscore"},{"label":"Apostrophe (')","value":"apostrophe"}]` |
| `title` | Scalar (string) | `"Cool Number"` | |
| `titleTag` | Option | `{"label":"H3","value":"h3"}` | Options: `[{"label":"H1","value":"h1"},{"label":"H2","value":"h2"},{"label":"H3","value":"h3"},{"label":"H4","value":"h4"},{"label":"H5","value":"h5"},{"label":"H6","value":"h6"},{"label":"P","value":"p"},{"label":"Span","value":"span"},{"label":"Div","value":"div"}]` |
| `titlePosition` | Scalar (string) | `"before"` | `"before"` (above number) `"after"` (below) `"start"` (left, in a row) `"end"` (right, in a row) — `"start"`/`"end"` also enable `titleVerticalAlignment` |
| `titleHorizontalAlignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-counter-title-horizontal: {{VALUE}};` |
| `titleVerticalAlignment` | Responsive | `{"Desktop":"center"}` | `"top"` `"center"` `"bottom"` <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-counter-title-vertical: {{VALUE}};` |
| `titleGap` | Responsive | `{"Desktop":"8px"}` | <br>**CSS:** `.{{WRAPPER}} .blockish-counter__inner` -> `gap: {{VALUE}};` |
| `numberPosition` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}} .blockish-counter__number` -> `align-self: {{VALUE}};` |
| `numberTextColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-counter__number` -> `color: {{VALUE}};` |
| `numberTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-counter__number` |
| `titleTextColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-counter__title` -> `color: {{VALUE}};` |
| `titleTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-counter__title` |

Minimal schema:
```json
{
  "name": "blockish/counter",
  "attributes": { "endNumber": 500, "numberSuffix": "+", "title": "Happy Clients" }
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- Data attributes configure the frontend JavaScript animation -->
<div class="blockish-counter is-title-[titlePosition]" data-blockish-counter="true" data-start-number="..." data-end-number="..." data-animation-duration="..." data-thousand-separator="..." data-separator-type="..." data-prefix="..." data-suffix="..." data-decimals="...">
  <div class="blockish-counter__inner">
    
    <!-- Title is rendered HERE if titlePosition is 'before' or 'start' -->
    <!-- Tag depends on `titleTag` (default h3) -->
    <h3 class="blockish-counter__title">Cool Number</h3>

    <span class="blockish-counter__number">
      <span data-counter-value class="blockish-counter__number-value">
        <!-- Initial value rendered here (startNumber formatted with prefix/suffix) -->
        0
      </span>
    </span>

    <!-- Title is rendered HERE if titlePosition is 'after' or 'end' -->
    <h3 class="blockish-counter__title">Cool Number</h3>
    
  </div>
</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-counter {
	--blockish-counter-title-horizontal: center;
	--blockish-counter-title-vertical: center;

	.blockish-counter__inner {
		display: flex;
		gap: 8px;
	}

	&.is-title-before .blockish-counter__inner {
		flex-direction: column;
		align-items: var(--blockish-counter-title-horizontal);
	}

	&.is-title-after .blockish-counter__inner {
		flex-direction: column;
		align-items: var(--blockish-counter-title-horizontal);
	}

	&.is-title-start .blockish-counter__inner {
		flex-direction: row;
		justify-content: var(--blockish-counter-title-horizontal);
		align-items: var(--blockish-counter-title-vertical);
	}

	&.is-title-end .blockish-counter__inner {
		flex-direction: row;
		justify-content: var(--blockish-counter-title-horizontal);
		align-items: var(--blockish-counter-title-vertical);
	}

	.blockish-counter__number,
	.blockish-counter__title {
		margin: 0;
	}

	.blockish-counter__number {
		font-size: 44px;
		font-weight: 600;
		line-height: 1.15;
		text-align: center;
	}

	.blockish-counter__number-value {
		display: inline-block;
		white-space: nowrap;
	}

	.blockish-counter__title {
		line-height: 1.3;
	}
}
```



