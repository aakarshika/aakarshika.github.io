import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  Apple,
  Carrot,
  Cherry,
  LeafyGreen,
  Grape,
  BadgePercent,
  TrendingUp,
  Leaf,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { useAnimationValue } from '../hooks/useAnimationValue';

// ============================================================
// Helpers
// ============================================================

const Counter = ({ progress, from, to, startTiming, duration, format = (n) => n }) => {
  const v = useTransform(progress, [startTiming, startTiming + duration], [from, to], { clamp: true });
  const [n, setN] = useState(from);
  useMotionValueEvent(v, 'change', (latest) => {
    const next = Math.floor(latest);
    setN((prev) => (prev === next ? prev : next));
  });
  return <>{format(n)}</>;
};

// A single bar in the inventory bar-chart. Grows upward like inventory restocking,
// then shrinks slightly to evoke "stock being sold" before settling.
const InventoryBar = ({ progress, startTiming, height, color, Icon, iconColor, label, slideOutAt }) => {
  const growAnim = [
    { initialValue: 0, finalValue: height, startTiming, duration: 1.4 },
    { initialValue: height, finalValue: Math.max(height - 18, 12), startTiming: startTiming + 4, duration: 0.9 },
    { initialValue: Math.max(height - 18, 12), finalValue: 0, startTiming: slideOutAt, duration: 1.6 },
  ];
  const fadeAnim = [
    { initialValue: 0, finalValue: 1, startTiming, duration: 0.6 },
    { initialValue: 1, finalValue: 0, startTiming: slideOutAt, duration: 1.2 },
  ];
  const iconPopScale = [
    { initialValue: 0, finalValue: 1.15, startTiming: startTiming + 1.2, duration: 0.4 },
    { initialValue: 1.15, finalValue: 1, startTiming: startTiming + 1.6, duration: 0.4 },
    { initialValue: 1, finalValue: 0, startTiming: slideOutAt, duration: 0.8 },
  ];

  const h = useAnimationValue(progress, growAnim, 'slideY', 0);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);
  const iconScale = useAnimationValue(progress, iconPopScale, 'scale', 0);

  return (
    <div className="relative flex flex-col items-center justify-end h-full" style={{ width: 28 }}>
      <motion.div className="absolute -top-1" style={{ scale: iconScale }}>
        <div className={`w-6 h-6 rounded-full ${iconColor} flex items-center justify-center shadow-md`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </motion.div>
      <motion.div
        className={`w-5 rounded-t-md ${color} shadow-sm`}
        style={{ height: h, opacity: fade, originY: 1 }}
      />
      <div className="text-[8px] font-semibold uppercase tracking-wide text-emerald-900/70 mt-1">
        {label}
      </div>
    </div>
  );
};

// A floating discount badge that rotates in, hovers, then drifts off.
const DiscountBadge = ({ progress, startTiming, label, percent, x, y, accent, slideOutAt }) => {
  const scaleAnim = [
    { initialValue: 0, finalValue: 1.2, startTiming, duration: 0.45 },
    { initialValue: 1.2, finalValue: 1, startTiming: startTiming + 0.45, duration: 0.4 },
    { initialValue: 1, finalValue: 0, startTiming: slideOutAt, duration: 0.6 },
  ];
  const rotateAnim = [
    { initialValue: -180, finalValue: -8, startTiming, duration: 0.85 },
    { initialValue: -8, finalValue: 6, startTiming: startTiming + 1.2, duration: 1.6 },
    { initialValue: 6, finalValue: -8, startTiming: startTiming + 2.8, duration: 1.6 },
  ];
  const fadeAnim = [
    { initialValue: 0, finalValue: 1, startTiming, duration: 0.4 },
    { initialValue: 1, finalValue: 0, startTiming: slideOutAt, duration: 0.6 },
  ];

  const scale = useAnimationValue(progress, scaleAnim, 'scale', 0);
  const rotate = useAnimationValue(progress, rotateAnim, 'rotate', -180);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);

  return (
    <motion.div
      className={`absolute flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold shadow-lg ${accent}`}
      style={{ left: x, top: y, scale, rotate, opacity: fade, transformOrigin: 'center center' }}
    >
      <BadgePercent className="w-3 h-3" />
      <span>{percent}</span>
      <span className="opacity-80 font-semibold">{label}</span>
    </motion.div>
  );
};

