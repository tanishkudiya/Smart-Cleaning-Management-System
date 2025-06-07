"use client"

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Loader2 } from "lucide-react";

function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Just a debug log for your API key presence
    const API_KEY = "AIzaSyBZ-n9wwXlCTkWUWTDrb9XFGwlxzvzZkM4";
    console.log("API Key:", API_KEY ? "Present" : "Missing");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError("");

    const newMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const API_KEY = "AIzaSyBZ-n9wwXlCTkWUWTDrb9XFGwlxzvzZkM4";
      if (!API_KEY) throw new Error("API key is missing");

      // Initialize client
      const genAI = new GoogleGenerativeAI({ apiKey: API_KEY });

      // Get model correctly - no 'models/' prefix, just model name
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Call generateContent with the expected input format
      const result = await model.generateContent({
        // Note: content parts as array of text strings
        contents: [{ text: newMessage.content }],
      });

      // The result contains 'candidates' array with generated text
      const responseText = result.candidates[0].content;

      const assistantMessage = { role: "assistant", content: responseText };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessagesPage;
