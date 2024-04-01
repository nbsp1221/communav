import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { model, messages } = await request.json();

  try {
    const response = await fetch('http://localhost:11011/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to read response body');
    }

    const decoder = new TextDecoder('utf-8');
    let assistantReply = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;

        const data = JSON.parse(line);
        if (data.message) {
          assistantReply += data.message.content;
        }
      }
    }

    return NextResponse.json({ content: assistantReply });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}