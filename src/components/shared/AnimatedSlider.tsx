/**
 * Shared AnimatedSlider Component
 * Slider with motion hover/tap animations
 */

import React from "react";
import { motion } from "motion/react";
import { Slider } from "@/components/ui/slider";

interface AnimatedSliderProps extends React.ComponentPropsWithoutRef<typeof Slider> {
  onValueChange?: (value: number[]) => void;
}

export const AnimatedSlider = React.forwardRef<HTMLDivElement, AnimatedSliderProps>(
  (props, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Slider {...props} />
      </motion.div>
    );
  }
);

AnimatedSlider.displayName = "AnimatedSlider";
