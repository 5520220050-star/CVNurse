// Base64 → Uint8Array (the runtime has no Buffer, and atob may not exist)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(256).fill(255);
for (let i = 0; i < ALPHABET.length; i++) LOOKUP[ALPHABET.charCodeAt(i)] = i;
LOOKUP['-'.charCodeAt(0)] = 62; LOOKUP['_'.charCodeAt(0)] = 63;

export function decodeBase64(str) {
  const clean = String(str).replace(/[^A-Za-z0-9+/\-_]/g, '');
  const len = clean.length;
  const out = new Uint8Array(Math.floor((len * 3) / 4));
  let o = 0, buf = 0, bits = 0;
  for (let i = 0; i < len; i++) {
    const v = LOOKUP[clean.charCodeAt(i)];
    if (v === 255) continue;
    buf = (buf << 6) | v; bits += 6;
    if (bits >= 8) { bits -= 8; out[o++] = (buf >> bits) & 0xff; }
  }
  return out.subarray(0, o);
}
