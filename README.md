
## btn

## Usage

```js
const { btn, sendButtons, sendButtonsSafe, sendInappSignup, sendButtonV2, ButtonV2, sendAIRich, createAIRich, AIRich, isIOSDevice } = require('keithbtn')

// Build one or more buttons with the btn.* helpers
const buttons = [
	btn.url('Visit Site', 'https://example.com'),
	btn.copy('Copy Code', 'PROMO2024'),
	btn.call('Call Us', '15551234567'),
	btn.reply('Quick Reply', 'reply-id-1'),
	btn.reminder('Set Reminder', 'reminder-id-1'),
	btn.cancelReminder('Cancel Reminder', 'reminder-id-1'),
	btn.address('Send Address', 'address-id-1'),
	btn.location(),
	btn.list('Choose an option', [
		{
			title: 'Section 1',
			rows: [{ title: 'Option A', rowId: 'opt-a' }]
		}
	]),
	btn.inappSignup() // config_id is optional -- omit it to send an empty buttonParamsJson: "{}"
]

// Send an interactive/native-flow message with buttons
await sendButtons(sock, jid, {
	text: 'Choose an option below',
	footer: 'Powered by keithbtn',
	title: 'Header title',
	subtitle: 'Header subtitle',
	buttons
})

// Or use the dedicated In-App Signup helper, which auto-falls-back to plain
// text on iOS/SMB-iOS (no separate device check needed):
await sendInappSignup(sock, jid, {
	text: 'Sign up in-app to continue',
	title: 'MyBot',
	subtitle: 'v1',
	footer: 'In-app signup'
	// config_id: 'YOUR_META_CONFIG_ID', // optional
	// extra: { flow: 'default' }        // optional, merged into buttonParamsJson
})

// Send safely -- falls back to a plain text message on iOS/SMB-iOS devices
// where native flow buttons aren't supported
await sendButtonsSafe(sock, jid, {
	text: 'Choose an option below',
	buttons
})

// Check if the connected device is iOS/SMB-iOS
if (isIOSDevice(sock)) {
	console.log('This device does not support interactive buttons')
}

// Send a classic buttonsMessage (headerType/quick-reply style) using the
// in-package ButtonV2 builder -- no toxic-baileys dependency needed
await sendButtonV2(sock, jid, {
	text: 'Pick an option below',
	footer: 'Powered by keithbtn',
	buttons: [
		{ displayText: 'Option A', buttonId: 'opt_a' },
		'Option B (auto id)',
		{ raw: { buttonId: 'raw_1', buttonText: { displayText: 'Raw Button' }, type: 1 } }
	],
	// optional: thumbnail (url/buffer), media (raw setMedia payload),
	// location: { thumbnail, name, address }, contextInfo, mentions, quoted
})

// Send an AI-rich response (bot-style message mixing text, code, tables,
// sources, tips, and suggestion pills) using the in-package AIRich builder
// -- no toxic-baileys dependency needed
await sendAIRich(sock, jid, [
	{ type: 'text', text: 'Here is a quick summary:' },
	{ type: 'code', language: 'javascript', code: 'console.log("hi")' },
	{ type: 'table', rows: [['Name', 'Score'], ['Alice', '90']] },
	{ type: 'tip', text: 'Tip: you can ask follow-up questions.' },
	{ type: 'suggest', suggestion: ['Tell me more', 'Show an example'] }
], {
	title: 'keithbtn bot',
	footer: 'Powered by keithbtn'
})

// Or use the raw builder directly for full manual chaining/control
const rich = createAIRich(sock)
await rich
	.setTitle('keithbtn bot')
	.addText('Chained call works too')
	.addSource(['https://icon.png', 'https://example.com', 'Example'])
	.send(jid)
```

### `btn` builders

