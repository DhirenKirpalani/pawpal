import { Suspense } from 'react';
import ChatClient from './ChatClient';

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ChatClient />
    </Suspense>
  );
}

function ChatPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="h-8 w-48 bg-indigo-500 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-indigo-500 rounded animate-pulse"></div>
          </div>

          <div className="h-[500px] p-6 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading chat...</p>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
