import { api } from 'sdk';
import { setLang, sendWelcome } from '../lib/users.js';
import { t } from '../lib/texts.js';

export default async function (q) {
  const data = q.data || '';
  if (data.startsWith('lang:')) {
    const lang = data.slice(5) === 'ar' ? 'ar' : 'en';
    await setLang(q.from.id, lang);
    await api.answerCallbackQuery({ callback_query_id: q.id, text: t(lang).langSet });
    if (q.message) {
      try { await api.deleteMessage({ chat_id: q.message.chat.id, message_id: q.message.message_id }); } catch (e) { /* already gone */ }
      await sendWelcome(q.message.chat.id, q.from, lang);
    }
    return;
  }
  await api.answerCallbackQuery({ callback_query_id: q.id });
}
