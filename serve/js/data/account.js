// Sign-in and saved progress. Everything here is public: these are addresses and public client IDs, not secrets.
// Sign-in stays switched off until `api` is filled in, so the game runs exactly as before until the save server is
// deployed. See the setup guide in serve-save/README.md.
export const ACCOUNT = {
  api: '',              // the save server, e.g. 'https://serve-save.your-account.workers.dev'
  googleClientId: '',   // Google "Web application" client ID. Used by the website and by the Android app.
  googleIosClientId: '',// Google "iOS" client ID. Used by the iPhone app.
  appleServiceId: '',   // Apple Services ID, for Sign in with Apple on the website. The iPhone app does not need it.
  devLogin: false,      // true shows a test sign-in button. Local testing only: the real save server refuses it.
};
