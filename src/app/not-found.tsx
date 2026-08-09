import Link from "next/link";
import { Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
            <Package className="w-12 h-12 text-indigo-600" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-slate-900">404</h1>
          <p className="mt-2 text-xl text-slate-600">
            Oops! This page doesn&apos;t exist.
          </p>
          <p className="mt-1 text-slate-500">
            The page you&apos;re looking for might have been moved or doesn&apos;t exist.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
