import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { FieldCanvas } from '../components/FieldCanvas';
import type { Point } from '../sim/field';
import { verticalStack, type Direction } from '../sim/lineups';

type Force = 'forehand' | 'backhand';

/**
 * Temporary Milestone 1 page: a static vertical stack on the field, used to
 * check the canvas look before game logic is built on top of it.
 */
export function FieldPreviewPage() {
  const [attackDir, setAttackDir] = useState<Direction>(1);
  const [force, setForce] = useState<Force>('forehand');

  // A right-handed thrower facing +x has their forehand side toward +y.
  const forceSide: Direction = force === 'forehand' ? attackDir : (-attackDir as Direction);
  const disc = useMemo<Point>(() => ({ x: attackDir === 1 ? 35 : 75, y: 24 }), [attackDir]);
  const players = useMemo(() => verticalStack(disc, attackDir, forceSide), [disc, attackDir, forceSide]);

  return (
    <main className="preview">
      <header className="preview-header">
        <Link to="/">← Back</Link>
        <h1>Field preview</h1>
      </header>

      <FieldCanvas
        players={players}
        disc={disc}
        label={`Field preview: Blue in a vertical stack attacking ${attackDir === 1 ? 'right' : 'left'}, Red forcing ${force}.`}
      />

      <div className="preview-controls">
        <fieldset>
          <legend>Blue attacks</legend>
          <button type="button" aria-pressed={attackDir === -1} onClick={() => setAttackDir(-1)}>
            ← Left
          </button>
          <button type="button" aria-pressed={attackDir === 1} onClick={() => setAttackDir(1)}>
            Right →
          </button>
        </fieldset>
        <fieldset>
          <legend>Red forces</legend>
          <button type="button" aria-pressed={force === 'forehand'} onClick={() => setForce('forehand')}>
            Forehand
          </button>
          <button type="button" aria-pressed={force === 'backhand'} onClick={() => setForce('backhand')}>
            Backhand
          </button>
        </fieldset>
      </div>

      <p className="preview-note">
        <span className="swatch offense" /> Blue offense in a vertical stack (#1 has the disc)
        <span className="swatch defense" /> Red person-to-person defense. The red #1 is the marker, on the break side.
      </p>
    </main>
  );
}
