import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { failed: boolean };

/** Keeps the page alive if a piece (e.g. the WebGL scene) crashes on a device. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Section crashed:', error);
    try {
      (window as unknown as { __soicErrors?: string[] }).__soicErrors?.push(String((error as Error)?.stack || error));
    } catch {
      /* ignore */
    }
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
