"use client";

import { useFormStatus } from "react-dom";
import { Component } from "react";

export function Pending() {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
  );
}

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 border border-red-500 rounded">
          <h2 className="text-red-600 font-bold mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-4">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
