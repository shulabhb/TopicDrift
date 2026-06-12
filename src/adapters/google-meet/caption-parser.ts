import { GOOGLE_MEET_SELECTORS, queryAll, queryFirst } from './selectors';

export interface ParsedCaptionUpdate {
  sourceId: string;
  text: string;
  speaker?: string;
}

const EXCLUDED_ANCESTOR_SELECTORS = [
  '[role="log"]',
  '[aria-label*="chat" i]',
  '[data-chat-container]',
  '[data-participant-list]',
].join(', ');

function isWithinExcludedRegion(element: Element): boolean {
  return Boolean(element.closest(EXCLUDED_ANCESTOR_SELECTORS));
}

function readSpeaker(element: Element): string | undefined {
  const speakerNode = element.querySelector(GOOGLE_MEET_SELECTORS.captionSpeaker);

  if (!speakerNode) {
    return undefined;
  }

  const speaker = speakerNode.textContent?.trim();
  return speaker || undefined;
}

function readCaptionText(element: Element): string {
  const speakerNode = element.querySelector(GOOGLE_MEET_SELECTORS.captionSpeaker);
  const clone = element.cloneNode(true) as Element;

  clone.querySelectorAll(GOOGLE_MEET_SELECTORS.captionSpeaker).forEach((node) => {
    node.remove();
  });

  const text = clone.textContent?.trim() ?? element.textContent?.trim() ?? '';

  if (text) {
    return text;
  }

  if (speakerNode) {
    const full = element.textContent?.trim() ?? '';
    const speakerText = speakerNode.textContent?.trim() ?? '';
    return full.replace(speakerText, '').trim();
  }

  return '';
}

function createSourceId(element: Element, index: number): string {
  const explicit =
    element.getAttribute('data-caption-id') ??
    element.getAttribute('data-caption-text-id') ??
    element.getAttribute('id');

  if (explicit) {
    return `caption-${explicit}`;
  }

  const parent = element.parentElement;
  const parentId = parent?.getAttribute('data-caption-window') ?? 'window';
  return `caption-${parentId}-${index}`;
}

export function findCaptionContainer(root: ParentNode = document): Element | null {
  return queryFirst(GOOGLE_MEET_SELECTORS.captionContainer, root);
}

export function areCaptionsAvailable(root: ParentNode = document): boolean {
  const container = findCaptionContainer(root);

  if (!container) {
    return false;
  }

  const lines = queryAll(GOOGLE_MEET_SELECTORS.captionLine, container);
  return lines.some((line) => readCaptionText(line).length > 0);
}

export function parseCaptionElement(
  element: Element,
  index: number,
): ParsedCaptionUpdate | null {
  if (isWithinExcludedRegion(element)) {
    return null;
  }

  const text = readCaptionText(element);

  if (!text) {
    return null;
  }

  return {
    sourceId: createSourceId(element, index),
    text,
    speaker: readSpeaker(element),
  };
}

export function collectCaptionUpdates(
  root: ParentNode = document,
): ParsedCaptionUpdate[] {
  const container = findCaptionContainer(root);

  if (!container) {
    return [];
  }

  const lines = queryAll(GOOGLE_MEET_SELECTORS.captionLine, container);

  return lines
    .map((line, index) => parseCaptionElement(line, index))
    .filter((update): update is ParsedCaptionUpdate => update !== null);
}
