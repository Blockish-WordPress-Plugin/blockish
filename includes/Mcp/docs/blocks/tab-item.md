### `blockish/tab-item`

Must be a child of `blockish/tab`. **Accepts children: yes** (any blocks — this is the panel's content area).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Tab"` | |
| `tabIcon` | Icon | unset | |
| `defaultActive` | Scalar (boolean) | `false` | Set `true` on exactly one item — index must match parent's `defaultActiveTab` |



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- The `data-` attributes are read by `view.js` on the parent `tab` block to dynamically generate the navigation buttons. -->
<!-- `data-default-active` sets whether this panel starts open. -->
<div class="blockish-block-tab-item" data-title="Tab Title" data-icon-path="..." data-icon-viewbox="..." data-default-active="false" role="tabpanel">
  
  <!-- Inner blocks are rendered directly here -->
  ...

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-block-tab-item {
	box-sizing: border-box;
}
```

**CSS Mapping per Attribute:**
No dynamic CSS selectors defined in block.json.
