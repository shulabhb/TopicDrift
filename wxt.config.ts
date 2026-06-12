import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'TopicDrift',
    description: 'Private, local topic-alignment tracking for online meetings.',
    version: '0.1.0',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['https://meet.google.com/*'],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    action: {
      default_title: 'TopicDrift',
    },
  },
  webExt: {
    startUrls: ['https://meet.google.com/'],
  },
});
