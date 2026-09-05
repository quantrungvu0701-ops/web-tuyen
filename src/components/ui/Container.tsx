import { type ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** "wide" for grids/cards, "text" for narrower reading measure. */
  size?: "wide" | "text";
};

export function Container({ children, className = "", size = "wide" }: ContainerProps) {
  const maxWidth = size === "text" ? "max-w-2xl" : "max-w-6xl";
  return (
    <div className={`mx-auto w-full ${maxWidth} px-5 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
