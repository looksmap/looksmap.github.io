// Sign-in and saved progress. A signed-in player's progress is copied to the save server (serve-save) so it comes
// back after a reinstall or on another phone. The game still keeps its own copy on the device and works offline; the
// server copy is a backup that follows the account. Nothing here runs until data/account.js names a save server.
//
// What the server learns: the account's ID from Apple or Google (not the name or email) and the saved progress.
// What this device keeps (localStorage 'serve.account'): the session token, which provider it came from, the number
// of the last saved copy, and whether anything has changed since.
import { ACCOUNT } from '../data/account.js';
import { PLATFORM, IS_APP, native, publicBase } from '../data/platform.js';
import { exportSave, importSave, saveSummary, untouched, subscribe } from './state.js';
import { track } from './track.js';

const KEY = 'serve.account';
const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && typeof v.token === 'string' ? v : null; } catch (e) { return null; } };
const write = (v) => { try { if (v) localStorage.setItem(KEY, JSON.stringify(v)); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ } };
let A = read();
// Whether this device had unsaved changes when the game opened, before anything in this session touched the save.
const dirtyAtOpen = !!A?.dirty;
const api = () => ACCOUNT.api.replace(/\/$/, '');
const watchers = new Set();
const notify = () => { for (const fn of watchers) { try { fn(); } catch (e) { /* a screen that is gone */ } } };
export const onAccount = (fn) => { watchers.add(fn); return () => watchers.delete(fn); };

// Which sign-in buttons to show here. Apple comes first where it is offered.
export function providers() {
  if (!ACCOUNT.api) return [];
  if (ACCOUNT.devLogin) return ['dev'];   // local testing only; the real save server refuses it
  if (PLATFORM === 'ios') return native() ? ['apple', ...(ACCOUNT.googleIosClientId ? ['google'] : [])] : [];
  if (PLATFORM === 'android') return native() && ACCOUNT.googleClientId ? ['google'] : [];
  if (PLATFORM === 'web') return [...(ACCOUNT.appleServiceId ? ['apple'] : []), ...(ACCOUNT.googleClientId ? ['google'] : [])];
  return [];
}
export const accountOn = () => providers().length > 0 || (!!A && !!ACCOUNT.api);
export const account = () => (A ? { provider: A.provider, savedAt: A.savedAt || 0, dirty: !!A.dirty, conflict: A.conflict || null } : null);
export const PROVIDER_NAME = { apple: 'Apple', google: 'Google', dev: 'a test account' };

async function call(path, init = {}) {
  const r = await fetch(api() + path, { ...init, headers: { 'content-type': 'application/json', ...(A?.token ? { authorization: `Bearer ${A.token}` } : {}), ...(init.headers || {}) } });
  let body = null; try { body = await r.json(); } catch (e) { /* no body */ }
  // the session ran out or the account was deleted elsewhere: this device goes back to playing signed out
  if (r.status === 401 && A && path !== '/session') { A = null; write(null); notify(); }
  return { status: r.status, ok: r.ok, body };
}

let adopting = false;
async function pull() {
  const r = await call('/save');
  if (!r.ok || !r.body || typeof r.body.data !== 'string') return false;
  adopting = true;
  let ok = false; try { ok = importSave(r.body.data); } finally { adopting = false; }
  if (!ok || !A) return false;
  A = { ...A, rev: r.body.rev, savedAt: r.body.at, dirty: false, conflict: null }; write(A); notify();
  return true;
}
let pushing = null;
// Sends this device's progress. The server refuses it when the account holds a copy this device has not seen, unless
// `force` says the player chose this device's copy.
export function push(force = false) {
  if (!A) return Promise.resolve({ ok: false });
  if (pushing) return pushing;
  pushing = (async () => {
    try {
      const r = await call('/save', { method: 'PUT', body: JSON.stringify({ rev: A.rev || 0, force, data: exportSave(), summary: saveSummary() }) });
      if (!A) return { ok: false };
      if (r.ok && r.body) { A = { ...A, rev: r.body.rev, savedAt: r.body.at, dirty: false, conflict: null }; write(A); notify(); return { ok: true }; }
      if (r.status === 409 && r.body) { A = { ...A, conflict: { cloud: r.body.summary || null, at: r.body.at || 0 } }; write(A); notify(); return { ok: false, conflict: A.conflict }; }
      return { ok: false };
    } catch (e) { return { ok: false, offline: true }; } finally { pushing = null; }
  })();
  return pushing;
}

// Progress is sent a few seconds after the player stops changing things, at most once every 45 seconds, and again
// when the game goes to the background.
let timer = null; let lastPush = 0;
function schedule() {
  if (timer || !A || A.conflict) return;
  const wait = Math.max(5000, lastPush + 45000 - Date.now());
  timer = setTimeout(() => { timer = null; if (A && A.dirty && !A.conflict) { lastPush = Date.now(); push(); } }, wait);
}
subscribe(() => { if (!A || adopting) return; if (!A.dirty) { A = { ...A, dirty: true }; write(A); } schedule(); });
if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && A && A.dirty && !A.conflict) { lastPush = Date.now(); push(); } });

