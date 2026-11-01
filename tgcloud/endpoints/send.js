// Receives a generated file from the Mini App in base64 pieces, then sends it to the user's chat.
import { api, db, InputFile, EndpointError } from 'sdk';
import { eq, and, asc, lt } from 'sdk/db';
import { uploads } from '../schema.js';
import { decodeBase64 } from '../lib/b64.js';
import { MAX_FILE_BYTES } from '../lib/config.js';

const TYPES = { pdf: 'application/pdf', jpg: 'image/jpeg', json: 'application/json' };

export default async function (input, ctx) {
  const user = ctx.initData && ctx.initData.user;
  if (!user) throw new EndpointError('No user', { code: 'NO_USER' });
  const userId = user.id;
  const { uid, part, total, data } = input || {};
  if (!/^[a-z0-9]{6,24}$/i.test(String(uid || ''))) throw new EndpointError('Bad upload id', { code: 'BAD_UID' });
  if (!Number.isInteger(part) || !Number.isInteger(total) || total < 1 || total > 80 || part < 0 || part >= total)
    throw new EndpointError('Bad part', { code: 'BAD_PART' });
  if (typeof data !== 'string' || data.length > 600000) throw new EndpointError('Bad chunk', { code: 'BAD_CHUNK' });

  await db.insert(uploads).values({ key: `${userId}:${uid}:${part}`, userId, uid, part, data })
    .onConflictDoUpdate({ target: uploads.key, set: { data } }).run();

  if (part < total - 1) return { ok: true, received: part };

  // last piece: assemble
  const rows = await db.select().from(uploads)
    .where(and(eq(uploads.userId, userId), eq(uploads.uid, uid))).orderBy(asc(uploads.part)).all();
  if (rows.length !== total) throw new EndpointError('Missing pieces, try again', { code: 'INCOMPLETE' });
  const b64 = rows.map((r) => r.data).join('');
  await db.delete(uploads).where(and(eq(uploads.userId, userId), eq(uploads.uid, uid))).run();
  // clean up abandoned uploads older than a day
  await db.delete(uploads).where(lt(uploads.created, Math.floor(Date.now() / 1000) - 86400)).run();

  const bytes = decodeBase64(b64);
  if (!bytes.length || bytes.length > MAX_FILE_BYTES) throw new EndpointError('File too large', { code: 'TOO_LARGE' });

  const ext = input.ext in TYPES ? input.ext : 'pdf';
  const safeName = String(input.name || 'CV').replace(/[\\/:*?"<>|\n\r]+/g, ' ').trim().slice(0, 80) || 'CV';
  const file = new InputFile(bytes, `${safeName}.${ext}`, { type: TYPES[ext] });
  const caption = String(input.caption || '').slice(0, 900);

  if (input.kind === 'photo') {
    await api.sendPhoto({ chat_id: userId, photo: file, caption });
  } else {
    await api.sendDocument({ chat_id: userId, document: file, caption });
  }
  return { ok: true, sent: true, size: bytes.length };
}
