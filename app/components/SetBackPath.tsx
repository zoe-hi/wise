"use client";

import { useLayoutContent } from "../contexts/LayoutContextProvider";
import { useEffect } from "react";

export function SetBackPath({ path }: { path: string }) {
  const { setPageBackPath } = useLayoutContent();

  useEffect(() => {
    setPageBackPath(path);

    return () => {
      setPageBackPath("");
    };
  }, [setPageBackPath, path]);

  return null;
}
