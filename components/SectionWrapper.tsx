"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SectionWrapperProps {
  children: React.ReactNode;
  stepKey: string;
  bgImage?: string;
}

const variants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export default function SectionWrapper({ children, stepKey, bgImage }: SectionWrapperProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background image with overlay */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-[#0B1426]/85" />
        </div>
      )}
      {!bgImage && <div className="absolute inset-0 bg-[#0B1426]" />}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex flex-col min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
