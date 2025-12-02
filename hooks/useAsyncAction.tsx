"use client";

import { useState } from "react";

export const useAsyncAction = (delay: number = 500, successDelay: number = 2000) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const executeAction = async (action: () => void | Promise<void>) => {
    if (isLoading || isSuccess) return;

    setIsLoading(true);
    await action();

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
      }, successDelay);
    }, delay);
  };

  return { isLoading, isSuccess, executeAction };
};
