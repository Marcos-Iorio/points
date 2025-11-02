import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother, ScrollTrigger } from "@/plugins";

export const stepsAnimation = () => {
  useGSAP(() => {
    if (typeof window === "undefined") return;
    const tl = gsap
      .timeline({
        paused: true,
        defaults: { duration: 1 },
      })
      .to("#step", { opacity: 0 });
  });
};
