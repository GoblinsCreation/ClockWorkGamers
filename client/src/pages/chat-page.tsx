import React from 'react';
import ChatBox from '@/components/chat/ChatBox';
import { ProtectedRoute } from '@/lib/protected-route';

function ChatPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">CWG Chat</h1>
      <div className="max-w-4xl mx-auto">
        <ChatBox />
      </div>
    </div>
  );
}

// Wrap component with ProtectedRoute to ensure user is authenticated
export default function ProtectedChatPage() {
  return <ProtectedRoute path="/chat" component={ChatPage} />;
}