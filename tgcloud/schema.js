import { table, integer, text, json, index, sql } from 'sdk/db';

// One row per Telegram user
export const users = table('users', {
  id:      integer('id').primaryKey(),          // Telegram user id
  lang:    text('lang'),                        // interface language: 'en' | 'ar'
  active:  text('active'),                      // id of the CV opened last
  created: integer('created_at').default(sql`(unixepoch())`),
});

// Each user can keep several CVs; the whole CV (content + design) is one JSON document
export const cvs = table('cvs', {
  id:      text('id').primaryKey(),
  userId:  integer('user_id').notNull(),
  title:   text('title'),
  data:    json('data'),
  updated: integer('updated_at'),
}, (t) => ({
  byUser: index('idx_cvs_user').on(t.userId),
}));

// Temporary chunks while the Mini App uploads a generated PDF / image
export const uploads = table('uploads', {
  key:     text('key').primaryKey(),            // userId:uid:part
  userId:  integer('user_id').notNull(),
  uid:     text('uid').notNull(),
  part:    integer('part').notNull(),
  data:    text('data').notNull(),              // base64 piece
  created: integer('created_at').default(sql`(unixepoch())`),
}, (t) => ({
  byUpload: index('idx_uploads_uid').on(t.userId, t.uid),
}));
