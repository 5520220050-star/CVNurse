// All CV storage actions for the Mini App: bootstrap, get, save, remove, prefs
import { db, EndpointError } from 'sdk';
import { eq, and, desc } from 'sdk/db';
import { users, cvs } from '../schema.js';
import { MAX_CVS_PER_USER, MAX_CV_BYTES } from '../lib/config.js';

const ID_RE = /^[a-z0-9]{4,24}$/i;

async function listCvs(userId) {
  return await db.select({ id: cvs.id, title: cvs.title, updated: cvs.updated })
    .from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.updated)).all();
}

async function getOwn(userId, id) {
  if (!ID_RE.test(String(id || ''))) throw new EndpointError('Bad id', { code: 'BAD_ID' });
  const row = await db.select().from(cvs).where(and(eq(cvs.id, id), eq(cvs.userId, userId))).get();
  return row;
}

export default async function (input, ctx) {
  const user = ctx.initData && ctx.initData.user;
  if (!user) throw new EndpointError('No user', { code: 'NO_USER' });
  const uid = user.id;
  const action = input && input.action;

  if (action === 'bootstrap') {
    let u = await db.select().from(users).where(eq(users.id, uid)).get();
    if (!u) {
      const lang = input.lang === 'ar' || input.lang === 'en' ? input.lang
        : (String(user.language_code || '').startsWith('ar') ? 'ar' : 'en');
      await db.insert(users).values({ id: uid, lang })
        .onConflictDoUpdate({ target: users.id, set: { lang } }).run();
      u = { id: uid, lang, active: null };
    }
    const list = await listCvs(uid);
    let cv = null;
    const activeId = u.active && list.some((c) => c.id === u.active) ? u.active : (list[0] && list[0].id);
    if (activeId) { const row = await getOwn(uid, activeId); cv = row ? row.data : null; }
    return { lang: u.lang || 'en', active: activeId || null, cvs: list, cv };
  }

  if (action === 'get') {
    const row = await getOwn(uid, input.id);
    if (!row) throw new EndpointError('CV not found', { code: 'NOT_FOUND' });
    await db.update(users).set({ active: row.id }).where(eq(users.id, uid)).run();
    return { cv: row.data };
  }

  if (action === 'save') {
    const cv = input.cv;
    if (!cv || typeof cv !== 'object' || !ID_RE.test(String(cv.id || ''))) throw new EndpointError('Bad CV', { code: 'BAD_CV' });
    const size = JSON.stringify(cv).length;
    if (size > MAX_CV_BYTES) throw new EndpointError('CV is too large (try a smaller photo)', { code: 'TOO_LARGE' });
    const existing = await db.select({ userId: cvs.userId }).from(cvs).where(eq(cvs.id, cv.id)).get();
    if (existing && existing.userId !== uid) throw new EndpointError('Not yours', { code: 'FORBIDDEN' });
    if (!existing) {
      const count = await db.$count(cvs, eq(cvs.userId, uid));
      if (count >= MAX_CVS_PER_USER) throw new EndpointError('Too many CVs — delete one first', { code: 'LIMIT' });
    }
    const title = String(cv.title || 'CV').slice(0, 80);
    const now = Math.floor(Date.now() / 1000);
    await db.insert(cvs).values({ id: cv.id, userId: uid, title, data: cv, updated: now })
      .onConflictDoUpdate({ target: cvs.id, set: { title, data: cv, updated: now } }).run();
    await db.insert(users).values({ id: uid, active: cv.id })
      .onConflictDoUpdate({ target: users.id, set: { active: cv.id } }).run();
    return { ok: true, updated: now };
  }

  if (action === 'remove') {
    const row = await getOwn(uid, input.id);
    if (row) await db.delete(cvs).where(and(eq(cvs.id, row.id), eq(cvs.userId, uid))).run();
    return { ok: true, cvs: await listCvs(uid) };
  }

  if (action === 'prefs') {
    const set = {};
    if (input.lang === 'ar' || input.lang === 'en') set.lang = input.lang;
    if (input.active && ID_RE.test(input.active)) set.active = input.active;
    if (Object.keys(set).length) {
      await db.insert(users).values(Object.assign({ id: uid }, set))
        .onConflictDoUpdate({ target: users.id, set }).run();
    }
    return { ok: true };
  }

  throw new EndpointError('Unknown action', { code: 'BAD_ACTION' });
}
