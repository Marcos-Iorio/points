"use client";

import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import { Button } from "./ui/button";

const NextPage = ({
  nextPage,
  activePage,
}: {
  nextPage: Dispatch<SetStateAction<number>>;
  activePage: number;
}) => {
  return (
    <Button
      disabled={activePage === -1}
      onClick={() => nextPage((prev) => activePage++)}
      type="button"
    >
      Siguiente paso
    </Button>
  );
};

const BackPage = ({
  backPage,
  activePage,
}: {
  backPage: Dispatch<SetStateAction<number>>;
  activePage: number;
}) => {
  return (
    <Button
      disabled={activePage === 0}
      onClick={() => backPage((prev) => activePage--)}
      type="button"
    >
      Paso anterior
    </Button>
  );
};

const Wizard = ({ children }: PropsWithChildren) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const pages = React.Children.toArray(children);
  const currentPage = pages[activePageIndex];

  return (
    <>
      <BackPage backPage={setActivePageIndex} activePage={activePageIndex} />
      {currentPage}
      <NextPage
        nextPage={setActivePageIndex}
        activePage={activePageIndex >= pages.length - 1 ? -1 : activePageIndex}
      />
    </>
  );
};

export default Wizard;
