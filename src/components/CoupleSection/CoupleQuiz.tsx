import React, { useState } from 'react';
import { COUPLE_QUIZ, WEDDING_CONTENT, WEDDING_IMAGES, type CoupleQuizItem } from '../../data/weddingData';
import { haptic } from '../../utils/haptics';

type Who = CoupleQuizItem['answer'];
type Guess = 'groom' | 'bride';

const NAME: Record<Guess, string> = { groom: WEDDING_CONTENT.groom, bride: WEDDING_CONTENT.bride };
const PIC: Record<Guess, string> = { groom: WEDDING_IMAGES.p12, bride: WEDDING_IMAGES.bride_portrait };

const Face: React.FC<{ who: Guess }> = ({ who }) => (
  <img className={`cq-face cq-face--${who}`} src={PIC[who]} alt="" width={44} height={44} loading="lazy" decoding="async" />
);

/** "Who's more likely to…?" — guess Lalith or Anjana, the card flips to reveal the answer. */
export const CoupleQuiz: React.FC = () => {
  const [guesses, setGuesses] = useState<Record<number, Guess>>({});
  const answered = Object.keys(guesses).length;
  const right = Object.entries(guesses).filter(([i, g]) => {
    const a = COUPLE_QUIZ[Number(i)].answer;
    return a === 'both' || a === g;
  }).length;

  const guess = (i: number, g: Guess) => {
    haptic(6);
    setGuesses((s) => ({ ...s, [i]: g }));
  };
  const reset = (i: number) =>
    setGuesses((s) => {
      const n = { ...s };
      delete n[i];
      return n;
    });

  const verdict = (a: Who, g: Guess) =>
    a === 'both' ? 'Trick question — both!' : a === g ? 'You got it!' : `Nope — it’s ${NAME[a]}!`;

  return (
    <div className="cq reveal">
      <span className="cq-eyebrow">A little game</span>
      <h3 className="cq-title">Who’s more likely to…?</h3>
      <p className="cq-hint">
        {answered === 0
          ? 'Tap a name to guess, then see if you know them.'
          : answered < COUPLE_QUIZ.length
            ? `${right} of ${answered} right so far`
            : right === COUPLE_QUIZ.length
              ? `All ${right} right. You clearly know them well!`
              : `${right} of ${COUPLE_QUIZ.length} right. Ask them the rest at the wedding!`}
      </p>

      <ul className="cq-cards">
        {COUPLE_QUIZ.map((item, i) => {
          const g = guesses[i];
          const flipped = g !== undefined;
          const correct = flipped && (item.answer === 'both' || item.answer === g);
          return (
            <li key={item.q} className={`cq-card${flipped ? ' is-flipped' : ''}`}>
              <div className="cq-inner">
                <div className="cq-front" aria-hidden={flipped}>
                  <span className="cq-num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="cq-q">{item.q}</p>
                  <div className="cq-picks" role="group" aria-label={`Guess: ${item.q}`}>
                    {(['groom', 'bride'] as Guess[]).map((who) => (
                      <button key={who} type="button" tabIndex={flipped ? -1 : 0} onClick={() => guess(i, who)}>
                        {NAME[who]}
                      </button>
                    ))}
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
                  <button type="button" className="cq-again" tabIndex={flipped ? 0 : -1} onClick={() => reset(i)}>
                    ↺ Flip back
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
