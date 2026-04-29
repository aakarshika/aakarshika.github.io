import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion';
import { Mail, Ticket, Speaker, Pizza, Users, Hammer, Music, Sparkles } from 'lucide-react';
import { useAnimationValue } from '../hooks/useAnimationValue';

// ============================================================
// Helpers
// ============================================================

const Typewriter = ({ progress, text, startTiming, duration, className = '' }) => {
  const charIndex = useTransform(
    progress,
    [startTiming, startTiming + duration],
    [0, text.length],
    { clamp: true }
  );
  const [shown, setShown] = useState('');
  useMotionValueEvent(charIndex, 'change', (latest) => {
    const i = Math.max(0, Math.min(text.length, Math.floor(latest)));
    setShown((prev) => {
      const next = text.slice(0, i);
      return prev === next ? prev : next;
    });
  });
  return <span className={className}>{shown}</span>;
};

const Counter = ({ progress, from, to, startTiming, duration }) => {
  const v = useTransform(progress, [startTiming, startTiming + duration], [from, to], { clamp: true });
  const [n, setN] = useState(from);
  useMotionValueEvent(v, 'change', (latest) => {
    const next = Math.floor(latest);
    setN((prev) => (prev === next ? prev : next));
  });
  return <>{n}</>;
};

const Checkmark = ({ progress, startTiming, duration = 0.5, color = 'rgb(34 197 94)' }) => {
  const lengthAnim = [{ initialValue: 0, finalValue: 1, startTiming, duration }];
  const pathLen = useAnimationValue(progress, lengthAnim, 'fade', 0);
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <motion.path
        d="M 5 12 L 10 17 L 19 7"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ pathLength: pathLen }}
      />
    </svg>
  );
};

// ============================================================
// Sub-elements that orbit the card center
// ============================================================

const FlyingEnvelope = ({ progress, startTiming, dx, dy }) => {
  const xAnim = [{ initialValue: 0, finalValue: dx, startTiming, duration: 10 }];
  const yAnim = [{ initialValue: 0, finalValue: dy, startTiming, duration: 10 }];
  const fadeAnim = [
    { initialValue: 0, finalValue: 1, startTiming, duration: 5 },
    { initialValue: 1, finalValue: 0, startTiming: startTiming + 8, duration: 2 },
  ];
  const scaleAnim = [{ initialValue: 0, finalValue: 1, startTiming, duration: 0.4 }];
  const rotateAnim = [{ initialValue: -10, finalValue: dx > 0 ? 25 : -25, startTiming, duration: 2.5 }];

  const x = useAnimationValue(progress, xAnim, 'slideX', 0);
  const y = useAnimationValue(progress, yAnim, 'slideY', 0);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);
  const scale = useAnimationValue(progress, scaleAnim, 'scale', 0);
  const rotate = useAnimationValue(progress, rotateAnim, 'rotate', 0);

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none">
      <motion.div style={{ x, y, opacity: fade, scale, rotate, marginLeft: -12, marginTop: -12 }}>
        <Mail className="w-16 h-16 text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
      </motion.div>
    </div>
  );
};

const FlyingTicket = ({ progress, startTiming, fromX, fromY }) => {
  const xAnim = [{ initialValue: fromX, finalValue: 0, startTiming, duration: 1.2 }];
  const yAnim = [{ initialValue: fromY, finalValue: 0, startTiming, duration: 1.2 }];
  const fadeAnim = [
    { initialValue: 0, finalValue: 1, startTiming, duration: 0.3 },
    { initialValue: 1, finalValue: 0, startTiming: startTiming + 0.9, duration: 0.4 },
  ];
  const scaleAnim = [
    { initialValue: 0.7, finalValue: 1, startTiming, duration: 0.4 },
    { initialValue: 1, finalValue: 0.3, startTiming: startTiming + 0.8, duration: 0.5 },
  ];
  const rotateAnim = [{ initialValue: -15, finalValue: 15, startTiming, duration: 1.2 }];

  const x = useAnimationValue(progress, xAnim, 'slideX', fromX);
  const y = useAnimationValue(progress, yAnim, 'slideY', fromY);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);
  const scale = useAnimationValue(progress, scaleAnim, 'scale', 0.7);
  const rotate = useAnimationValue(progress, rotateAnim, 'rotate', 0);

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none">
      <motion.div style={{ x, y, opacity: fade, scale, rotate, marginLeft: -12, marginTop: -12 }}>
        <Ticket className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_6px_rgba(1, 43, 47, 0.7)]" />
      </motion.div>
    </div>
  );
};