const ProfitSparkle = ({ progress, startTiming, dx, dy, color }) => {
  const xAnim = [{ initialValue: 0, finalValue: dx, startTiming, duration: 1.6 }];
  const yAnim = [{ initialValue: 0, finalValue: dy, startTiming, duration: 1.6 }];
  const fadeAnim = [
    { initialValue: 0, finalValue: 1, startTiming, duration: 0.3 },
    { initialValue: 1, finalValue: 0, startTiming: startTiming + 0.9, duration: 0.7 },
  ];
  const scaleAnim = [
    { initialValue: 0, finalValue: 1.2, startTiming, duration: 0.4 },
    { initialValue: 1.2, finalValue: 0, startTiming: startTiming + 1, duration: 0.6 },
  ];
  const rotateAnim = [{ initialValue: 0, finalValue: 360, startTiming, duration: 1.6 }];

  const x = useAnimationValue(progress, xAnim, 'slideX', 0);
  const y = useAnimationValue(progress, yAnim, 'slideY', 0);
  const fade = useAnimationValue(progress, fadeAnim, 'fade', 0);
  const scale = useAnimationValue(progress, scaleAnim, 'scale', 0);
  const rotate = useAnimationValue(progress, rotateAnim, 'rotate', 0);

  return (
    <div className="absolute pointer-events-none" style={{ left: '50%', top: '50%' }}>
      <motion.div style={{ x, y, opacity: fade, scale, rotate, marginLeft: -8, marginTop: -8 }}>
        <Sparkles className="w-4 h-4" style={{ color }} />
      </motion.div>
    </div>
  );
};

// ============================================================
// Animation timing config
// ============================================================
//
// ProcureWin sits between Twirly (center 16.67) and Daywise (center 50.00)
// in the 7-card horizontal-scroll timeline. Card center = 33.33.
// Slide-in window:  ~17 → 25  (during Twirly → ProcureWin transition)
// Hold window:      ~25 → 40
// Slide-out window: ~42 → 48  (during ProcureWin → Daywise transition)

const SLIDE_IN_X = 220;
const SLIDE_OUT_X = -340;
const SLIDE_OUT_AT = 42;

const TITLE_SLIDE_ANIM = [
  { initialValue: -120, finalValue: 0, startTiming: 18, duration: 2.4 },
  { initialValue: 0, finalValue: SLIDE_OUT_X, startTiming: SLIDE_OUT_AT, duration: 5 },
];
const COPY_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 19, duration: 2 },
  { initialValue: 1, finalValue: 0, startTiming: SLIDE_OUT_AT, duration: 4 },
];
const COPY_SLIDE_ANIM = [
  { initialValue: -60, finalValue: 0, startTiming: 19, duration: 3 },
  { initialValue: 0, finalValue: SLIDE_OUT_X, startTiming: SLIDE_OUT_AT + 0.5, duration: 5 },
];
const TAG_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 21, duration: 2 },
  { initialValue: 1, finalValue: 0, startTiming: SLIDE_OUT_AT, duration: 4 },
];

const DASHBOARD_SLIDE_ANIM = [
  { initialValue: SLIDE_IN_X, finalValue: 0, startTiming: 19, duration: 3 },
  { initialValue: 0, finalValue: SLIDE_OUT_X, startTiming: SLIDE_OUT_AT + 1, duration: 5 },
];
const DASHBOARD_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 19, duration: 2.5 },
  { initialValue: 1, finalValue: 0, startTiming: SLIDE_OUT_AT + 2, duration: 3.5 },
];
const DASHBOARD_SCALE_ANIM = [
  { initialValue: 0.85, finalValue: 1, startTiming: 19, duration: 2.5 },
];

const COUNTER_GLOW_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 30, duration: 1 },
  { initialValue: 1, finalValue: 0.4, startTiming: 38, duration: 2 },
];

const TRENDLINE_DRAW_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 31, duration: 4.5 },
];

const TRENDING_ARROW_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 35.5, duration: 0.6 },
];

// Inventory bars grow in a quick stagger right after the dashboard appears.
const BARS = [
  { label: 'Apl',  height: 60, color: 'bg-rose-400',     iconColor: 'bg-rose-500',     Icon: Apple,      t: 22 },
  { label: 'Crrt', height: 78, color: 'bg-orange-400',   iconColor: 'bg-orange-500',   Icon: Carrot,     t: 22.4 },
  { label: 'Grns', height: 92, color: 'bg-emerald-400',  iconColor: 'bg-emerald-600',  Icon: LeafyGreen, t: 22.8 },
  { label: 'Chry', height: 50, color: 'bg-pink-400',     iconColor: 'bg-pink-600',     Icon: Cherry,     t: 23.2 },
  { label: 'Grp',  height: 70, color: 'bg-violet-400',   iconColor: 'bg-violet-600',   Icon: Grape,      t: 23.6 },
];

