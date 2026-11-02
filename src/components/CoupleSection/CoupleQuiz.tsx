import React, { useEffect, useRef, useState } from 'react';
import { COUPLE_QUIZ, WEDDING_CONTENT, WEDDING_IMAGES, type CoupleQuizItem } from '../../data/weddingData';
import { haptic } from '../../utils/haptics';
import { reducedMotion } from '../../utils/motion';
import { burstPetals } from '../FallingPetals/FallingPetals';

type Who = CoupleQuizItem['answer'];
type Person = 'groom' | 'bride';
type Guess = Person | 'both';

/** Questions shown at a time; the next set appears once these are answered. */
const ROUND_SIZE = 4;
const NEXT_ROUND_MS = 2600; // time to read the last answer before the next set
const ROUNDS = Math.ceil(COUPLE_QUIZ.length / ROUND_SIZE);

const NAME: Record<Person, string> = { groom: WEDDING_CONTENT.groom, bride: WEDDING_CONTENT.bride };
const PIC: Record<Person, string> = { groom: WEDDING_IMAGES.groom_portrait, bride: WEDDING_IMAGES.bride_portrait };
const CONFETTI = ['#c19a3d', '#f0d68e', '#5a1420', '#e8a0b4', '#fff6dc', '#b8892e'];

const Face: React.FC<{ who: Person }> = ({ who }) => (
  <img className={`cq-face cq-face--${who}`} src={PIC[who]} alt="" width={40} height={40} loading="lazy" decoding="async" />
);

/** A name counts on a "both" question too; "Both" only counts when it really is both. */
const isRight = (a: Who, g: Guess) => a === 'both' || a === g;

const resultCopy = (pct: number) =>
  pct === 100
    ? { title: 'Woohoo! You know them 100%!', sub: 'Front-row seat at the wedding, obviously.' }
    : pct >= 80
      ? { title: `Woohoo! You know them ${pct}%`, sub: 'Good good! Almost a family member.' }
      : pct >= 50
        ? { title: `Not bad, ${pct}%!`, sub: 'Ask them the rest at the wedding.' }
        : { title: `${pct}%, time to catch up!`, sub: 'Come to the wedding and get to know them better.' };