// After signing in, or when the game opens: work out which copy is the current one. Returns
//   { state: 'saved' }     this device's progress was sent
//   { state: 'restored' }  the account's progress replaced this device's
//   { state: 'same' }      nothing to do
//   { conflict: {...} }    both changed; the player has to choose (resolveConflict)
async function reconcile(meta, firstTime) {
  if (!meta) { const r = await push(true); return r.ok ? { ok: true, state: 'saved' } : { ok: false, text: 'Your progress could not be saved just now. The game will try again.' }; }
  if (!firstTime && meta.rev === A.rev) { if (A.dirty) { const r = await push(); if (r.conflict) return { ok: true, conflict: describeConflict() }; } return { ok: true, state: 'same' }; }
  if (firstTime ? untouched() : !dirtyAtOpen) return (await pull()) ? { ok: true, state: 'restored' } : { ok: false, text: 'Your saved progress could not be loaded just now.' };
  A = { ...A, conflict: { cloud: meta.summary || null, at: meta.at || 0 } }; write(A); notify();
  return { ok: true, conflict: describeConflict() };
}
export const describeConflict = () => (A?.conflict ? { cloud: A.conflict.cloud, at: A.conflict.at, local: saveSummary() } : null);
export async function resolveConflict(keep) {
  if (!A) return { ok: false };
  if (keep === 'cloud') return (await pull()) ? { ok: true, state: 'restored' } : { ok: false, text: 'Your saved progress could not be loaded just now. Try again in a moment.' };
  const r = await push(true);
  return r.ok ? { ok: true, state: 'saved' } : { ok: false, text: 'Your progress could not be saved just now. Try again in a moment.' };
}

let appleReady = null;
const script = (src) => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.async = true; el.onload = res; el.onerror = () => rej(new Error('script')); document.head.appendChild(el); });
async function appleOnWeb() {
  appleReady = appleReady || script('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
  await appleReady;
  window.AppleID.auth.init({ clientId: ACCOUNT.appleServiceId, scope: '', redirectURI: publicBase(), usePopup: true });
  try { const r = await window.AppleID.auth.signIn(); return r?.authorization?.id_token || null; } catch (e) { return null; }
}
// Google only signs in from its own button on the website, so the You tab gives it a place to draw one.
let googleReady = null;
export async function mountGoogleButton(el, onToken) {
  if (PLATFORM !== 'web' || !ACCOUNT.googleClientId || !el) return false;
  googleReady = googleReady || script('https://accounts.google.com/gsi/client');
  try { await googleReady; } catch (e) { googleReady = null; return false; }
  window.google.accounts.id.initialize({ client_id: ACCOUNT.googleClientId, callback: (r) => { if (r && r.credential) onToken(r.credential); } });
  window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 260 });
  return true;
}

// `credential` is the ID token when the caller already has one (the Google button on the website).
export async function signIn(provider, credential) {
  if (!ACCOUNT.api) return { ok: false, text: 'Sign-in is not set up yet.' };
  let idToken = credential || (provider === 'dev' ? 'dev:tester' : null);
  try {
    if (!idToken && IS_APP) {
      const r = await native().signIn(provider, { googleClientId: ACCOUNT.googleClientId, googleIosClientId: ACCOUNT.googleIosClientId });
      if (!r || r.cancelled) return { ok: false, cancelled: true };
      idToken = r.idToken;
    } else if (!idToken && provider === 'apple') idToken = await appleOnWeb();
  } catch (e) { return { ok: false, text: `Sign-in with ${PROVIDER_NAME[provider] || provider} did not finish. Try again in a moment.` }; }
  if (!idToken) return { ok: false, cancelled: true };
  let r;
  try { r = await call('/session', { method: 'POST', body: JSON.stringify({ provider, idToken, platform: PLATFORM }) }); } catch (e) { return { ok: false, text: 'The save server could not be reached. Check your connection and try again.' }; }
  if (!r.ok || !r.body?.token) return { ok: false, text: 'That sign-in was not accepted. Try again in a moment.' };
  A = { token: r.body.token, provider, rev: 0, dirty: true, savedAt: 0, conflict: null }; write(A); notify();
  track('signin', { provider });
  try { return await reconcile(r.body.save || null, true); } catch (e) { return { ok: true, state: 'later' }; }
}

// Called once when the game opens. Quiet unless the account's copy is newer or both copies changed.
export async function accountBoot() {
  if (!A || !ACCOUNT.api) return null;
  if (A.conflict) return { ok: true, conflict: describeConflict() };
  try {
    const r = await call('/save?meta=1');
    if (!A) return { ok: false, signedOut: true };
    if (r.status === 404) return reconcile(null, false);
    if (!r.ok || !r.body) return null;
    return await reconcile(r.body, false);
  } catch (e) { return null; }
}

// Signing out keeps the progress on this device and in the account; it only stops this device from saving to it.
export async function signOut() {
  if (!A) return;
  if (A.dirty && !A.conflict) await push();
  const provider = A.provider;
  A = null; write(null); clearTimeout(timer); timer = null; notify();
  try { const n = native(); if (n) await n.signOut(provider); } catch (e) { /* already signed out there */ }
  try { if (PLATFORM === 'web' && window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect(); } catch (e) { /* not loaded */ }
}
// Deletes the saved copy and the account record on the server. Progress on this device is left alone.
export async function deleteAccount() {
  if (!A) return { ok: false };
  let r; try { r = await call('/account', { method: 'DELETE' }); } catch (e) { return { ok: false, text: 'The save server could not be reached, so nothing was deleted. Try again in a moment.' }; }
  if (!r.ok && r.status !== 401) return { ok: false, text: 'The account could not be deleted just now. Try again in a moment.' };
  const provider = A?.provider;
  A = null; write(null); clearTimeout(timer); timer = null; notify();
  try { const n = native(); if (n && provider) await n.signOut(provider); } catch (e) { /* already signed out there */ }
  track('account_deleted');
  return { ok: true };
}
