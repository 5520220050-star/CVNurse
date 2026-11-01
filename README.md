# CV Builder Bot — Telegram Serverless

A bilingual (English / Arabic) CV builder that runs entirely on **Telegram Serverless** — no server, no Vercel, no external database.

- **Bot** (handlers): language choice, welcome, opens the Mini App.
- **Mini App** (public/): full editor with live preview; builds the PDF on the user's phone.
- **Endpoints**: `cv` saves/loads CVs in the bot's built-in database, `send` delivers the PDF back to the chat.

## Features
- Interface in Arabic or English; every CV field can be filled in **both languages** (the other language is shown as a hint while you type).
- Export **English PDF**, **Arabic RTL PDF**, or **both** at once; also as images; backup/restore as JSON.
- **9 templates**: Modern, Creative, Executive, Compact, Classic, Elegant, Minimal, Timeline, ATS plain.
- Any color (16 presets + color picker), text and page colors.
- 15 English + 13 Arabic Google Fonts, separate heading fonts, text size, line spacing, name size.
- Page size A4/Letter, margins, section spacing, sidebar width/side/style, header alignment.
- 6 section-title styles, date position, bullet symbol, skills/languages as bars, dots, tags, %, or text.
- Photo (shape, size, border), contact icons, page numbers, colored name.
- 14 section types incl. unlimited **custom sections**; reorder, rename, hide, move to sidebar; reorder/duplicate entries.
- Automatic multi-page layout; **Custom CSS** for anything else.
- Several CVs per user (new, from example, duplicate, rename, delete).

## Deploy from your phone (BotFather only)

1. **@BotFather** → choose your bot → **Serverless** → turn it **On**.
2. **Database** → replace `schema.js` with `tgcloud/schema.js` → review → **Apply**.
3. **Library** → create 4 files with the same names and contents:
   `config.js`, `texts.js`, `users.js`, `b64.js` (from `tgcloud/lib/`).
4. **Handlers** → create `message.js` and `callback_query.js` (from `tgcloud/handlers/`).
5. **Endpoints** → create `cv.js` and `send.js` (from `tgcloud/endpoints/`).
6. **Mini App Files** → add `index.html`, `engine.js`, `app.js` (from `public/`).
7. Copy your Mini App address (looks like `https://app123456.tgcloud.ai/`) and paste it into
   **Library → config.js** → `MINI_APP_URL` → **Save**.
8. Optional: **Bot Settings → Configure Mini App** → set the same URL, so the bot profile shows an *Open* button.
9. Send `/start` to your bot.

## Deploy from a computer (CLI)
```
npm install
npx tgcloud login      # CLI access token from BotFather → Serverless → CLI Access
npx tgcloud push
npx tgcloud migrate
```

## Notes
- The PDF is rendered on the device (html-to-image + jsPDF), so Arabic shaping and fonts are always correct. The PDF pages are high-resolution images; on Telegram Desktop the **Print / Save PDF** button produces a PDF with selectable text.
- Limits (in `lib/config.js`): 20 CVs per user, ~900 KB per CV (photo included — photos are auto-cropped and compressed to ~60 KB).
- Commands: `/start`, `/lang`, `/help`.
