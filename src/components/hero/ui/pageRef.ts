import { createRef, type RefObject } from "react";

/**
 * The #page wrapper (HeroExperience). Module-level so the scene slot inside
 * the server-rendered hero can hand it to the canvas as eventSource without
 * a context: pointer moves over the copy layer still reach the scene.
 */
export const pageRef: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();