| Builder | Signature | Description |
| --- | --- | --- |
| `btn.url` | `(display_text, url, merchant_url?)` | Button that opens a URL |
| `btn.copy` | `(display_text, copy_code)` | Button that copies text to clipboard |
| `btn.call` | `(display_text, phone_number)` | Button that dials a phone number |
| `btn.reply` | `(display_text, id)` | Quick reply button |
| `btn.reminder` | `(display_text, id)` | Sets a reminder |
| `btn.cancelReminder` | `(display_text, id)` | Cancels a reminder |
| `btn.address` | `(display_text, id)` | Requests an address message |
| `btn.location` | `(options?)` | Requests a location |
| `btn.list` | `(list_button_text, sections)` | Single-select list message |
| `btn.inappSignup` | `(config_id?, extra?)` | Meta Embedded Signup button. `config_id` is optional -- omit it (or call with no args) to send an empty `buttonParamsJson: "{}"`. |

### Functions

- `sendButtons(sock, jid, options)` - sends an interactive/native-flow message. `options` accepts `text`, `footer`, `title`, `subtitle`, `buttons` (or `interactiveButtons`), `contextInfo`, and `quoted`.
- `sendInteractiveMessage` - alias of `sendButtons`.
- `sendButtonsSafe(sock, jid, options)` - same as `sendButtons`, but sends a plain text message instead on iOS/SMB-iOS devices, which don't render native flow buttons.
- `isIOSDevice(sock)` - returns `true` if the connected socket's device platform is `ios` or `smbi`.
- `sendInappSignup(sock, jid, options)` - sends an In-App Signup interactive button, falling back to plain text on iOS/SMB-iOS automatically (no separate device check needed). `options` accepts `text`, `title`, `subtitle`, `footer`, `config_id` (optional), `extra` (optional, merged into the button's `buttonParamsJson`), `contextInfo`, and `quoted`.
- `sendButtonV2(sock, jid, options)` - sends a classic `buttonsMessage` using the in-package `ButtonV2` builder (ported from toxic-baileys, no dependency on it). `options` accepts `text`, `footer`, `buttons` (array of strings, `{ displayText, buttonId }`, or `{ raw: {...} }`), `thumbnail`, `media`, `location`, `contextInfo`, `mentions`, and `quoted`.
- `ButtonV2` - the underlying builder class, exported for manual chaining: `new ButtonV2(sock, { generateWAMessageFromContent }).setBody(...).addButton(...).send(jid)`.
- `sendAIRich(sock, jid, blocks, options)` - sends a bot-style AI-rich response using the in-package `AIRich` builder. `blocks` is an ordered array of `{ type, ... }` objects — supported types: `text`, `code`, `table`, `image`, `video`, `source`, `reels`, `product`, `post`, `tip`, `metadata`, `suggest`, `widget`, `footerAction`, `submessage`, `section`. Each block accepts an `options` object passed straight to the underlying `add*` method — most support `{ id, replace, insertAt }` for later editing/reordering. Top-level `options` accepts `title`, `footer`, `contextInfo`, `quoted`, `forwarded`, and `notification`.

> **Important note on message shape:** `richResponseMessage` is sent nested inside `botForwardedMessage.message` (the original NIXCODE shape) -- this is the *correct* structure, confirmed against the real WAProto schema and against `keithbaileys`'s own native rich-message builder (`lib/Utils/rich-messages.js`), which uses the identical nesting. If your AIRich messages send with no error but nothing renders, the actual cause is very likely that your `keithbaileys` (or other Baileys fork) install ships a compiled `WAProto/index.js` that's stale relative to its own `.proto` source, missing `Message.botForwardedMessage` and/or `AIRichResponseMessage.contextInfo` -- see "Known keithbaileys issue" below. `send()`/`buildEdit()` route through `generateWAMessageFromContent` and `generateMessageIDV2` so every message gets a proper `messageId` and consistent protobuf encoding.
- `createAIRich(sock)` - returns a raw `AIRich` builder instance for manual method chaining (`.addText()`, `.addCode()`, `.addTable()`, `.addSource()`, `.addReels()`, `.addProduct()`, `.addPost()`, `.addTip()`, `.addWidget()`, `.addFooterAction()`, `.addSuggest()`, `.send()`, etc.) when `sendAIRich`'s flat block format isn't flexible enough. Also supports id-based content addressing (`assignId(index, id)`, `peek(id)`, `hasId(id)`, `getIds()`, `delete(id)`, and passing `{ id, replace, insertAt }` to most `add*` calls) and editing an already-sent message in place (`.sendEdit(jid, messageId)`).
- `AIRich` - the underlying builder class, exported directly for `new AIRich(sock)` if you'd rather not go through the factory.
- `AIRichError`, `ItemNotFoundError`, `DuplicateIdError`, `InvalidTargetError`, `ContentValidationError` - error classes thrown by `AIRich`'s id-based content addressing (each has a `.code` and relevant metadata).

> `sendButtons`/`sendButtonsSafe`/`sendButtonV2`/`ButtonV2`/`sendAIRich`/`createAIRich`/`AIRich` all require a Baileys-compatible socket (`keithbaileys`) as `sock` — they only need standard, cross-fork Baileys plumbing (`generateWAMessageFromContent`, `prepareWAMessageMedia`, `generateMessageIDV2`, `sock.waUploadToServer`), not any specific fork by name. No third-party builder library (`toxic-baileys` or otherwise) is a dependency of this package — `ButtonV2` and `AIRich` are self-contained, living under `lib/` and `lib/ai-rich/` respectively.
> `AIRich`'s implementation is adapted from the NIXCODE WhatsApp Interactive Message Builder by Nixel (used and modified per its license; the original watermark is preserved at the top of `lib/ai-rich/airich.js`). `unifiedResponse.data` is sent as a raw `Buffer` for its `bytes`-typed field (universally correct for any protobuf implementation; a base64 string, as the original and keithbaileys' own builder use, also works with protobufjs specifically, but that relies on protobufjs-specific auto-decoding behavior rather than the protobuf spec itself). One feature was intentionally not carried over: a method that fabricated a fake cryptographic signature/certificate chain to make outgoing messages appear to carry a legitimate verification proof they don't actually have — that method and its call site were removed entirely.

