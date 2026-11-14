// The verdict as an image: two figures, two tiers, the result, Ro's line, and the link to the brief. 1080×1350, the
// portrait size TikTok, Reels and Stories keep whole. Shares as a file where the browser allows it, downloads otherwise.
import { track } from '../engine/track.js';
import { publicBase, CAN_LINK_OUT, native } from '../data/platform.js';

const W = 1080, H = 1350;
export function briefLink(levelId, mode = 'normal') { const u = new URL(publicBase()); u.hash = `play/${levelId}${mode && mode !== 'normal' ? '/' + mode : ''}`; return u.toString(); }
function svgImage(svg, w, h) {
  return new Promise((res, rej) => {
    const withNs = svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    const sized = withNs.replace(/<svg ([^>]*?)>/, (m, a) => `<svg ${a.replace(/\s(width|height)="[^"]*"/g, '')} width="${w}" height="${h}">`);
    const img = new Image(); img.onload = () => res(img); img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
  });
}
const TIER_C = { S: '#B5135A', A: '#7A3FBF', B: '#1E7A5E', C: '#7A5208', D: '#55555B' };
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function wrap(ctx, text, x, y, maxW, lh, maxLines = 3) {
  const words = text.split(' '); let line = '', lines = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++lines >= maxLines - 1) break; } else line = t; }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}
export async function verdictCard({ youSvg, themSvg, name, rival, yourTier, theirTier, word, line, brief, link, pim = false }) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#FFD3E6'); bg.addColorStop(0.55, '#FFC4DF'); bg.addColorStop(1, '#FFE9A8'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#B5135A'; ctx.font = 'italic 600 64px "Source Serif 4", Georgia, serif'; ctx.fillText('Serve', 72, 118);
  ctx.fillStyle = 'rgba(42,20,32,.72)'; ctx.font = '600 30px Inter, system-ui, sans-serif'; ctx.fillText(brief.toUpperCase(), 72, 170);
  const panel = (x, y, w, h, tint) => { ctx.save(); rr(ctx, x, y, w, h, 36); ctx.fillStyle = tint; ctx.fill(); ctx.restore(); };
  panel(72, 210, 450, 640, 'rgba(255,255,255,.55)'); panel(558, 210, 450, 640, 'rgba(220,228,255,.55)');
  const figH = 600, figW = pim ? 450 : 300;
  try { const a = await svgImage(youSvg, figW, figH); ctx.drawImage(a, 72 + (450 - figW) / 2, 230, figW, figH); } catch (e) { /* draw without */ }
  try { const b = await svgImage(themSvg, figW, figH); ctx.drawImage(b, 558 + (450 - figW) / 2, 230, figW, figH); } catch (e) { /* draw without */ }
  ctx.textAlign = 'center'; ctx.fillStyle = '#2A1420'; ctx.font = '700 34px Inter, system-ui, sans-serif';
  ctx.fillText(name, 297, 910); ctx.fillText(rival, 783, 910);
  ctx.font = '600 150px "Source Serif 4", Georgia, serif';
  ctx.fillStyle = TIER_C[yourTier] || '#2A1420'; ctx.fillText(yourTier, 297, 1055);
  ctx.fillStyle = TIER_C[theirTier] || '#2A1420'; ctx.fillText(theirTier, 783, 1055);
  ctx.fillStyle = '#2A1420'; ctx.font = '500 56px "Source Serif 4", Georgia, serif'; ctx.fillText(word, 540, 1140);
  ctx.fillStyle = '#B5135A'; ctx.font = 'italic 500 40px "Source Serif 4", Georgia, serif'; ctx.textAlign = 'left';
  wrap(ctx, `“${line}”`, 72, 1210, W - 144, 50, 2);
  ctx.fillStyle = 'rgba(42,20,32,.72)'; ctx.font = '600 28px Inter, system-ui, sans-serif'; if (CAN_LINK_OUT) ctx.fillText('Style this brief yourself: ' + link.replace(/^https?:\/\//, ''), 72, 1310);
  return new Promise((res) => c.toBlob(res, 'image/png', 0.92));
}
export async function shareVerdict(opts) {
  const blob = await verdictCard(opts);
  const file = new File([blob], 'serve-verdict.png', { type: 'image/png' });
  const text = `${opts.word} against ${opts.rival} on “${opts.brief}”. ${opts.line}`;
  track('share', { brief: opts.brief, tier: opts.yourTier });
  // Android's web view cannot share a picture itself, so the app does it.
  const n = native();
  if (n && n.shareImage && !(navigator.canShare && navigator.canShare({ files: [file] }))) { if (await n.shareImage(blob, text, opts.link)) return 'shared'; }
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share(CAN_LINK_OUT ? { files: [file], text, url: opts.link } : { files: [file], text }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'serve-verdict.png'; document.body.appendChild(a); a.click(); a.remove();
  try { if (CAN_LINK_OUT) await navigator.clipboard.writeText(opts.link); } catch (e) { /* clipboard may be blocked */ }
  return 'downloaded';
}
// A battle link carries the sender's outfit for one brief; the friend who opens it styles the same brief against it.
export function battleLink(levelId, payload) { const u = new URL(publicBase()); u.hash = `battle/${levelId}/${payload}`; return u.toString(); }
export async function copyLink(link) { try { await navigator.clipboard.writeText(link); return true; } catch (e) { return false; } }
