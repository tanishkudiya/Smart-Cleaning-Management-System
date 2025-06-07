import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export default function AnimatedDustbin() {
  const lidControls = useAnimation();

  useEffect(() => {
    const interval = setInterval(() => {
      lidControls.start({
        rotate: [-20, 0],
        transition: { duration: 0.5, repeat: 1, repeatType: "reverse" },
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [lidControls]);

  return (
    <div className="relative w-32 h-40 mx-auto mb-10">
      {/* Dustbin Body */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-28 bg-gray-700 rounded-b-xl shadow-md" />

      {/* Animated Lid – lowered slightly */}
      <motion.div
        animate={lidControls}
        initial={{ rotate: 0 }}
        className="absolute top-[4px] right-1 transform -translate-x-1/2 w-28 h-4 bg-gray-800 rounded-t-md origin-bottom shadow"
      />
    </div>
  );
}
