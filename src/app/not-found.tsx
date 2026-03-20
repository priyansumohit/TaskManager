import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Page not found</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
