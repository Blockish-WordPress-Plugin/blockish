### `blockish/social-icon-item`

Must be a child of `blockish/social-icons`. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `network` | Object | `{"value": "facebook", "label": "Facebook"}` | `facebook` `x` `instagram` `linkedin` `youtube` `pinterest` `tiktok` `github` `dribbble` `behance` `snapchat` `reddit` `whatsapp` `telegram` `discord` |
| `label` | Scalar (string) | `"Facebook"` | Keep in sync with `network` |
| `icon` | Object (Icon) | matches default `network` (Facebook glyph) | Override when changing `network` |
| `officialColor` | Scalar (string) | `"#1877F2"` | Override when changing `network` |
| `link` | Object (Link) | unset | |

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- `Tag` is `a` if `href` exists, otherwise `span` -->
<li class="blockish-social-icon-item" style="--blockish-social-icon-official-color: #1877F2;">
  <a class="blockish-social-icon-item__link" href="..." target="_blank" rel="..." aria-label="Social icon">
    <span class="blockish-social-icon-item__icon" aria-hidden="true">
      <svg width="18" height="18" fill="currentColor">...</svg>
    </span>
  </a>
</li>
```

**Base CSS (`style.scss`):**
```scss
.blockish-social-icon-item {
	line-height: 1;
}

:where(.blockish-social-icon-item) {
	width: 100%;
}
```

**CSS Mapping per Attribute:**
No dynamic CSS selectors defined in block.json.

