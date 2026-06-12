export const FIXTURE_LANDING = `
  <div role="main" data-meet-app>
    <h1>Google Meet</h1>
  </div>
`;

export const FIXTURE_PREJOIN = `
  <div role="main" data-meet-app>
    <div data-preview>
      <video data-preview></video>
    </div>
    <button data-prejoin-button aria-label="Join now">Join</button>
  </div>
`;

export const FIXTURE_IN_MEETING = `
  <div role="main" data-meet-app>
    <footer role="toolbar" data-call-toolbar aria-label="Call controls">
      <button aria-label="Leave call">Leave</button>
    </footer>
    <div data-participant-id="participant-1"></div>
    <div data-meeting-timer role="timer" aria-label="Meeting time">00:01</div>
  </div>
`;

export const FIXTURE_LEAVING = `
  <div role="main" data-meet-app>
    <p>You left the meeting</p>
  </div>
`;

export const FIXTURE_CAPTIONS = `
  <div role="main" data-meet-app>
    <footer role="toolbar" data-call-toolbar aria-label="Call controls">
      <button aria-label="Leave call">Leave</button>
    </footer>
    <div data-participant-id="participant-1"></div>
    <div data-meeting-timer role="timer" aria-label="Meeting time">00:01</div>
    <div role="region" data-caption-window aria-label="Captions">
      <div data-caption-text aria-live="polite">
        <span data-caption-speaker>Speaker A</span>
        Hello team
      </div>
    </div>
  </div>
`;

export const FIXTURE_CAPTIONS_DYNAMIC = `
  <div role="main" data-meet-app>
    <div role="region" data-caption-window aria-label="Captions" id="caption-root"></div>
    <div role="log" aria-label="Chat messages" data-chat-container>
      <div>Do not collect chat</div>
    </div>
  </div>
`;
