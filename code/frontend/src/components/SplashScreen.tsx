import { motion } from "motion/react";
import logo from "../assets/logo.png";
 // percorso locale corretto se l'hai in /public o /src/assets

export function SplashScreen() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo AiRide */}
        <motion.img
          src={logo}
          alt="AiRide Logo"
          className="w-32 h-32 object-contain"
          animate={{
            opacity: [1, 0.7, 1],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Nome app */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white text-center"
        >
          
          <p
            className="text-gray-400 mt-2"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            It's time to Ride!
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
