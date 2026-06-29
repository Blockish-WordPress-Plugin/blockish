### `blockish/video`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `sourceType` | Option | `{"label":"YouTube","value":"youtube"}` | `YouTube`/`youtube` · `Vimeo`/`vimeo` · `Self-hosted`/`selfHosted` |
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
| `lazyLoad` | Scalar (boolean) | `true` | |
| `startTime` | Scalar (number, seconds) | `0` | |
| `endTime` | Scalar (number, seconds) | `0` | `0` = play to end |
| `captions` | Scalar (boolean) | `false` | |
| `privacyMode` | Scalar (boolean) | `false` | YouTube no-cookie domain |
| `suggestedVideos` | Option | `{"label":"Current Channel","value":"currentChannel"}` | `Current Channel`/`currentChannel` · `Any Video`/`anyVideo` |
| `videoAspectRatio` | Option | `{"label":"16:9","value":"16 / 9"}` | `Auto`/`"auto"` · `16:9`/`"16 / 9"` · `4:3`/`"4 / 3"` · `1:1`/`"1 / 1"` · `21:9`/`"21 / 9"` — note `value` uses a spaced `" / "`, not a bare `/` |
| `showOverlay` | Scalar (boolean) | `false` | |
| `overlayImage` | Image | unset | |
| `showOverlayPlayIcon` | Scalar (boolean) | `true` | |
| `videoCSSFilters` | Stringified-JSON (CSS Filters) | unset | |

Minimal schema:
```json
{
  "name": "blockish/video",
  "attributes": { "sourceType": { "label": "YouTube", "value": "youtube" }, "youtubeUrl": "https://www.youtube.com/watch?v=XXXXX" }
}
```

---

