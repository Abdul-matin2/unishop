"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-rose-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-slate-600">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
