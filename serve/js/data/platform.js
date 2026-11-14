// Where this copy of the game is running. The same code ships to the website, to itch.io, to web game portals and to
// the Android and iPhone apps; this file is the one place that says how they differ.
//   web      the website: Stripe checkout, sign-in when it is set up
//   itch     itch.io: nothing is sold, no sign-in
//   portal   a web game portal such as CrazyGames: nothing is sold, no sign-in, no links that leave the portal
//   ios / android   the store apps: the store's own billing, sign-in when it is set up
// dev/package.mjs sets window.SERVE_PLATFORM in the page it builds for itch and portals. The apps are recognised by
// Capacitor, and they reach native features through window.ServeNative (built from serve-app/src/native.js).
const g = typeof globalThis !== 'undefined' ? globalThis : {};
const cap = g.Capacitor;
const forced = typeof g.SERVE_PLATFORM === 'string' ? g.SERVE_PLATFORM : '';
export const PLATFORM = ['web', 'itch', 'portal', 'ios', 'android'].includes(forced) ? forced
  : cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform() ? cap.getPlatform() : 'web';
export const IS_APP = PLATFORM === 'ios' || PLATFORM === 'android';
// who takes the money: 'stripe' on the website, 'native' in the store apps, 'none' where nothing is sold
export const STORE = PLATFORM === 'web' ? 'stripe' : IS_APP ? 'native' : 'none';
export const STORE_NAME = PLATFORM === 'ios' ? 'the App Store' : PLATFORM === 'android' ? 'Google Play' : 'Stripe';
// links that leave the game (share links, friend battles) are not allowed on portals
export const CAN_LINK_OUT = PLATFORM !== 'portal';
export const PUBLIC_URL = 'https://looksmap.github.io/serve/';
// The address a shared link should start with. Only the website can use its own address: the others run from an
// address that nobody else can open.
export function publicBase() {
  if (PLATFORM !== 'web' || typeof location === 'undefined') return PUBLIC_URL;
  const u = new URL(location.href); u.search = ''; u.hash = ''; return u.toString();
}
export const native = () => (IS_APP && g.ServeNative) || null;
