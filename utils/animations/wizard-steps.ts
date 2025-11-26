import { gsap } from "gsap";

export const stepsAnimation = () => {
  const steps = document.querySelectorAll("#step");

  steps.forEach((step) => {
    const tl = gsap
      .timeline({
        paused: false,
        defaults: { duration: 1 },
      })
      .from(step, { x: 100 })
      .to(step, { x: 0 });
  });
};
