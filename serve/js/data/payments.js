// Stripe wiring. Three modes, picked automatically:
//   worker  : a Cloudflare Worker (payments/worker.js) creates Checkout Sessions and verifies them. Set `worker`.
//   links   : Stripe Payment Links, one per SKU, no server. Set `links`. Fulfilment happens on return and cannot be
//             verified without the worker; fine for a client-side economy, upgrade to the worker before scale.
//   prototype: nothing configured, the shop grants items and records the price.
// `payments/setup-stripe.mjs --write` fills `links` and `mode` from your Stripe account.
export const PAYMENTS = {
  env: 'live',            // 'test' or 'live', set by the setup script
  worker: '',         // e.g. 'https://serve-pay.your-account.workers.dev'
  links: {
      "t1": "https://buy.stripe.com/dRmdRac0x5sCbit3T3fIs00",
      "t2": "https://buy.stripe.com/dRmcN6e8Fg7gcmx1KVfIs01",
      "t3": "https://buy.stripe.com/3cI00kd4Bg7gaepblvfIs02",
      "t4": "https://buy.stripe.com/6oU00k4y51cm5Y99dnfIs03",
      "t5": "https://buy.stripe.com/8x214od4B9IS86hgFPfIs04",
      "t6": "https://buy.stripe.com/cNi9AUfcJcV40DP2OZfIs05",
      "daily": "https://buy.stripe.com/aFa6oI5C9bR0bit0GRfIs06",
      "monthly": "https://buy.stripe.com/eVqcN61lT2gqcmxfBLfIs07"
  },          // { t1: 'https://buy.stripe.com/...', ..., daily: '...', monthly: '...' }
};
