import { describe, expect, it } from 'vitest';
import {
  createCaptionObserver,
  type CaptionObserverState,
} from '@/src/adapters/google-meet/caption-observer';
import {
  areCaptionsAvailable,
  collectCaptionUpdates,
} from '@/src/adapters/google-meet/caption-parser';
import {
  FIXTURE_CAPTIONS,
  FIXTURE_CAPTIONS_DYNAMIC,
} from '../fixtures/html/meet-dom-fixtures';

function mountFixture(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

describe('caption observer', () => {
  it('detects caption container insertion', async () => {
    const root = mountFixture(FIXTURE_CAPTIONS_DYNAMIC);
    const updates: string[] = [];

    const dispose = createCaptionObserver({
      root,
      onCaptionUpdate: (update) => updates.push(update.text),
      onAvailabilityChange: () => undefined,
    });

    const container = root.querySelector('[data-caption-window]');
    expect(container).toBeTruthy();

    const line = document.createElement('div');
    line.setAttribute('data-caption-text', 'true');
    line.setAttribute('aria-live', 'polite');
    line.textContent = 'Inserted caption line';
    container?.appendChild(line);

    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(updates).toContain('Inserted caption line');
    dispose();
    document.body.innerHTML = '';
  });

  it('handles dynamic node replacement', async () => {
    const root = mountFixture(FIXTURE_CAPTIONS);
    const updates: string[] = [];

    const dispose = createCaptionObserver({
      root,
      onCaptionUpdate: (update) => updates.push(update.text),
      onAvailabilityChange: () => undefined,
    });

    const container = root.querySelector('[data-caption-window]');
    container!.innerHTML = `
      <div data-caption-text aria-live="polite">Replacement caption</div>
    `;

    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(updates).toContain('Replacement caption');
    dispose();
    document.body.innerHTML = '';
  });

  it('deduplicates repeated mutations', async () => {
    const root = mountFixture(`
      <div data-caption-window>
        <div data-caption-text aria-live="polite"></div>
      </div>
    `);
    let count = 0;

    const dispose = createCaptionObserver({
      root,
      onCaptionUpdate: () => {
        count += 1;
      },
      onAvailabilityChange: () => undefined,
    });

    const line = root.querySelector('[data-caption-text]');
    line!.textContent = 'Same text';
    await new Promise((resolve) => setTimeout(resolve, 120));
    line!.textContent = 'Same text';
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(count).toBe(1);
    dispose();
    document.body.innerHTML = '';
  });

  it('merges incremental updates through ingest callback', async () => {
    const root = mountFixture(FIXTURE_CAPTIONS);
    const texts: string[] = [];

    const dispose = createCaptionObserver({
      root,
      onCaptionUpdate: (update) => texts.push(update.text),
      onAvailabilityChange: () => undefined,
    });

    const line = root.querySelector('[data-caption-text]');
    line!.textContent = 'Partial';
    await new Promise((resolve) => setTimeout(resolve, 120));
    line!.textContent = 'Partial update complete';
    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(texts.at(-1)).toBe('Partial update complete');
    dispose();
    document.body.innerHTML = '';
  });

  it('handles missing speaker', () => {
    const root = mountFixture(`
      <div data-caption-window>
        <div data-caption-text aria-live="polite">No speaker line</div>
      </div>
    `);

    const updates = collectCaptionUpdates(root);
    expect(updates[0]?.speaker).toBeUndefined();
    document.body.innerHTML = '';
  });

  it('handles speaker change', async () => {
    const root = mountFixture(FIXTURE_CAPTIONS);
    const speakers: Array<string | undefined> = [];

    const dispose = createCaptionObserver({
      root,
      onCaptionUpdate: (update) => speakers.push(update.speaker),
      onAvailabilityChange: () => undefined,
    });

    const line = root.querySelector('[data-caption-text]');
    line!.innerHTML = '<span data-caption-speaker>Speaker B</span> Updated';
    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(speakers.at(-1)).toBe('Speaker B');
    dispose();
    document.body.innerHTML = '';
  });

  it('ignores empty content', () => {
    const root = mountFixture(`
      <div data-caption-window>
        <div data-caption-text aria-live="polite">   </div>
      </div>
    `);

    expect(collectCaptionUpdates(root)).toHaveLength(0);
    document.body.innerHTML = '';
  });

  it('cleans up observers', () => {
    const root = mountFixture(FIXTURE_CAPTIONS);
    const states: CaptionObserverState[] = [];

    const dispose = createCaptionObserver({
      root,
      onCaptionUpdate: () => undefined,
      onAvailabilityChange: () => undefined,
      onStateChange: (state) => states.push(state),
    });

    dispose();
    expect(states.at(-1)).toBe('stopped');
    document.body.innerHTML = '';
  });

  it('does not collect unrelated page text', () => {
    const root = mountFixture(`
      <div data-caption-window>
        <div data-caption-text aria-live="polite">Caption only</div>
      </div>
      <div role="log" aria-label="Chat messages" data-chat-container>
        <div>Private chat message</div>
      </div>
    `);

    const updates = collectCaptionUpdates(root);
    expect(updates).toHaveLength(1);
    expect(updates[0]?.text).toBe('Caption only');
    expect(areCaptionsAvailable(root)).toBe(true);
    document.body.innerHTML = '';
  });
});
