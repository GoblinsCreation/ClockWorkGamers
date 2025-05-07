import { Link } from "wouter";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
      </p>
      <Link href="/">
        <a className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors shadow-md">
          Return to Home
        </a>
      </Link>
    </div>
  );
}