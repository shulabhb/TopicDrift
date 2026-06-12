import React from 'react';
import ReactDOM from 'react-dom/client';
import { MESSAGE_TYPES } from '@/src/types/messages';
import { sendMessage } from '@/src/services/messaging';
import { MeetApp } from '@/src/content/MeetApp';
import './style.css';

export default defineContentScript({
  matches: ['https://meet.google.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    let tabId: number | undefined;

    const ui = await createShadowRootUi(ctx, {
      name: 'topicdrift-meet-shell',
      position: 'overlay',
      anchor: 'body',
      append: 'last',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<MeetApp tabId={tabId} />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();

    await sendMessage({
      type: MESSAGE_TYPES.CONTENT_SCRIPT_READY,
      payload: { tabId },
    });
  },
});
