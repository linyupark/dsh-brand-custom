# dsh-brand-custom

A pure-UI plugin for the DeepSeek Harness Web UI: replace the brand logo and copy in
the sidebar and in the conversation hero from plugin configuration. It edits nothing
inside the DSH installation — it only occupies official slots and uses the public
locale service API, so DSH upgrades leave it working.

## What it replaces

| Where | Slot / mechanism |
| --- | --- |
| Sidebar logo (expanded row and collapsed rail) | `sidebar.brand.mark` |
| Sidebar name | `sidebar.brand.name` |
| Conversation-hero logo | `conversation.hero.brand.mark` |
| Hero headline (`探索未至之境`) | locale entry `conversation:hero.headline`, through a custom language variant |
| Hero badge (`预览版`) | locale entry `conversation:hero.preview`, through a custom language variant |

Leave any field empty to fall back to the DSH default: an empty logo restores the
built-in fish mark, an empty text restores the shipped copy.

## Install

```sh
dsh plugin --profile <profile> add github:linyupark/dsh-brand-custom
```

Then select the bundle: add `"dsh-brand-custom"` to the `dsh.profile.bundles` array of
the profile's `package.json`, or enable it on **Settings → Plugins**.

For a local checkout, install the one runtime dependency once and link the directory
into the profile:

```sh
git clone git@github.com:linyupark/dsh-brand-custom.git
cd dsh-brand-custom
bun install        # or pnpm install / npm install
```

## Configuration

Edit the row on **Settings → Plugins → dsh-brand-custom** (the form is derived from the
plugin's `Config` schema), or write the `config:` block of this package's
`cordis.patch.yml` / of the profile layer.

| Field | Meaning |
| --- | --- |
| `sidebarLogo` | Sidebar mark. Three forms: inline SVG (starts with `<`), an image address (`https:` / `data:` / `/`), or plain text / emoji |
| `sidebarName` | Sidebar brand name |
| `heroLogo` | Hero mark, same three forms |
| `heroHeadline` | Hero headline |
| `heroBadge` | Hero badge text |
| `languageLabel` | Display name of the custom language in Settings, default `<base language> (自定义)` |

An inline SVG using `currentColor` follows the active theme's text color:

```yaml
sidebarLogo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="5"/></svg>'
```

The configuration reaches the browser through a `webserver/index-inject` global
(`__DSH_BRAND_CUSTOM__`) — the same mechanism the shipped `dsh-client-shortcuts` and
`dsh-client-ui-theme` plugins use — so a page load is required after a change.

## How the hero copy is overridden

`hero.headline` / `hero.preview` live in `ui-conversation`'s own i18n namespace, and the
locale service enforces a single owner per `(namespace, locale)` pair, so a plugin cannot
overwrite those two entries directly. This plugin instead:

1. registers a variant language for the active language, e.g. `zh-x-dsh-brand` with
   fallback `zh`;
2. registers only the two overridden entries under that variant — every other entry falls
   back to the base language;
3. switches the active language preference to the variant.

Intended side effects: **Settings → General → Language** gains one entry (e.g.
`中文 (自定义)`), and the plugin writes the language preference once per page load, so the
choice survives reloads. Picking the plain base language again restores the shipped copy
for that session; a reload switches back. Disabling the plugin removes the variant
language and the preference falls back to the browser-derived locale (the stored id stays
behind, as the locale service documents).

## Slot priority

`sidebar.brand.mark` and `sidebar.brand.name` are `single` slots, and the shipped
`ui-brand-official` occupies them at the default priority `0` in an official build. For a
`single` slot only the **lowest** priority renders, and a second registration at the same
priority throws. This plugin therefore registers at `priority: -1000`
(`OCCUPANT_PRIORITY` in `client.js`): no collision with the official occupant, and it
shadows it deterministically. Dynamic client plugins allocate `-1`, `-2`, … so they never
collide with this value.

## Known limitations

- The hero badge pill itself is drawn by DSH and cannot be hidden, only re-labelled.
- Configuration is injected into the client half at page load, so a change (or installing
  the plugin while the page is already open) needs a reload.
- The browser tab title comes from the build-time `DSH_CLIENT_TITLE` environment variable;
  it is not a UI slot.
- A remote image logo must be reachable from the page; inline SVG is the most robust
  choice and can follow the theme through `currentColor`.

## License

MIT