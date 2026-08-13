### `blockish/video`

Embed YouTube, Vimeo, or self-hosted video. **Accepts children: no.**

> [!WARNING]
> Default `youtubeUrl` / `vimeoUrl` are demo placeholders — always override. Set `muted: true` when `autoplay` is `true`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `sourceType` | Option | Default `{"label":"YouTube","value":"youtube"}`. `youtube` `vimeo` `selfHosted`. |
| `youtubeUrl` | Scalar (URL) | Demo placeholder default — always override. |
| `vimeoUrl` | Scalar (URL) | Demo placeholder default — always override. |
| `selfHostedVideo` | Image (video file) | Media object with `url`. |
| `selfHostedUrl` | Scalar (URL) | Fallback if no media object. |
| `posterImage` | Image | Self-hosted poster media object (`id`, `url`, `type`). |
| `poster` | Scalar (URL) | **Deprecated.** Use `posterImage`. Still read as fallback. |
| `autoplay` | Scalar (bool) | Default `false`. |
| `loop` | Scalar (bool) | Default `false`. |
| `muted` | Scalar (bool) | Default `false`. |
| `playOnMobile` | Scalar (bool) | Default `true` (`playsInline`). |
| `controls` | Scalar (bool) | Default `true`. Ignored for Vimeo embed params. |
| `preload` | Scalar | `"none"` `"metadata"` (default) `"auto"` — self-hosted only. |
| `lazyLoad` | Scalar (bool) | Default `false`. Embeds get `loading="lazy"`; self-hosted defers `src` until near viewport. |
| `startTime` / `endTime` | Scalar (number, seconds) | Default `0`. `endTime: 0` = play to end. |
| `captions` | Scalar (bool) | Default `false`. |
| `privacyMode` | Scalar (bool) | Default `false`. YouTube no-cookie domain. |
| `suggestedVideos` | Option | Default `{"label":"Current Channel","value":"currentChannel"}`. Other value `{"label":"Any Video","value":"anyVideo"}`. |
| `showOverlay` | Scalar (bool) | Default `false`. Requires `overlayImage` and no autoplay. |
| `overlayImage` | Image | Overlay background; also used as self-hosted poster fallback. |
| `showOverlayPlayIcon` | Scalar (bool) | Default `true`. |
| `videoAspectRatio` | Option | Default `{"label":"16:9","value":"16 / 9"}`. Value `"auto"` adds class `is-aspect-auto`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (YouTube source + demo URL):

```html
<figure class="wp-block-blockish-video blockish-video-wrapper">
  <div class="blockish-video-player">
    <iframe class="blockish-video blockish-video-iframe" src="…" title="Embedded video" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>
  </div>
</figure>
```

| When | What changes |
|---|---|
| `sourceType: "selfHosted"` + URL | Child `<video class="blockish-video" …>` instead of iframe. |
| `posterImage` (or deprecated `poster`) | `<video poster="…">`. Prefers `posterImage.url`, then string `poster`, then `overlayImage.url`. |
| `lazyLoad` + self-hosted | No `src`; `data-blockish-video-src` + `data-blockish-video-preload`; `preload="none"`. |
| `lazyLoad` + embed | `loading="lazy"` on iframe. |
| `privacyMode` | No-cookie embed URL + `referrerPolicy` on iframe. |
| `showOverlay` + `overlayImage` (and not autoplay) | Child `<button class="blockish-video-overlay" data-blockish-video-overlay="true" …>` (optional `.blockish-video-overlay-play-icon`). |
| `videoAspectRatio.value: "auto"` | Player class `is-aspect-auto`. |

Style with convert-css against `.blockish-video-wrapper`, `.blockish-video-player`, `.blockish-video`, `.blockish-video-overlay…` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-video-wrapper { margin: 0; }
:where(.blockish-video-wrapper .blockish-video-player) { aspect-ratio: 16 / 9; text-align: center; }
.blockish-video-wrapper .blockish-video-player { line-height: 0; max-width: 100%; position: relative; width: 100%; }
.blockish-video-wrapper .blockish-video-player.is-aspect-auto { min-height: 360px; }
.blockish-video-wrapper .blockish-video { border: 0; height: auto; max-width: 100%; width: 100%; }
.blockish-video-wrapper .blockish-video-iframe,
.blockish-video-wrapper video.blockish-video { height: 100%; }
.blockish-video-wrapper .blockish-video-sandbox,
.blockish-video-wrapper .components-sandbox { display: block; height: 100%; width: 100%; }
.blockish-video-wrapper .blockish-video-iframe { min-height: 360px; }
.blockish-video-wrapper .blockish-video-overlay { align-items: center; background-position: 50%; background-repeat: no-repeat; background-size: cover; border: 0; cursor: pointer; display: flex; inset: 0; justify-content: center; padding: 0; pointer-events: auto; position: absolute; }
.blockish-video-wrapper .blockish-video-overlay.is-hidden { display: none; }
.blockish-video-wrapper .blockish-video-overlay-play-icon { --blockish-video-overlay-play-icon-size: 16px; background: rgba(0, 0, 0, .72); border-radius: 12px; height: 48px; position: relative; width: 68px; }
.blockish-video-wrapper .blockish-video-overlay-play-icon:before { border-bottom: calc(var(--blockish-video-overlay-play-icon-size) * .625) solid transparent; border-left: var(--blockish-video-overlay-play-icon-size) solid #fff; border-top: calc(var(--blockish-video-overlay-play-icon-size) * .625) solid transparent; content: ""; height: 0; left: 50%; position: absolute; top: 50%; transform: translate(-40%, -50%); width: 0; }
```

#### Minimal schema

```json
{
  "name": "blockish/video",
  "attributes": {
    "sourceType": {
      "label": "YouTube",
      "value": "youtube"
    },
    "youtubeUrl": "https://www.youtube.com/watch?v=XXXXX"
  }
}
```