// Discount badges fly in once the chart has settled.
const BADGES = [
  { label: 'Apples',  percent: '-20%', x: -18, y: -18,  accent: 'bg-rose-500 text-white',     t: 27 },
  { label: 'Greens',  percent: '-15%', x: 218, y: -8,   accent: 'bg-emerald-500 text-white',  t: 28 },
  { label: 'Carrots', percent: '-25%', x: 232, y: 138,  accent: 'bg-orange-500 text-white',   t: 29 },
];

// Profit-sparkle confetti burst once the counter and trend-line resolve.
const SPARKLES = [
  { dx: -90,  dy: -55, color: 'rgb(52 211 153)',  t: 36.0 },
  { dx: 95,   dy: -48, color: 'rgb(244 191 71)',  t: 36.2 },
  { dx: -70,  dy: 70,  color: 'rgb(251 113 133)', t: 36.4 },
  { dx: 95,   dy: 70,  color: 'rgb(34 211 238)',  t: 36.6 },
  { dx: 0,    dy: -85, color: 'rgb(167 243 208)', t: 36.8 },
];

// ============================================================
// Main component
// ============================================================

export const ProcureWinProject = ({ progressMotionValue, isMobile = false }) => {
  const fallbackProgress = useMotionValue(0);
  // On mobile, freeze at the moment everything has fully resolved (sparkles fired,
  // before the slide-out begins at 42).
  const mobileStaticProgress = useMotionValue(38);
  const activeProgress = isMobile
    ? mobileStaticProgress
    : (progressMotionValue ?? fallbackProgress);

  const titleSlideX = useAnimationValue(activeProgress, TITLE_SLIDE_ANIM, 'slideX', -120);
  const copyFade = useAnimationValue(activeProgress, COPY_FADE_ANIM, 'fade', 0);
  const copySlideX = useAnimationValue(activeProgress, COPY_SLIDE_ANIM, 'slideX', -60);
  const tagFade = useAnimationValue(activeProgress, TAG_FADE_ANIM, 'fade', 0);

  const dashboardSlideX = useAnimationValue(activeProgress, DASHBOARD_SLIDE_ANIM, 'slideX', SLIDE_IN_X);
  const dashboardFade = useAnimationValue(activeProgress, DASHBOARD_FADE_ANIM, 'fade', 0);
  const dashboardScale = useAnimationValue(activeProgress, DASHBOARD_SCALE_ANIM, 'scale', 0.85);

  const counterGlow = useAnimationValue(activeProgress, COUNTER_GLOW_ANIM, 'fade', 0);
  const counterShadow = useTransform(
    counterGlow,
    (v) => `0 0 ${v * 16}px rgba(16,185,129,${v * 0.7})`
  );

  const trendLength = useAnimationValue(activeProgress, TRENDLINE_DRAW_ANIM, 'fade', 0);
  const arrowFade = useAnimationValue(activeProgress, TRENDING_ARROW_ANIM, 'fade', 0);
  const arrowScale = useAnimationValue(activeProgress, TRENDING_ARROW_ANIM, 'fade', 0);

  return (
    <div className="md:w-screen sm:w-full h-screen md:h-screen px-4 sm:px-6 py-10 md:py-0 flex items-center justify-center relative flex-shrink-0">
      {/* Background bridges Twirly's purple → Daywise's purple, with a fresh emerald wash. */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-emerald-900/70 to-purple-900"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-purple-900/30"></div>

      <div className="relative z-10 grid grid-cols-2 gap-8 gap-12 items-center max-w-6xl">
        {/* Left: copy */}
        <div className="relative w-screen sm:w-full md:w-full">
          <motion.h3
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-emerald-300"
            style={{ x: titleSlideX }}
          >
            ProcureWin
          </motion.h3>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-white mb-6"
            style={{ opacity: copyFade, x: copySlideX }}
          >
            A <span className="text-emerald-300 font-semibold">fresh-produce e-commerce</span> &amp; inventory platform — orchestrating procurement,
            perishable stock, dynamic discounts, and the margins they protect. <span className="text-emerald-200/90">AI</span> powers smart procurement decisions,
            with forecasting tuned to <span className="text-emerald-300 font-semibold">Indian SKU prices</span>.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3 mb-6"
            style={{ opacity: tagFade, x: copySlideX }}
          >
            <span className="px-3 py-1 bg-emerald-600 rounded-full text-sm">Full-Stack</span>
            <span className="px-3 py-1 bg-lime-700 rounded-full text-sm">Inventory Systems</span>
            <span className="px-3 py-1 bg-amber-700 rounded-full text-sm">E-commerce</span>
            <span className="px-3 py-1 bg-rose-700 rounded-full text-sm">Dynamic Pricing</span>
            <span className="px-3 py-1 bg-teal-800 rounded-full text-sm">AI Procurement</span>
            <span className="px-3 py-1 bg-cyan-900/80 rounded-full text-sm">SKU Forecasting (India)</span>
          </motion.div>
          <motion.a
            href="https://www.procurewin.com"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-300 hover:text-emerald-200 font-semibold"
            style={{ opacity: tagFade, x: copySlideX }}
          >
            View Live Site →
          </motion.a>
        </div>

        {/* Right: animated dashboard */}
        <div className="relative w-screen sm:w-full md:w-full flex justify-center">
          <motion.div
            className="relative w-[300px] sm:w-[360px] md:w-[420px] rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 shadow-2xl shadow-emerald-950/60 px-5 py-5 -rotate-1 border border-emerald-200/60"
            style={{ x: dashboardSlideX, opacity: dashboardFade, scale: dashboardScale }}
          >
            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-700 font-bold">
                    ProcureWin
                  </div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">Daily Inventory</div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider">Live</span>
              </div>
            </div>

            {/* Inventory bar chart */}
            <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-200/70 px-3 pt-5 pb-2 mb-3">
              <div className="flex items-end justify-between gap-1 h-28 relative">
                {/* gridlines */}
                <div className="absolute inset-x-2 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-dashed border-emerald-200/80 h-px"></div>
                  <div className="border-t border-dashed border-emerald-200/60 h-px"></div>
                  <div className="border-t border-dashed border-emerald-200/40 h-px"></div>
                </div>
                {BARS.map((b, i) => (
                  <InventoryBar
                    key={`bar-${i}`}
                    progress={activeProgress}
                    startTiming={b.t}
                    height={b.height}
                    color={b.color}
                    iconColor={b.iconColor}
                    Icon={b.Icon}
                    label={b.label}
                    slideOutAt={SLIDE_OUT_AT}
                  />
                ))}
              </div>
            </div>

            {/* Profit / trend strip */}
            <motion.div
              className="relative rounded-xl bg-gradient-to-r from-emerald-500/95 to-lime-500/95 px-3 py-2.5 overflow-hidden"
              style={{ boxShadow: counterShadow }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-white/80 font-semibold">
                    Today&apos;s Profit
                  </div>
                  <div className="flex items-baseline gap-1 text-white font-bold">
                    <DollarSign className="w-3 h-3 mt-0.5" />
                    <span className="text-lg leading-none font-mono">
                      <Counter
                        progress={activeProgress}
                        from={0}
                        to={24}
                        startTiming={30}
                        duration={5}
                      />
                      ,
                      <Counter
                        progress={activeProgress}
                        from={0}
                        to={580}
                        startTiming={30}
                        duration={5}
                        format={(n) => String(n).padStart(3, '0')}
                      />
                    </span>
                    <motion.span
                      className="ml-1 flex items-center text-white/95 text-[10px] font-bold gap-0.5"
                      style={{ opacity: arrowFade, scale: arrowScale }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      +18.4%
                    </motion.span>
                  </div>
                </div>

                {/* Mini line-chart */}
                <svg viewBox="0 0 80 30" className="w-24 h-8">
                  <motion.path
                    d="M 2 24 L 14 20 L 26 22 L 38 14 L 50 16 L 62 8 L 76 4"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{ pathLength: trendLength }}
                  />
                  <motion.circle cx="76" cy="4" r="2.5" fill="white" style={{ opacity: arrowFade }} />
                </svg>
              </div>
              {/* sparkle bursts when profit lands */}
              {SPARKLES.map((s, i) => (
                <ProfitSparkle
                  key={`spk-${i}`}
                  progress={activeProgress}
                  startTiming={s.t}
                  dx={s.dx}
                  dy={s.dy}
                  color={s.color}
                />
              ))}
            </motion.div>

            {/* Floating discount badges */}
            {BADGES.map((b, i) => (
              <DiscountBadge
                key={`badge-${i}`}
                progress={activeProgress}
                startTiming={b.t}
                label={b.label}
                percent={b.percent}
                x={b.x}
                y={b.y}
                accent={b.accent}
                slideOutAt={SLIDE_OUT_AT}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
