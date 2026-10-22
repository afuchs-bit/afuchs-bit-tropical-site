"use client";

import { SceneLoader } from "../SceneLoader";
import { pageRef } from "./pageRef";

/**
 * Client island inside the server-rendered hero: mounts the canvas between
 * the CSS backdrop and the copy layer. The scene wrapper positions itself
 * absolutely within #hero; #page is the event source.
 */
export function SceneSlot() {
  return <SceneLoader eventSource={pageRef} />;
}
