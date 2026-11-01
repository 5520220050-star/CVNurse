import { api } from 'sdk';
import { getUser, sendWelcome } from '../lib/users.js';
import { t, langKeyboard, openKeyboard } from '../lib/texts.js';

export default async function (message) {
  if (!message.from || message.chat.type !== 'private') return;
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const user = await getUser(message.from.id);
  const lang = user && user.lang;

  if (text.startsWith('/lang') || ((text.startsWith('/start')) && !lang)) {
    await api.sendMessage({ chat_id: chatId, text: t('en').choose, reply_markup: langKeyboard });
    return;
  }
  if (text.startsWith('/start')) {
    await sendWelcome(chatId, message.from, lang);
    return;
  }
  if (text.startsWith('/help')) {
    await api.sendMessage({ chat_id: chatId, text: t(lang).help, parse_mode: 'HTML', reply_markup: openKeyboard(lang || 'en') });
    return;
  }
  if (!lang) {
    await api.sendMessage({ chat_id: chatId, text: t('en').choose, reply_markup: langKeyboard });
    return;
  }
  await api.sendMessage({ chat_id: chatId, text: t(lang).other, reply_markup: openKeyboard(lang) });
}
