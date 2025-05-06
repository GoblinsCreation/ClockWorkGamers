import React from 'react';

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-orange-500">
        <h1 className="text-3xl font-bold text-orange-500 mb-4">ClockWork Gamers</h1>
        <p className="mb-6">This is a test page to verify that basic React rendering is working.</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Status</h2>
            <p>The application is loading correctly if you can see this message.</p>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-md">
            <h2 className="text-xl font-semibold text-green-400 mb-2">Next Steps</h2>
            <p>Once this basic page renders, we can start restoring the full application functionality.</p>
          </div>
        </div>
      </div>
    </div>
  );
}