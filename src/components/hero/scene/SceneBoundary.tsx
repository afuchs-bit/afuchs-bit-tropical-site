"use client";

import { Component, type ReactNode } from "react";

/**
 * Any failure inside the scene (context creation, a shader, a chunk that
 * fails to load) ends in the CSS fallback instead of an error page. Kept
 * free of three imports: SceneLoader loads it with the page.
 */
export class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(): void {
    this.props.onError();
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
