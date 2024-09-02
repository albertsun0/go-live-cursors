// https://liveblocks.io/blog/how-to-animate-multiplayer-cursors
import { motion } from "framer-motion";

// Spring animated cursor
export default function Cursor({ color, x, y, name }) {
  return (
    <motion.div
      className="pointer-events-none hover:opacity-20"
      style={{
        position: "absolute",
        top: "0",
        left: "0",
      }}
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{
        type: "spring",
        damping: 30,
        mass: 0.8,
        stiffness: 350,
      }}
    >
      <CursorSvg color={color} name={name} />
    </motion.div>
  );
}

// SVG cursor shape
function CursorSvg({ color, name }) {
  return (
    <div>
      <svg width="32" height="44" viewBox="0 0 24 36" fill="none">
        <path
          fill={color}
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        />
      </svg>
      <div
        className="text-sm text-white rounded-lg px-2 -translate-y-4"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
