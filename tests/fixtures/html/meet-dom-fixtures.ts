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
