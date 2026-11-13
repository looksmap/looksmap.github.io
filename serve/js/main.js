import { init } from './ui/app.js';
import './ui/map.js';
import './ui/studio.js';
import './ui/wardrobe.js';
import './ui/atelier.js';
import './ui/you.js';
import './ui/arena.js';
import { ensureCatalog } from './data/catalog.js';
import { settlePending } from './engine/state.js';
import { toast } from './ui/app.js';

// An outfit that was sent for judging, or a ranked match that was open, when the game was last closed is settled first.
const settled = settlePending();
init();
if (settled) toast(settled.kind === 'forfeit' ? `You left a ranked match before sending an outfit, so it counted as a loss (${settled.delta} rank points).`
  : settled.kind === 'ranked' ? `Your ranked match on “${settled.title}” was judged while you were away. You ${settled.passed ? 'won' : 'lost'} (${settled.delta >= 0 ? '+' : ''}${settled.delta} rank points).`
  : `Your outfit for “${settled.title}” was judged while you were away. You ${settled.passed ? 'won' : 'lost'} with a grade of ${settled.grade}.`, 5200);
if (window.performance && performance.mark) performance.mark('serve:first-render');
// The first screen only needs the starter wardrobe and the sets. Build the other 12,700 pieces once it is showing,
// so the wardrobe, the shop and the first verdict do not have to wait for them.
setTimeout(() => { if (window.requestIdleCallback) window.requestIdleCallback(() => ensureCatalog(), { timeout: 2000 }); else ensureCatalog(); }, 300);
