import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";

function HolographicController() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setMousePos({
      x: ((e.clientX - cx) / (rect.width / 2)) * 15,
      y: ((e.clientY - cy) / (rect.height / 2)) * -15,
    });
  }, []);

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="controller-stage"
      style={{ perspective: "800px" }}
    >
      {/* Rotating holographic rings */}

      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`holo-ring ring-${i}`}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
          }}
          transition={{
            duration: 8 + i * 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Background glow */}

      <div className="controller-glow" />

      {/* Controller */}

      <motion.div
        className="controller-body"
        style={{
          rotateX: mousePos.y,
          rotateY: mousePos.x,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          viewBox="0 0 220 160"
          fill="none"
          className="controller-svg"
        >
          <defs>

            <linearGradient
              id="bodyGrad"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#0a0e2e" />
              <stop offset="100%" stopColor="#050820" />
            </linearGradient>

            <linearGradient
              id="glowGrad"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#00f5ff"
                stopOpacity="0.6"
              />

              <stop
                offset="100%"
                stopColor="#8b5cf6"
                stopOpacity="0.6"
              />
            </linearGradient>

            <filter id="controllerGlow">
              <feGaussianBlur
                stdDeviation="2"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

          </defs>

          {/* Main controller */}

          <path
            d="M60 55 C40 55 20 70 18 90 C14 115 24 140 42 140 C52 140 60 132 70 120 L80 105 L140 105 L150 120 C160 132 168 140 178 140 C196 140 206 115 202 90 C200 70 180 55 160 55 Z"
            fill="url(#bodyGrad)"
            stroke="url(#glowGrad)"
            strokeWidth="1.5"
          />

          {/* Center body */}

          <ellipse
            cx="110"
            cy="85"
            rx="50"
            ry="38"
            fill="rgba(0,245,255,0.05)"
            stroke="rgba(0,245,255,0.2)"
          />

          {/* D-Pad */}

          <rect
            x="42"
            y="75"
            width="8"
            height="22"
            rx="2"
            fill="rgba(0,245,255,0.15)"
            stroke="#00f5ff"
            filter="url(#controllerGlow)"
          />

          <rect
            x="36"
            y="81"
            width="20"
            height="10"
            rx="2"
            fill="rgba(0,245,255,0.15)"
            stroke="#00f5ff"
            filter="url(#controllerGlow)"
          />

          {/* Action buttons */}

          <circle
            cx="158"
            cy="75"
            r="5"
            fill="rgba(239,68,68,0.2)"
            stroke="#ef4444"
            filter="url(#controllerGlow)"
          />

          <circle
            cx="170"
            cy="83"
            r="5"
            fill="rgba(34,197,94,0.2)"
            stroke="#22c55e"
            filter="url(#controllerGlow)"
          />

          <circle
            cx="158"
            cy="91"
            r="5"
            fill="rgba(59,130,246,0.2)"
            stroke="#3b82f6"
            filter="url(#controllerGlow)"
          />

          <circle
            cx="146"
            cy="83"
            r="5"
            fill="rgba(234,179,8,0.2)"
            stroke="#eab308"
            filter="url(#controllerGlow)"
          />

          {/* Joysticks */}

          <circle
            cx="80"
            cy="95"
            r="12"
            fill="rgba(139,92,246,0.1)"
            stroke="rgba(139,92,246,0.4)"
          />

          <circle
            cx="80"
            cy="95"
            r="7"
            fill="rgba(139,92,246,0.2)"
            stroke="#8b5cf6"
            filter="url(#controllerGlow)"
          />

          <circle
            cx="140"
            cy="95"
            r="12"
            fill="rgba(0,245,255,0.08)"
            stroke="rgba(0,245,255,0.3)"
          />

          <circle
            cx="140"
            cy="95"
            r="7"
            fill="rgba(0,245,255,0.15)"
            stroke="#00f5ff"
            filter="url(#controllerGlow)"
          />

          {/* Center buttons */}

          <rect
            x="100"
            y="78"
            width="8"
            height="5"
            rx="2.5"
            fill="rgba(0,245,255,0.2)"
            stroke="#00f5ff"
          />

          <rect
            x="112"
            y="78"
            width="8"
            height="5"
            rx="2.5"
            fill="rgba(0,245,255,0.2)"
            stroke="#00f5ff"
          />

          {/* Center logo */}

          <circle
            cx="110"
            cy="85"
            r="8"
            fill="rgba(0,0,0,0.3)"
            stroke="url(#glowGrad)"
          />

          <path
            d="M107 88 L110 82 L113 88"
            fill="rgba(0,245,255,0.6)"
          />

          {/* Shoulder triggers */}

          <path
            d="M62 55 C58 46 66 40 75 40 L88 40 C92 40 93 44 91 55"
            fill="rgba(0,245,255,0.05)"
            stroke="rgba(0,245,255,0.3)"
          />

          <path
            d="M158 55 C162 46 154 40 145 40 L132 40 C128 40 127 44 129 55"
            fill="rgba(139,92,246,0.05)"
            stroke="rgba(139,92,246,0.3)"
          />

          {/* Scan line */}

          <rect
            x="20"
            y="85"
            width="180"
            height="1"
            fill="url(#glowGrad)"
            opacity="0.15"
          />

          {/* LED strip */}

          <path
            d="M70 118 Q110 110 150 118"
            stroke="url(#glowGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />

        </svg>
      </motion.div>

      {/* Neon particles */}

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;

        const rx = 160;
        const ry = 60;

        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;

        return (
          <motion.div
            key={i}
            className="neon-particle"
            style={{
              background:
                i % 2 === 0
                  ? "#00f5ff"
                  : "#a855f7",

              boxShadow:
                i % 2 === 0
                  ? "0 0 8px #00f5ff"
                  : "0 0 8px #a855f7",
            }}
            animate={{
              x: [x, x],
              y: [y, y],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

    </div>
  );
}

export default HolographicController;