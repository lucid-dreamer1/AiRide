import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo */}
        <div className="relative">
          <motion.div
            animate={{
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Helmet shape */}
              <motion.path
                d="M60 20C40 20 25 35 25 55C25 65 27 73 30 80L40 95C45 100 52 103 60 103C68 103 75 100 80 95L90 80C93 73 95 65 95 55C95 35 80 20 60 20Z"
                fill="#E85A2A"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              {/* Visor */}
              <motion.path
                d="M35 50C35 50 40 45 60 45C80 45 85 50 85 50L80 65C80 65 75 70 60 70C45 70 40 65 40 65L35 50Z"
                fill="white"
                fillOpacity="0.3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              />
              {/* AI Circuit lines */}
              <motion.circle
                cx="60"
                cy="35"
                r="3"
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 1 }}
              />
              <motion.line
                x1="60"
                y1="38"
                x2="60"
                y2="45"
                stroke="white"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white text-center"
        >
          <h1
            className="text-5xl"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Ai
            <span
              style={{
                background: "linear-gradient(to right, white, #E85A2A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              R
            </span>
            ide
          </h1>

          <p
            className="text-gray-400 mt-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Smart Helmet Navigation
          </p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#E85A2A]"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
