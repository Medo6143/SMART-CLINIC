"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";
import { IoChatbubblesOutline } from "react-icons/io5";

export default function PatientChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <IoChatbubblesOutline className="text-xl text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Chat with your clinic or doctor.</p>
        </div>
      </div>
      <ChatContainer />
    </div>
  );
}
