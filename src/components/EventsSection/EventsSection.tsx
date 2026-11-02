import './EventsSection.css';
import React from 'react';
import { WEDDING_EVENTS } from '../../data/events';
import { useNow } from '../../hooks/useNow';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { NextTeaser } from '../ScrollGuide/NextTeaser';
import { WeddingCard } from './WeddingCard';
import { TrainJourney } from './TrainJourney';
import { ReceptionCard } from './ReceptionCard';

/** Index of the next celebration: the reception once the wedding has ended. */
const nextEventIndex = (now: number): number =>
  now > new Date(WEDDING_EVENTS[0].endIso).getTime() ? 1 : 0;

// "Sunday, 29 November 2026" → { day: "29", rest: "November 2026", weekday: "Sunday" }
const splitDate = (dateStr: string) => {
  const [weekday, rest = ''] = dateStr.split(', ');
  const [day, ...monthYear] = rest.split(' ');
  return { weekday, day: day.padStart(2, '0'), monthYear: monthYear.join(' ') };
};

export const EventsSection: React.FC = () => {
  const now = useNow(60000);
  const activeEventIndex = nextEventIndex(now);

  return (
    <section className="ev rd-sec rd-dark" id="s2" aria-labelledby="events-title">
      <div id="date" className="rd-wrap">
        <header className="rd-head reveal">
          <span className="rd-kicker">Shubha Muhurtham</span>
          <h2 id="events-title">Our Events</h2>
          <HeaderRule />
        </header>

        <div className="ev-chs">
        {WEDDING_EVENTS.map((ev, index) => {
          const isNext = index === activeEventIndex;
          const d = splitDate(ev.dateStr);
          if (ev.id === 'wedding') {
            return (
              <React.Fragment key={ev.id}>
                <WeddingCard ev={ev} isNext={isNext} date={d} />
                <TrainJourney />
              </React.Fragment>
            );
          }
          return <ReceptionCard key={ev.id} ev={ev} isNext={isNext} date={d} />;
        })}

        </div>
        <NextTeaser label="Next: tell us you're coming" targetId="s5" tone="light" />
      </div>
    </section>
  );
};
