import { init } from './ui/app.js';
import './ui/map.js';
import './ui/studio.js';
import './ui/wardrobe.js';
import './ui/atelier.js';
import './ui/you.js';
import './ui/arena.js';
import { ensureCatalog } from './data/catalog.js';

init();
if (window.performance && performance.mark) performance.mark('serve:first-render');
// The first screen only needs the starter wardrobe and the sets. Build the other 12,700 pieces once it is showing,
// so the wardrobe, the shop and the first verdict do not have to wait for them.
setTimeout(() => { if (window.requestIdleCallback) window.requestIdleCallback(() => ensureCatalog(), { timeout: 2000 }); else ensureCatalog(); }, 300);