/** A one-off confetti "popper" burst from both corners of the result card. */
const Poppers: React.FC = () => {
  const bits = useRef(
    Array.from({ length: 36 }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      return {
        side,
        x: side * (40 + Math.random() * 140),
        y: -(60 + Math.random() * 160),
        r: Math.round(Math.random() * 720 - 360),
        d: (Math.random() * 0.25).toFixed(2),
        c: CONFETTI[i % CONFETTI.length],
        w: 5 + Math.round(Math.random() * 4),
      };
    })
  ).current;
  return (
    <div className="cq-poppers" aria-hidden="true">
      {bits.map((b, i) => (
        <i
          key={i}
          className={b.side > 0 ? 'is-r' : 'is-l'}
          style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--r': `${b.r}deg`, '--d': `${b.d}s`, '--c': b.c, '--w': `${b.w}px` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/**
 * "Who's more likely to…?" — shown four questions at a time. Guess Lalith or
 * Anjana, the card flips to reveal the answer; once a set is answered the next
 * set slides in. After the last one: a confetti pop and "You know them 90%!".
 */
export const CoupleQuiz: React.FC = () => {
  const [guesses, setGuesses] = useState<Record<number, Guess>>({});
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();

  const start = round * ROUND_SIZE;
  const items = COUPLE_QUIZ.slice(start, start + ROUND_SIZE);
  const roundAnswered = items.filter((_, k) => guesses[start + k] !== undefined).length;
  const roundComplete = roundAnswered === items.length;
  const isLastRound = round === ROUNDS - 1;

  const total = COUPLE_QUIZ.length;
  const right = Object.entries(guesses).filter(([i, g]) => isRight(COUPLE_QUIZ[Number(i)].answer, g)).length;
  const pct = Math.round((right / total) * 100);

  const advance = () => {
    window.clearTimeout(timer.current);
    if (isLastRound) {
      setDone(true);
      if (!reducedMotion()) {
        burstPetals(rootRef.current, 40);
        haptic(14);
      }
    } else {
      setRound((r) => r + 1);
    }
    rootRef.current?.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  // When a set is fully answered, move on after a short pause (or on "Next").
  useEffect(() => {
    if (!roundComplete || done) return;
    timer.current = window.setTimeout(advance, NEXT_ROUND_MS);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundComplete, round, done]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const guess = (i: number, g: Guess) => {
    haptic(6);
    setGuesses((s) => ({ ...s, [i]: g }));
  };

  const playAgain = () => {
    setGuesses({});
    setRound(0);
    setDone(false);
  };

  const verdict = (a: Who, g: Guess) =>
    a === 'both'
      ? g === 'both' ? 'Yes, both of them!' : 'Right, and it’s actually both!'
      : a === g ? 'You got it!' : `Nope, it’s ${NAME[a]}!`;

  const result = resultCopy(pct);

  return (
    <div className="cq reveal" ref={rootRef}>
      <span className="cq-eyebrow rd-label">A little game</span>
      <h3 className="cq-title">Who’s more likely to…?</h3>

      {done ? (
        <div className="cq-result" role="status">
          {!reducedMotion() && <Poppers />}
          <span className="cq-result-pop" aria-hidden="true">🎉</span>
          <p className="cq-result-score">
            <b>{right}</b>/{total}
          </p>
          <h4 className="cq-result-title">{result.title}</h4>
          <p className="cq-result-sub">{result.sub}</p>
          <button type="button" className="cq-replay" onClick={playAgain}>
            ↺ Play again
          </button>
        </div>
      ) : (
        <>
          <div className="cq-progress">
            {ROUNDS > 1 && (
              <span className="cq-dots" aria-label={`Set ${round + 1} of ${ROUNDS}`}>
                {Array.from({ length: ROUNDS }, (_, r) => (
                  <i key={r} className={r < round ? 'is-done' : r === round ? 'is-now' : ''} />
                ))}
              </span>
            )}
            <span className="cq-hint" aria-live="polite">
              {roundComplete
                ? isLastRound
                  ? 'All done! Your score is coming…'
                  : 'Nice! Next questions coming…'
                : roundAnswered === 0
                  ? 'Tap a name to guess.'
                  : `${roundAnswered} of ${items.length} answered`}
            </span>
          </div>

          <ul className="cq-cards" key={round}>
            {items.map((item, k) => {
              const i = start + k;
              const g = guesses[i];
              const flipped = g !== undefined;
              const correct = flipped && isRight(item.answer, g);
              return (
                <li key={item.q} className={`cq-card${flipped ? ' is-flipped' : ''}`} style={{ '--k': k } as React.CSSProperties}>
                  <div className="cq-inner">
                    <div className="cq-front" aria-hidden={flipped}>
                      <span className="cq-num">{String(i + 1).padStart(2, '0')}</span>
                      <p className="cq-q">{item.q}</p>
                      <div className="cq-picks" role="group" aria-label={`Guess: ${item.q}`}>
                        {(['groom', 'bride'] as Person[]).map((who) => (
                          <button key={who} type="button" tabIndex={flipped ? -1 : 0} onClick={() => guess(i, who)}>
                            {NAME[who]}
                          </button>
                        ))}
                        <button type="button" className="cq-both" tabIndex={flipped ? -1 : 0} onClick={() => guess(i, 'both')}>
                          Both
                        </button>
                      </div>
                    </div>
                    <div className={`cq-back${correct ? ' is-right' : ''}`} aria-hidden={!flipped} aria-live="polite">
                      <div className={`cq-faces cq-faces--${item.answer}`}>
                        {item.answer === 'both' ? (
                          <>
                            <Face who="groom" />
                            <Face who="bride" />
                          </>
                        ) : (
                          <Face who={item.answer} />
                        )}
                      </div>
                      {flipped && <b className="cq-verdict">{verdict(item.answer, g)}</b>}
                      <p className="cq-note">{item.note}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {roundComplete && (
            <button type="button" className="cq-next" onClick={advance}>
              {isLastRound ? 'See my score ›' : 'Next questions ›'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
