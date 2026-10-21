import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = { children: ReactNode; className?: string; as?: "div" | "section" | "nav" | "footer" };

export function Container({ children, className, as: Tag = "div" }: Props) {
  return <Tag className={cn("container-content", className)}>{children}</Tag>;
}
