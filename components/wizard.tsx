"use client";

import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
  useRef,
  useEffect,
} from "react";
import { Button } from "./ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";

const NextPage = ({
  nextPage,
  activePage,
  totalPages,
  disabled,
}: {
  nextPage: () => void;
  activePage: number;
  totalPages: number;
  disabled?: boolean;
}) => {
  const isLastPage = activePage >= totalPages - 1;

  return (
    <Button
      onClick={nextPage}
      type={isLastPage ? "submit" : "button"}
      className="w-full h-12 text-lg"
      disabled={disabled}
    >
      {activePage === 0 ? "Comenzar" : isLastPage ? "¡Jugar!" : "Siguiente"}
    </Button>
  );
};

const BackPage = ({
  backPage,
  activePage,
  disabled,
}: {
  backPage: () => void;
  activePage: number;
  disabled?: boolean;
}) => {
  return (
    <Button
      disabled={activePage === 0 || disabled}
      onClick={backPage}
      type="button"
      className="w-10 h-10"
    >
      <ChevronLeft />
    </Button>
  );
};

const Wizard = ({ children }: PropsWithChildren) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const pages = React.Children.toArray(children);
  const currentPage = pages[activePageIndex];

  // Función para animar el cambio de step
  const animateStepChange = (direction: "next" | "prev") => {
    if (isAnimating || !stepRef.current) return;

    setIsAnimating(true);

    const exitX = direction === "next" ? -100 : 100;
    const enterX = direction === "next" ? 100 : -100;

    // Animación de salida
    gsap.to(stepRef.current, {
      x: exitX,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        // Cambiar el contenido después de la salida
        if (direction === "next") {
          setActivePageIndex((prev) => prev + 1);
        } else {
          setActivePageIndex((prev) => prev - 1);
        }

        // Usar setTimeout para asegurar que React haya actualizado el DOM
        setTimeout(() => {
          if (stepRef.current) {
            // Resetear posición antes de animar entrada
            gsap.set(stepRef.current, {
              x: enterX,
              opacity: 0,
            });

            // Animación de entrada
            gsap.to(stepRef.current, {
              x: 0,
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => {
                setIsAnimating(false);
              },
            });
          } else {
            setIsAnimating(false);
          }
        }, 50);
      },
    });
  };

  // Animación inicial del primer step
  useGSAP(() => {
    if (stepRef.current) {
      gsap.fromTo(
        stepRef.current,
        {
          x: 50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        }
      );
    }
  }, []);

  const handleNext = () => {
    if (!isAnimating && activePageIndex < pages.length - 1) {
      animateStepChange("next");
    }
  };

  const handleBack = () => {
    if (!isAnimating && activePageIndex > 0) {
      animateStepChange("prev");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-center items-center gap-5">
        {activePageIndex !== 0 && (
          <BackPage
            backPage={handleBack}
            activePage={activePageIndex}
            disabled={isAnimating}
          />
        )}
        <Progress
          value={33 * activePageIndex == 99 ? 100 : 33 * activePageIndex}
          className="bg-surface"
          color="white"
        />
      </div>

      <div ref={stepRef} className="min-h-[400px]">
        {currentPage}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4 pt-6">
        <NextPage
          nextPage={handleNext}
          activePage={activePageIndex}
          totalPages={pages.length}
          disabled={isAnimating}
        />
      </div>
    </div>
  );
};

export default Wizard;