const RowNeighbor = ({ progress, name, Icon, arriveAt, accent }) => {
  const xAnim = [{ initialValue: 280, finalValue: 0, startTiming: arriveAt, duration: 1.3 }];
  const fadeAnim = [{ initialValue: 0, finalValue: 1, startTiming: arriveAt, duration: 0.6 }];
  const scaleAnim = [
    { initialValue: 0.5, finalValue: 1.12, startTiming: arriveAt, duration: 0.7 },
    { initialValue: 1.12, finalValue: 1, startTiming: arriveAt + 0.7, duration: 0.5 },
  ];

  const x = useAnimationValue(progress, xAnim, 'slideX', 280);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);
  const scale = useAnimationValue(progress, scaleAnim, 'scale', 0.5);

  return (
    <div className="absolute right-0 top-1/2 z-30" style={{ transform: 'translateY(-50%)' }}>
      <motion.div
        className={`px-1.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${accent.chip}`}
        style={{ x, opacity: fade, scale, transformOrigin: 'right center' }}
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${accent.avatar}`}>
          <span className="text-[8px] font-bold text-white">{name[0]}</span>
        </div>
        <Icon className={`w-2.5 h-2.5 ${accent.iconText}`} />
        <span className={`text-[9px] font-semibold pr-0.5 ${accent.iconText}`}>{name}</span>
      </motion.div>
    </div>
  );
};

const ConfettiSparkle = ({ progress, startTiming, dx, dy, color }) => {
  const xAnim = [{ initialValue: 0, finalValue: dx, startTiming, duration: 1.8 }];
  const yAnim = [{ initialValue: 0, finalValue: dy, startTiming, duration: 1.8 }];
  const fadeAnim = [
    { initialValue: 0, finalValue: 1, startTiming, duration: 0.3 },
    { initialValue: 1, finalValue: 0, startTiming: startTiming + 1, duration: 0.7 },
  ];
  const scaleAnim = [
    { initialValue: 0, finalValue: 1.3, startTiming, duration: 0.4 },
    { initialValue: 1.3, finalValue: 0, startTiming: startTiming + 1, duration: 0.7 },
  ];
  const rotateAnim = [{ initialValue: 0, finalValue: 360, startTiming, duration: 1.8 }];

  const x = useAnimationValue(progress, xAnim, 'slideX', 0);
  const y = useAnimationValue(progress, yAnim, 'slideY', 0);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);
  const scale = useAnimationValue(progress, scaleAnim, 'scale', 0);
  const rotate = useAnimationValue(progress, rotateAnim, 'rotate', 0);

  return (
    <div className="absolute top-1/2 left-1/2 pointer-events-none">
      <motion.div style={{ x, y, opacity: fade, scale, rotate, marginLeft: -10, marginTop: -10 }}>
        <Sparkles className="w-5 h-5" style={{ color }} />
      </motion.div>
    </div>
  );
};

// ============================================================
// Schedule data
// ============================================================

const CARD_SLIDE_ANIM = [{ initialValue: 240, startTiming: 70, duration: 2 }];
const CARD_SCALE_ANIM = [
  { initialValue: 0.9, finalValue: 1, startTiming: 70, duration: 2 },
  { initialValue: 1, finalValue: 1.04, startTiming: 86.5, duration: 0.5 },
  { initialValue: 1.04, finalValue: 1, startTiming: 87, duration: 0.6 },
];
const CARD_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 70, duration: 1.5 }];

const LIVE_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 87.5, duration: 0.8 }];
const LIVE_SCALE_ANIM = [
  { initialValue: 0.5, finalValue: 1.2, startTiming: 87.5, duration: 0.5 },
  { initialValue: 1.2, finalValue: 1, startTiming: 88, duration: 0.5 },
];

const READY_FADE_ANIM = [{ initialValue: 0.7, finalValue: 0, startTiming: 87.5, duration: 0.6 }];

// Counter completes early (~76 → 81), then chip glows held until sync-check at 86
const COUNTER_BOX_GLOW_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 76, duration: 0.6 },
  { initialValue: 1, finalValue: 0, startTiming: 86.5, duration: 1 },
];

const ENVELOPES = [
  { dx: -760, dy: -180, t: 71 },
  // { dx: 260, dy: -180, t: 74.2 },
  // { dx: -500, dy: 0, t: 74.4 },
  // { dx: 300, dy: 0, t: 74.6 },
  // { dx: -560, dy: 180, t: 74.8 },
  // { dx: 260, dy: 180, t: 75 },
];

// Tickets stream from 76 → ~82, overlapping with neighbors arriving 78 → 86
const TICKETS = [
  { fromX: 300, fromY: -150, t: 80.2 },
  { fromX: 280, fromY: -160, t: 81.7 },
  { fromX: 260, fromY: 180, t: 83.2 },
  { fromX: 320, fromY: 60, t: 78.7 },
  { fromX: 180, fromY: -200, t: 80.2 },
  { fromX: 200, fromY: 200, t: 82.8 },
  { fromX: 240, fromY: 0, t: 84.4 },
  { fromX: 240, fromY: 0, t: 86 },
];

// Neighbors land as small chips on their corresponding row inside the card.
// Indexed by checklist item `id` so the card render can pair them.
const NEIGHBORS_BY_ID = {
  sound: {
    name: 'Sam', Icon: Speaker, arriveAt: 78,
    accent: { chip: 'bg-cyan-100 border-cyan-300', avatar: 'bg-cyan-500', iconText: 'text-cyan-700' },
  },
  snacks: {
    name: 'Priya', Icon: Pizza, arriveAt: 79.5,
    accent: { chip: 'bg-amber-100 border-amber-300', avatar: 'bg-amber-500', iconText: 'text-amber-700' },
  },
  volunteers: {
    name: 'Garcias', Icon: Users, arriveAt: 81,
    accent: { chip: 'bg-emerald-100 border-emerald-300', avatar: 'bg-emerald-500', iconText: 'text-emerald-700' },
  },
  venue: {
    name: 'Theo', Icon: Hammer, arriveAt: 82.5,
    accent: { chip: 'bg-rose-100 border-rose-300', avatar: 'bg-rose-500', iconText: 'text-rose-700' },
  },
  playlist: {
    name: 'Mara', Icon: Music, arriveAt: 84,
    accent: { chip: 'bg-violet-100 border-violet-300', avatar: 'bg-violet-500', iconText: 'text-violet-700' },
  },
};

// All checks fire together right before LIVE — slight 0.1 stagger for rhythm.
const CHECKLIST = [
  { id: 'eventPublished', label: 'Event Published', icon: <Mail className="w-4 h-4 text-cyan-700" />, checkAt: 71 },
  { id: 'sound', label: 'Sound system & microphones', checkAt: 78 },
  { id: 'snacks', label: 'Snacks & drinks', checkAt: 79.5 },
  { id: 'volunteers', label: 'Stage volunteers (4)', checkAt: 81 },
  { id: 'tickets', label: '20 tickets sold', checkAt: 82.5, icon: <Ticket className="w-4 h-4 text-cyan-700" />, isTickets: true },
  { id: 'venue', label: 'Venue setup', checkAt: 84 },
  { id: 'playlist', label: 'Music playlist', checkAt: 84.5 },
];

const CONFETTI = [
  { dx: -180, dy: -180, color: 'rgb(244 114 182)', t: 88.5 },
  { dx: 180, dy: -180, color: 'rgb(34 211 238)', t: 88.6 },
  { dx: -200, dy: 100, color: 'rgb(167 139 250)', t: 88.7 },
  { dx: 200, dy: 100, color: 'rgb(251 191 36)', t: 88.8 },
  { dx: 0, dy: -220, color: 'rgb(52 211 153)', t: 88.9 },
  { dx: 0, dy: 200, color: 'rgb(244 114 182)', t: 89 },
];

// ============================================================
// Main component
// ============================================================

export const OutgoingProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;

  const cardSlideY = useAnimationValue(activeProgress, CARD_SLIDE_ANIM, 'slideY', 0);
  const cardScale = useAnimationValue(activeProgress, CARD_SCALE_ANIM, 'scale', 1);
  const cardFade = useAnimationValue(activeProgress, CARD_FADE_ANIM, 'fade', 0);

  const liveFade = useAnimationValue(activeProgress, LIVE_FADE_ANIM, 'fade', 0);
  const liveScale = useAnimationValue(activeProgress, LIVE_SCALE_ANIM, 'scale', 0.5);
  const readyFade = useAnimationValue(activeProgress, READY_FADE_ANIM, 'fade', 0.7);
  const counterGlow = useAnimationValue(activeProgress, COUNTER_BOX_GLOW_ANIM, 'fade', 0);
  const counterBoxShadow = useTransform(
    counterGlow,
    (v) => `0 0 ${v * 14}px rgba(34,211,238,${v * 0.7})`
  );

  return (
    <div className="w-screen h-screen flex items-center justify-center relative flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-r from-[#3c0086] to-blue-900"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-transparent"></div>

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        {/* Left: copy */}
        <div className="relative">
          <h3 className="text-5xl font-bold mb-6 text-cyan-400">Outgoing</h3>
          <p className="text-xl text-white mb-6">
          Event discovery with a twist — attendees can chip in a skill to get in. Built end-to-end for the Indian urban market, from social graph to ticketing.
          </p>
          <div className="flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">Social Platform</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">Smart Matching</span>
            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Event Tech</span>
          </div>
        </div>

        {/* Right: animated scene */}
        <div className="relative h-[34rem] w-full">
          {/* Event card centered */}
          <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
            <motion.div
              className="relative w-80 rounded-lg bg-slate-50 shadow-2xl shadow-cyan-900/40 px-5 py-5 -rotate-1"
              style={{ y: cardSlideY, scale: cardScale, opacity: cardFade }}
            >
              {/* Clipboard clip */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-sm bg-slate-400 shadow-md"></div>

              {/* Header */}
              <div className="text-[10px] tracking-[0.18em] text-cyan-600 font-bold uppercase mb-1">
                Host
              </div>
              <h4 className="text-base font-bold text-slate-800 leading-tight mb-1 min-h-[1.25rem]">
                <Typewriter
                  progress={activeProgress}
                  text="Neighborhood Karaoke Night"
                  startTiming={72}
                  duration={2}
                />
              </h4>
              <div className="text-[11px] text-slate-500 mb-3 min-h-[1rem]">
                <Typewriter
                  progress={activeProgress}
                  text="Tonight, 7PM at Maple Lane Park"
                  startTiming={88.5}
                  duration={2.8}
                  className="text-cyan-700 font-medium"
                />
              </div>

              <div className="border-t border-slate-200 mb-3"></div>

              {/* Checklist */}
              <ul className="space-y-2">
                {CHECKLIST.map((item) => {
                  const neighbor = NEIGHBORS_BY_ID[item.id];
                  return (
                    <li key={item.id} className="relative flex items-center gap-2.5 min-h-[1.5rem]">
                      <div className="relative w-5 h-5 rounded border-2 border-slate-300 bg-white flex items-center justify-center flex-shrink-0 z-10">
                        <Checkmark progress={activeProgress} startTiming={item.checkAt} />
                      </div>
                      <span className="text-[12px] text-slate-700 flex-1 pr-2 flex items-center gap-2">{item.label} {item.icon}</span>
                      {item.isTickets && (
                        <motion.span
                          className="text-[11px] font-mono font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded relative z-10"
                          style={{ boxShadow: counterBoxShadow }}
                        >
                          <Counter
                            progress={activeProgress}
                            from={0}
                            to={20}
                            startTiming={76}
                            duration={5}
                          />
                          /20
                        </motion.span>
                      )}
                      {neighbor && (
                        <RowNeighbor
                          progress={activeProgress}
                          name={neighbor.name}
                          Icon={neighbor.Icon}
                          arriveAt={neighbor.arriveAt}
                          accent={neighbor.accent}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-slate-200 mt-4 mb-3"></div>

              {/* READY → LIVE area */}
              <div className="relative h-9 flex items-center justify-center">
                <motion.div
                  className="px-4 py-1.5 rounded-md bg-slate-200 text-slate-500 text-xs font-bold tracking-widest uppercase"
                  style={{ opacity: readyFade }}
                >
                  Ready when filled
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ opacity: liveFade, scale: liveScale }}
                >
                  <div className="px-5 py-1.5 rounded-md bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-bold tracking-widest shadow-lg shadow-red-500/50 flex items-center gap-2">
                    <motion.span
                      className="w-2 h-2 rounded-full bg-white"
                      animate={{ scale: [1, 0.5, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    LIVE
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Envelopes flying out */}
          {ENVELOPES.map((e, i) => (
            <FlyingEnvelope key={`env-${i}`} progress={activeProgress} startTiming={e.t} dx={e.dx} dy={e.dy} />
          ))}

          {/* Tickets streaming in */}
          {TICKETS.map((t, i) => (
            <FlyingTicket
              key={`tk-${i}`}
              progress={activeProgress}
              startTiming={t.t}
              fromX={t.fromX}
              fromY={t.fromY}
            />
          ))}

          {/* Confetti burst */}
          {CONFETTI.map((c, i) => (
            <ConfettiSparkle
              key={`c-${i}`}
              progress={activeProgress}
              startTiming={c.t}
              dx={c.dx}
              dy={c.dy}
              color={c.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
