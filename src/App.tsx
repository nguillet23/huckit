const MODES = [
  { name: 'Lessons', blurb: 'Learn the rules and offensive strategy, step by step.' },
  { name: 'Play', blurb: 'Run offensive possessions against a CPU man defense.' },
  { name: 'Whiteboard', blurb: 'Draw and animate offensive plays.' },
];

export default function App() {
  return (
    <main className="title-screen">
      <h1>Huck It</h1>
      <p className="tagline">Learn ultimate offense, from above.</p>

      <ul className="modes">
        {MODES.map((mode) => (
          <li key={mode.name}>
            <button type="button" disabled>
              <span className="mode-name">{mode.name}</span>
              <span className="mode-blurb">{mode.blurb}</span>
              <span className="soon">Coming soon</span>
            </button>
          </li>
        ))}
      </ul>

      <footer>
        <a href="https://github.com/nguillet23/huckit">View on GitHub</a>
      </footer>
    </main>
  );
}
