### `blockish/progress-bar`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Progress"` | |
| `titleTag` | Option | `{"label":"H4","value":"h4"}` | Options: `[{"label":"H1","value":"h1"},{"label":"H2","value":"h2"},{"label":"H3","value":"h3"},{"label":"H4","value":"h4"},{"label":"H5","value":"h5"},{"label":"H6","value":"h6"},{"label":"P","value":"p"},{"label":"Span","value":"span"},{"label":"Div","value":"div"}]` |
| `showTitle` | Scalar (boolean) | `true` | |
| `percentage` | Scalar (integer, 0–100) | `50` | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__fill` -> `width: {{VALUE}}%;` |
| `animationDuration` | Scalar (number, seconds) | `2` | |
| `displayPercentage` | Scalar (boolean) | `true` | |
| `innerText` | Scalar (string) | placeholder text | Always override; replaces the percentage label when set |
| `percentageFillColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__fill` -> `background: {{VALUE}};` |
| `percentageBackgroundColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__track` -> `background: {{VALUE}};` |
| `percentageHeight` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__track` -> `height: {{VALUE}};` |
| `percentageBorderRadius` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__track` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` | `.{{WRAPPER}} .blockish-progress-bar__fill` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `titleTextColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__title` -> `color: {{VALUE}};` |
| `innerTextColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-progress-bar__inner-text, .{{WRAPPER}} .blockish-progress-bar__percentage` -> `color: {{VALUE}};` |

Minimal schema:
```json
{
  "name": "blockish/progress-bar",
  "attributes": { "title": "JavaScript", "percentage": 85 }
}
```

---



### Markup & CSS Generation


**Generated HTML Structure:**
```html
<div class="blockish-progress-bar">
  
  <!-- Header is ONLY rendered if `showTitle` is true -->
  <div class="blockish-progress-bar__header">
    <h4 class="blockish-progress-bar__title">Title text</h4>
  </div>

  <div class="blockish-progress-bar__track">
    <!-- Inline styles set `width: 0%` initially, transitionDuration is set by `animationDuration` -->
    <!-- `data-target-percentage` and `data-animation-duration` are used by frontend JS -->
    <div class="blockish-progress-bar__fill" data-target-percentage="50" data-animation-duration="1" style="width: 0%; transition-duration: 1s;">
      
      <!-- `has-percentage` class added if `displayPercentage` is true -->
      <div class="blockish-progress-bar__fill-content has-percentage">
        <span class="blockish-progress-bar__inner-text">Inner text</span>
        
        <!-- Percentage is ONLY rendered if `displayPercentage` is true -->
        <span class="blockish-progress-bar__percentage">50%</span>
      </div>

    </div>
  </div>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-progress-bar {
	.blockish-progress-bar__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 12px;
		margin-bottom: 10px;
	}

	.blockish-progress-bar__title,
	.blockish-progress-bar__percentage {
		margin: 0;
	}

	.blockish-progress-bar__percentage {
		font-weight: 600;
	}

	.blockish-progress-bar__track {
		position: relative;
		overflow: hidden;
		width: 100%;
		height: 25px;
		border-radius: 999px;
		background: #e5e7eb;
	}

	.blockish-progress-bar__fill {
		display: flex;
		align-items: center;
		height: 100%;
		min-width: 0;
		overflow: hidden;
		background: #2563eb;
		transition-property: width;
		transition-duration: 0.3s;
		transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
		will-change: width;
	}

	.blockish-progress-bar__fill-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		max-width: 100%;
		min-width: 0;
		padding-inline: 15px;
		box-sizing: border-box;
		width: 100%;
	}

	.blockish-progress-bar__inner-text {
		min-width: 0;
		flex: 0 1 auto;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #ffffff;
		font-size: 11px;
		line-height: 1;
	}

	.blockish-progress-bar__percentage {
		flex-shrink: 0;
		white-space: nowrap;
		color: #ffffff;
		font-size: 11px;
		line-height: 1;
	}
}
```
