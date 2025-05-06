import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-orange-500">
        <h1 className="text-3xl font-bold text-orange-500 mb-4">404 - Page Not Found</h1>
        <p className="mb-6">The page you're looking for doesn't exist or has been moved.</p>
        
        <Link href="/">
          <Button className="w-full">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}