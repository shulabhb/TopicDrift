import React from 'react';
import ReactDOM from 'react-dom/client';
import { MESSAGE_TYPES } from '@/src/types/messages';
import { sendMessage } from '@/src/services/messaging';
import './style.css';

function DevBadge() {
  return (
    <div className="td-dev-badge" role="status" aria-live="polite">
      TopicDrift loaded
    </div>
  );
}

export default defineContentScript({
  matches: ['https://meet.google.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'topicdrift-meet-shell',
      position: 'overlay',
      anchor: 'body',
      append: 'last',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(import.meta.env.DEV ? <DevBadge /> : null);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();

    await sendMessage({
      type: MESSAGE_TYPES.CONTENT_SCRIPT_READY,
      payload: { url: location.href },
    });
  },
});
