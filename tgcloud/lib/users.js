import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { users } from '../schema.js';
import { MINI_APP_URL } from './config.js';
import { t, openKeyboard } from './texts.js';

export async function getUser(id) {
  return await db.select().from(users).where(eq(users.id, id)).get();
}

export async function setLang(id, lang) {
  await db.insert(users).values({ id, lang })
    .onConflictDoUpdate({ target: users.id, set: { lang } }).run();
}

export async function sendWelcome(chatId, from, lang) {
  // Menu button next to the text field opens the Mini App too
  try {
    await api.setChatMenuButton({
      chat_id: chatId,
      menu_button: { type: 'web_app', text: t(lang).menu, web_app: { url: MINI_APP_URL + '?lang=' + lang } },
    });
  } catch (e) { console.warn('menu button', e.description || e.message); }

  const name = (from && from.first_name) ? escapeHtml(from.first_name) : '';
  await api.sendMessage({
    chat_id: chatId,
    text: t(lang).welcome(name),
    parse_mode: 'HTML',
    reply_markup: openKeyboard(lang),
  });
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
