'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<{ role: string, content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const sendMessageXHR = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://retn0.iptime.org:11011/api/chat');
    xhr.setRequestHeader('Content-Type', 'application/json');
  
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const assistantReply = response.message.content;
          setConversation((prevConversation) => [
            ...prevConversation,
            { role: 'user', content: message },
            { role: 'assistant', content: assistantReply },
          ]);
          setMessage('');
        } else {
          console.error('Error:', xhr.status);
        }
      }
    };
  
    const requestData = {
      model: 'llama2',
      messages: [...conversation, { role: 'user', content: message }],
    };
  
    xhr.send(JSON.stringify(requestData));
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const newConversation = [...conversation, { role: 'user', content: message }];
    setConversation(newConversation);
    setMessage('');
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma',
          messages: newConversation,
          "stream": false
        }),
      });
  
      const data = await response.json();
      const assistantReply = data.content;
      setConversation([...newConversation, { role: 'assistant', content: assistantReply }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold mb-4 bg-blue-500 text-white p-4">Ollama 챗봇</h1>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`${
                  msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                } rounded-lg p-2 max-w-sm`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={sendMessage} className="flex p-4 bg-gray-100">
        <div className="max-w-4xl mx-auto w-full flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-l-lg p-2 focus:outline-none"
          />
          <button type="submit" className="bg-blue-500 text-white rounded-r-lg px-4 py-2">
            전송
          </button>
        </div>
      </form>
    </div>
  );
}