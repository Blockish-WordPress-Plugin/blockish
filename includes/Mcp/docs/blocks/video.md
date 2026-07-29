### `blockish/video`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `sourceType` | Option | `{"label":"YouTube","value":"youtube"}` | Options: `[{"label":"YouTube","value":"youtube"},{"label":"Vimeo","value":"vimeo"},{"label":"Self-hosted","value":"selfHosted"}]` |
| `youtubeUrl` | Scalar (string, URL) | demo placeholder | Always override |
| `vimeoUrl` | Scalar (string, URL) | demo placeholder | Always override |
| `selfHostedVideo` | Image (video file) | unset | |
| `selfHostedUrl` | Scalar (string, URL) | unset | Fallback if no media object |
| `poster` | Scalar (string, URL) | unset | |
| `autoplay` | Scalar (boolean) | `false` | |
| `loop` | Scalar (boolean) | `false` | |
| `muted` | Scalar (boolean) | `false` | Set `true` if `autoplay` is `true` |
| `playOnMobile` | Scalar (boolean) | `true` | |
| `controls` | Scalar (boolean) | `true` | |
| `preload` | Scalar (string) | `"metadata"` | `"none"` `"metadata"` `"auto"` — self-hosted only |
| `lazyLoad` | Scalar (boolean) | `false` | Embeds get `loading="lazy"`; self-hosted defers the file until the player scrolls into view (poster still loads) |
| `startTime` | Scalar (number, seconds) | `0` | |
| `endTime` | Scalar (number, seconds) | `0` | `0` = play to end |
| `captions` | Scalar (boolean) | `false` | |
| `privacyMode` | Scalar (boolean) | `false` | YouTube no-cookie domain |
| `suggestedVideos` | Option | `{"label":"Current Channel","value":"currentChannel"}` | Options: `[{"label":"Current Channel","value":"currentChannel"},{"label":"Any Video","value":"anyVideo"}]` |
| `videoAspectRatio` | Option | `{"label":"16:9","value":"16 / 9"}` | Options: `[{"label":"Auto","value":"auto"},{"label":"16:9","value":"16 / 9"},{"label":"4:3","value":"4 / 3"},{"label":"1:1","value":"1 / 1"},{"label":"21:9","value":"21 / 9"}]` — note `value` uses a spaced `" / "`, not a bare `/` <br>**CSS:** `.{{WRAPPER}} .blockish-video-player` -> `aspect-ratio: {{VALUE}};` |
| `showOverlay` | Scalar (boolean) | `false` | |
| `overlayImage` | Image | unset | |
| `showOverlayPlayIcon` | Scalar (boolean) | `true` | |
| `videoCSSFilters` | Stringified-JSON (CSS Filters) | unset | <br>**CSS:** Uses `BlockishCSSFilters` on `.{{WRAPPER}} .blockish-video, .{{WRAPPER}} .components-sandbox, .{{WRAPPER}} .blockish-video-sandbox` |

Minimal schema:
```json
{
  "name": "blockish/video",
  "attributes": { "sourceType": { "label": "YouTube", "value": "youtube" }, "youtubeUrl": "https://www.youtube.com/watch?v=XXXXX" }
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<figure class="blockish-video-wrapper">
  
  <!-- `is-aspect-auto` class added if videoAspectRatio is 'auto' -->
  <div class="blockish-video-player [is-aspect-auto]">
    
    <!-- IF `sourceType` is 'selfHosted': -->
    <video class="blockish-video" src="..." controls autoplay loop muted preload="metadata" poster="..."></video>
    
    <!-- IF `sourceType` is 'youtube' or 'vimeo': -->
    <iframe class="blockish-video blockish-video-iframe" src="..." title="Embedded video" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>
    
    <!-- IF `showOverlay` is true, an image is set, and autoplay is false: -->
    <!-- Used by `view.js` to handle click-to-play with overlay -->
    <button type="button" class="blockish-video-overlay" style="background-image: url(...)" aria-label="Play video" data-blockish-video-overlay="true">
      <!-- Renders if `showOverlayPlayIcon` is true -->
      <span class="blockish-video-overlay-play-icon" aria-hidden="true"></span>
    </button>
    
  </div>

</figure>
```

**Base CSS (`style.scss`):**
```scss
.blockish-video-wrapper {
	margin: 0;

	.blockish-video-player {
		position: relative;
		width: 100%;
		max-width: 100%;
		aspect-ratio: 16 / 9;
		line-height: 0;
	}

	.blockish-video-player.is-aspect-auto {
		min-height: 360px;
	}

	.blockish-video {
		width: 100%;
		max-width: 100%;
		height: auto;
		border: 0;
	}

	video.blockish-video,
	.blockish-video-iframe {
		height: 100%;
	}

	.blockish-video-sandbox,
	.components-sandbox {
		display: block;
		width: 100%;
		height: 100%;
	}

	.blockish-video-iframe {
		min-height: 360px;
	}

	.blockish-video-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		pointer-events: auto;
		cursor: pointer;
	}

	.blockish-video-overlay.is-hidden {
		display: none;
	}

	.blockish-video-overlay-play-icon {
		--blockish-video-overlay-play-icon-size: 16px;
		width: 68px;
		height: 48px;
		border-radius: 12px;
		background: rgb(0 0 0 / 72%);
		position: relative;
	}

	.blockish-video-overlay-play-icon::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		transform: translate(-40%, -50%);
		border-top: calc(var(--blockish-video-overlay-play-icon-size) * 0.625) solid transparent;
		border-bottom: calc(var(--blockish-video-overlay-play-icon-size) * 0.625) solid transparent;
		border-left: var(--blockish-video-overlay-play-icon-size) solid #fff;
	}
}
```
