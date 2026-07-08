import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// Metadane userscriptu (nagłówek ==UserScript==) generuje vite-plugin-monkey.
// Nazwa i opis są dwujęzyczne: '' = domyślny (EN), 'pl' = polski.
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: {
          '': 'TikTok Repost Cleaner',
          pl: 'TikTok — masowe usuwanie repostów',
        },
        description: {
          '': 'Bulk removal of your OWN reposts from your TikTok profile.',
          pl: 'Masowe usuwanie WŁASNYCH repostów z profilu TikTok (bulk un-repost).',
        },
        namespace: 'https://github.com/Entity0303',
        author: 'Entity0303',
        match: ['https://www.tiktok.com/*'],
        'run-at': 'document-idle',
        grant: ['GM_setValue', 'GM_getValue'],
      },
      build: {
        // Nie dodawaj automatycznie wykrytych @grant — trzymamy się jawnej listy powyżej.
        autoGrant: false,
      },
    }),
  ],
});
