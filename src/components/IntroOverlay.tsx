import { motion } from "framer-motion";

/**
 * Builds an SVG path string for a horizontal sine-ish wave that tiles
 * cleanly: animating translateX by one `wave` value loops seamlessly.
 */
function buildWavePath(
  y: number,
  amplitude: number,
  wave: number,
  width: number
): string {
  const parts: string[] = [`M 0 ${y}`];
  for (let x = 0; x < width; x += wave) {
    const c1x = x + wave * 0.25;
    const c2x = x + wave * 0.75;
    const midX = x + wave * 0.5;
    const endX = x + wave;
    parts.push(`Q ${c1x} ${y - amplitude}, ${midX} ${y}`);
    parts.push(`Q ${c2x} ${y + amplitude}, ${endX} ${y}`);
  }
  return parts.join(" ");
}

const W = 2400; // 2x typical viewport so one wavelength of translation tiles
const lines = [
  { y: 180, amp: 36, wave: 220, opacity: 0.28, dur: 4.0 },
  { y: 320, amp: 52, wave: 280, opacity: 0.36, dur: 5.2 },
  { y: 480, amp: 44, wave: 240, opacity: 0.32, dur: 4.4 },
  { y: 640, amp: 60, wave: 300, opacity: 0.28, dur: 5.8 },
  { y: 820, amp: 40, wave: 260, opacity: 0.24, dur: 4.8 },
];

type Props = {
  visible: boolean;
};

export function IntroOverlay({ visible }: Props) {
  return (
    <motion.div
      // No z-index — let the wave stack at its natural document order,
      // behind the cards canvas which comes after it in the App tree.
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: visible ? 0.7 : 0.9, ease: "easeOut" }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W / 2} 1000`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((line, i) => (
          <motion.g
            key={i}
            initial={{ x: 0 }}
            animate={{ x: -line.wave }}
            transition={{
              duration: line.dur,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            <path
              d={buildWavePath(line.y, line.amp, line.wave, W)}
              stroke="url(#waveStroke)"
              strokeWidth={1.4}
              strokeOpacity={line.opacity}
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}