### Known `keithbaileys` issue: stale compiled WAProto

Some `keithbaileys` builds ship a `WAProto/index.js` (the compiled protobuf encoder) that's out of sync with their own `WAProto.proto` source -- specifically missing `Message.botForwardedMessage` (field 104) and `AIRichResponseMessage.contextInfo` (field 4), even though both are declared in the `.proto` file. Since the compiled `Message` class doesn't recognize `botForwardedMessage` as a field, `WAProto.Message.create()` silently drops it during encoding -- `sendAIRich`/`AIRich` (and keithbaileys' own native `generateTableContent`/`generateRichMessageContent` etc. in `lib/Utils/rich-messages.js`) will appear to send successfully with no error, but nothing will render on the recipient's device.

**To check if you're affected:**
```js
const { proto } = require('keithbaileys/WAProto')
console.log('botForwardedMessage' in proto.Message.prototype) // should be true
```

**To fix it**, regenerate that package's compiled WAProto from its own `.proto` source (the same command its `WAProto/GenerateStatics.sh` uses):
```bash
cd node_modules/keithbaileys
npm install protobufjs@6.11.4 --no-save   # v6's bundled pbjs targets the v7 runtime keithbaileys uses
./node_modules/.bin/pbjs -t static-module -w commonjs -o WAProto/index.js WAProto/WAProto.proto
./node_modules/.bin/pbts -o WAProto/index.d.ts WAProto/index.js
```
(Using `protobufjs-cli`'s own `pbjs` instead will generate code that targets protobufjs 8, which is incompatible with keithbaileys' protobufjs 7 runtime and will throw `this.ctor is not a constructor` on decode -- stick to protobufjs 6's bundled CLI for a v7-compatible build.) This regenerates the encoder from the current `.proto`, which was verified byte-for-byte identical to the old one for every standard message type, while adding correct support for the missing fields.
> `ButtonV2` optionally uses `sharp` (if installed) to resize thumbnail images to 300x300; without it, thumbnails/media are sent as-is, unresized.
> `AIRich`'s `addVideo`/video-preview features optionally use `sharp` (resizing) and `fluent-ffmpeg` (extracting a still frame from a video buffer); without them, those specific enhancements are skipped rather than throwing. Plain image/video URLs (the common case) don't need either package at all.
