import { motion, type Transition } from 'framer-motion'
import { useEffect, useId, useState } from 'react'
import { scarfColor, useGame } from '@/store/game'

export type MinuMood = 'idle' | 'wave' | 'excited' | 'thinking' | 'listening' | 'celebrate' | 'sad' | 'talking'

interface Props {
  mood?: MinuMood
  size?: number
  className?: string
  /** override the equipped scarf */
  scarf?: string | null
  shadow?: boolean
}

const loop = (duration: number, delay = 0): Transition => ({ duration, repeat: Infinity, ease: 'easeInOut', delay })

/** MINU — the green fox companion. Pure SVG, layered for soft 3D shading. */
export function Minu({ mood = 'idle', size = 200, className, scarf, shadow = true }: Props) {
  const uid = useId().replace(/:/g, '')
  const equipped = useGame((s) => s.progress.minuScarf)
  const scarfFill = scarf === undefined ? scarfColor(equipped) : (scarf ?? undefined)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    let t: number
    const schedule = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 140)
        schedule()
      }, 2200 + Math.random() * 2600)
    }
    schedule()
    return () => clearTimeout(t)
  }, [])

  const happyEyes = mood === 'excited' || mood === 'celebrate'
  const g = (n: string) => `${n}-${uid}`

  const bodyAnim =
    mood === 'celebrate'
      ? { y: [0, -26, 0], transition: loop(0.7) }
      : mood === 'excited'
        ? { y: [0, -10, 0], transition: loop(0.5) }
        : mood === 'sad'
          ? { y: [3, 4, 3], transition: loop(3) }
          : { y: [0, -2, 0], transition: loop(3.2) }

  const headAnim =
    mood === 'thinking'
      ? { rotate: [-7, -4, -7], transition: loop(2.4) }
      : mood === 'listening'
        ? { rotate: [9, 6, 9], transition: loop(2) }
        : mood === 'talking'
          ? { rotate: [-2, 3, -2], y: [0, 1.5, 0], transition: loop(0.6) }
          : mood === 'sad'
            ? { rotate: [0, 0], y: [5, 5], transition: { duration: 0.4 } }
            : { rotate: [-1.5, 1.5, -1.5], transition: loop(4) }

  const earAngle = mood === 'sad' ? 22 : mood === 'listening' ? -6 : 0

  return (
    <svg viewBox="0 0 200 222" width={size} height={size * 1.11} className={className} style={{ overflow: 'visible' }} aria-label="Minu the green fox">
      <defs>
        <radialGradient id={g('lime')} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#d9ff8a" />
          <stop offset="45%" stopColor="#a6e33a" />
          <stop offset="100%" stopColor="#5d9e17" />
        </radialGradient>
        <radialGradient id={g('lime2')} cx="40%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#c9f86b" />
          <stop offset="100%" stopColor="#6aad1c" />
        </radialGradient>
        <radialGradient id={g('cream')} cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fffdf3" />
          <stop offset="100%" stopColor="#efe2bf" />
        </radialGradient>
        <linearGradient id={g('forest')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2c6b3a" />
          <stop offset="100%" stopColor="#123020" />
        </linearGradient>
        <radialGradient id={g('eye')} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#2a4a32" />
          <stop offset="100%" stopColor="#081610" />
        </radialGradient>
      </defs>

      {shadow && (
        <motion.ellipse
          cx="100"
          cy="212"
          rx="52"
          ry="8"
          fill="#000"
          opacity={0.22}
          animate={mood === 'celebrate' ? { rx: [52, 36, 52], opacity: [0.22, 0.1, 0.22] } : { rx: 52 }}
          transition={mood === 'celebrate' ? loop(0.7) : undefined}
        />
      )}

      <motion.g animate={bodyAnim}>
        {/* Tail */}
        <motion.g
          style={{ originX: 0.05, originY: 0.95 }}
          animate={{ rotate: mood === 'sad' ? [18, 22, 18] : mood === 'excited' || mood === 'celebrate' ? [-14, 12, -14] : [-6, 6, -6] }}
          transition={loop(mood === 'excited' || mood === 'celebrate' ? 0.45 : 2.6)}
        >
          <path d="M124 186 C172 192 200 152 186 110 C179 90 158 86 156 106 C154 128 162 152 120 164 Z" fill={`url(#${g('lime2')})`} />
          <path d="M186 110 C179 90 158 86 156 106 C155 116 158 124 164 130 C176 132 190 124 186 110 Z" fill={`url(#${g('forest')})`} />
          <path d="M158 112 C162 126 162 146 140 162" stroke="#fff8dc" strokeOpacity="0.45" strokeWidth="5" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Feet */}
        <ellipse cx="80" cy="203" rx="15" ry="8.5" fill="#6aad1c" />
        <ellipse cx="120" cy="203" rx="15" ry="8.5" fill="#6aad1c" />
        <ellipse cx="80" cy="205" rx="9" ry="4" fill="#f4ead0" />
        <ellipse cx="120" cy="205" rx="9" ry="4" fill="#f4ead0" />

        {/* Body */}
        <motion.g style={{ originX: 0.5, originY: 1 }} animate={{ scaleY: [1, 1.025, 1] }} transition={loop(3.2)}>
          <ellipse cx="100" cy="166" rx="42" ry="40" fill={`url(#${g('lime')})`} />
          <ellipse cx="100" cy="174" rx="25" ry="27" fill={`url(#${g('cream')})`} />
        </motion.g>

        {/* Left arm */}
        <motion.g
          style={{ originX: 0.6, originY: 0.1 }}
          animate={mood === 'celebrate' ? { rotate: [140, 160, 140] } : { rotate: 18 }}
          transition={mood === 'celebrate' ? loop(0.35) : { duration: 0.3 }}
        >
          <ellipse cx="64" cy="168" rx="10" ry="19" fill={`url(#${g('lime2')})`} />
          <ellipse cx="64" cy="183" rx="7" ry="5" fill="#f4ead0" />
        </motion.g>
        {/* Right arm */}
        <motion.g
          style={{ originX: 0.4, originY: 0.1 }}
          animate={
            mood === 'wave'
              ? { rotate: [-20, -150, -110, -150, -110, -20] }
              : mood === 'celebrate'
                ? { rotate: [-140, -160, -140] }
                : mood === 'thinking'
                  ? { rotate: -125 }
                  : { rotate: -18 }
          }
          transition={mood === 'wave' ? { duration: 1.8, repeat: Infinity, repeatDelay: 0.8 } : mood === 'celebrate' ? loop(0.35) : { duration: 0.4 }}
        >
          <ellipse cx="136" cy="168" rx="10" ry="19" fill={`url(#${g('lime2')})`} />
          <ellipse cx="136" cy="183" rx="7" ry="5" fill="#f4ead0" />
        </motion.g>

        {/* Scarf */}
        {scarfFill && (
          <g>
            <path d="M64 130 Q100 150 136 130 L137 141 Q100 162 63 141 Z" fill={scarfFill} stroke="#00000022" />
            <path d="M116 146 L126 172 L112 170 L106 148 Z" fill={scarfFill} stroke="#00000022" />
            {equipped === 'minu-scarf-kasavu' && <path d="M63 141 Q100 162 137 141" stroke="#d4a017" strokeWidth="3" fill="none" />}
          </g>
        )}

        {/* Head */}
        <motion.g style={{ originX: 0.5, originY: 0.9 }} animate={headAnim}>
          {/* Ears */}
          <motion.g style={{ originX: 0.8, originY: 0.9 }} animate={{ rotate: -earAngle, scaleY: mood === 'listening' ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }}>
            <path d="M58 76 Q42 32 52 16 Q60 10 70 20 L96 54 Z" fill={`url(#${g('lime2')})`} />
            <path d="M52 16 Q60 10 70 20 L76 28 Q62 30 50 36 Q48 22 52 16 Z" fill={`url(#${g('forest')})`} />
            <path d="M63 66 Q54 42 60 34 Q66 34 74 42 L86 58 Z" fill="#f6dccb" />
          </motion.g>
          <motion.g style={{ originX: 0.2, originY: 0.9 }} animate={{ rotate: earAngle, scaleY: mood === 'listening' ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }}>
            <path d="M142 76 Q158 32 148 16 Q140 10 130 20 L104 54 Z" fill={`url(#${g('lime2')})`} />
            <path d="M148 16 Q140 10 130 20 L124 28 Q138 30 150 36 Q152 22 148 16 Z" fill={`url(#${g('forest')})`} />
            <path d="M137 66 Q146 42 140 34 Q134 34 126 42 L114 58 Z" fill="#f6dccb" />
          </motion.g>

          {/* Cheek fluff */}
          <path d="M54 98 L36 112 L58 116 Z" fill="#8fd32a" />
          <path d="M146 98 L164 112 L142 116 Z" fill="#8fd32a" />

          <path
            d="M100 40 C136 40 152 62 152 88 C152 102 148 112 142 119 C129 133 115 137 100 137 C85 137 71 133 58 119 C52 112 48 102 48 88 C48 62 64 40 100 40 Z"
            fill={`url(#${g('lime')})`}
          />
          {/* forehead highlight */}
          <ellipse cx="88" cy="56" rx="22" ry="9" fill="#fff" opacity="0.18" />

          {/* Muzzle */}
          <path d="M100 82 C120 82 134 97 134 112 C134 127 117 135 100 135 C83 135 66 127 66 112 C66 97 80 82 100 82 Z" fill={`url(#${g('cream')})`} />

          {/* Eyes */}
          {happyEyes ? (
            <g stroke="#0d2416" strokeWidth="5" strokeLinecap="round" fill="none">
              <path d="M70 90 Q80 77 90 90" />
              <path d="M110 90 Q120 77 130 90" />
            </g>
          ) : (
            <motion.g style={{ originX: 0.5, originY: 0.5 }} animate={{ scaleY: blink ? 0.08 : 1 }} transition={{ duration: 0.07 }}>
              <g transform={mood === 'thinking' ? 'translate(2 -4)' : mood === 'sad' ? 'translate(0 3)' : undefined}>
                <ellipse cx="80" cy="86" rx="10.5" ry="12.5" fill={`url(#${g('eye')})`} />
                <ellipse cx="120" cy="86" rx="10.5" ry="12.5" fill={`url(#${g('eye')})`} />
                <circle cx="84" cy="81" r="4.2" fill="#fff" />
                <circle cx="124" cy="81" r="4.2" fill="#fff" />
                <circle cx="77" cy="91" r="1.8" fill="#fff" opacity="0.8" />
                <circle cx="117" cy="91" r="1.8" fill="#fff" opacity="0.8" />
              </g>
            </motion.g>
          )}
          {mood === 'sad' && (
            <g stroke="#2a5a2a" strokeWidth="3" strokeLinecap="round">
              <path d="M68 70 L88 74" />
              <path d="M132 70 L112 74" />
            </g>
          )}
          {mood === 'thinking' && (
            <g stroke="#2a5a2a" strokeWidth="3" strokeLinecap="round">
              <path d="M70 70 L88 68" />
              <path d="M112 66 L130 70" />
            </g>
          )}

          {/* Blush */}
          <ellipse cx="66" cy="108" rx="8" ry="5" fill="#ff9a8a" opacity="0.45" />
          <ellipse cx="134" cy="108" rx="8" ry="5" fill="#ff9a8a" opacity="0.45" />

          {/* Nose */}
          <ellipse cx="100" cy="103" rx="7.5" ry="5.5" fill="#0d2416" />
          <ellipse cx="98" cy="101" rx="2.5" ry="1.5" fill="#fff" opacity="0.7" />

          {/* Mouth */}
          {mood === 'excited' || mood === 'celebrate' ? (
            <g>
              <path d="M89 111 Q100 128 111 111 Z" fill="#7a1f2b" />
              <path d="M94 119 Q100 124 106 119 Q100 116 94 119 Z" fill="#ff7c8c" />
            </g>
          ) : mood === 'talking' ? (
            <motion.ellipse cx="100" cy="115" rx="6" fill="#7a1f2b" animate={{ ry: [1.5, 5, 1.5] }} transition={loop(0.32)} />
          ) : mood === 'sad' ? (
            <path d="M92 118 Q100 112 108 118" stroke="#0d2416" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M91 111 Q95.5 117 100 111 Q104.5 117 109 111" stroke="#0d2416" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}
        </motion.g>

        {/* Thought bubble */}
        {mood === 'thinking' && (
          <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ originX: 0, originY: 1 }}>
            <circle cx="160" cy="46" r="4" fill="#fbf6e6" />
            <circle cx="170" cy="32" r="6" fill="#fbf6e6" />
            <ellipse cx="184" cy="12" rx="18" ry="12" fill="#fbf6e6" />
            {[176, 184, 192].map((x, i) => (
              <motion.circle key={x} cx={x} cy="12" r="2.4" fill="#14361f" animate={{ opacity: [0.2, 1, 0.2] }} transition={loop(1.2, i * 0.2)} />
            ))}
          </motion.g>
        )}
        {/* Listening waves */}
        {mood === 'listening' && (
          <g fill="none" stroke="#b8f53c" strokeWidth="3" strokeLinecap="round">
            {[0, 1, 2].map((i) => (
              <motion.path key={i} d={`M${162 + i * 9} ${40 - i * 4} Q${170 + i * 11} 58 ${162 + i * 9} ${76 + i * 4}`} animate={{ opacity: [0, 1, 0] }} transition={loop(1.4, i * 0.25)} />
            ))}
          </g>
        )}
      </motion.g>
    </svg>
  )
}
