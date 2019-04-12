declare module "react-resize-aware" {
  import { ReactNode } from "react";

  export = useResizeAware;
  declare function useResizeAware(): [
    ReactNode,
    { width: number; height: number }
  ];
}
