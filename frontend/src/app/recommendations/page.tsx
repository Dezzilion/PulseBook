'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface RecommendationEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  image: string;
  category: string;
}

interface ChatMessage {
  id: string;
  author: 'user' | 'ai';
  text: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    author: 'ai',
    text: 'Привіт! Пиши, який тип подій тобі подобається, і я підберу найкращі варіанти.',
  },
];

function useMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, author: 'user', text },
    ]);
  }, []);

  const addAiMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-ai`, author: 'ai', text },
    ]);
  }, []);

  return { messages, addUserMessage, addAiMessage };
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-4 overflow-hidden rounded-3xl border border-gray-200 bg-slate-50 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-3xl p-4 ${
            message.author === 'user'
              ? 'bg-indigo-600 text-white self-end ml-auto max-w-[85%]'
              : 'bg-white text-gray-900 max-w-[85%]'
          }`}
        >
          {message.author === 'ai' ? (
  <>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              🤖 Аналіз ШІ (Llama 3)
            </span>
          </div>

          <p className="text-sm leading-6 whitespace-pre-wrap">
            {message.text}
          </p>

          <div className="mt-2 text-xs text-slate-500">
            Згенеровано локально за допомогою Llama 3
          </div>
          </>
          ) : (
            <p className="text-sm leading-6">{message.text}</p>
          )}
      </div>
      ))}
    </div>
  );
}

function ChatInput({ onSend }: { onSend: (value: string) => void }) {
  const [input, setInput] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="recommendation-input" className="sr-only">
        Введіть повідомлення
      </label>
      <input
        id="recommendation-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Напишіть запит для рекомендацій..."
        className="min-w-0 flex-1 rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Відправити
      </button>
    </form>
  );
}

export default function RecommendationsPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { messages, addUserMessage, addAiMessage } = useMessages();

  const [recommendations, setRecommendations] = useState<RecommendationEvent[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

  fetch(`http://localhost:8000/recommendations/${user.id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Не вдалося завантажити рекомендації');
      }
      return res.json();
    })
    .then((data) => {
      setRecommendations(
        data.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString('uk-UA'),
          location: event.location,
          price: event.price,
          image: '',
          category: event.category,
        }))
      );
    })
    .catch((error) => {
      console.error(error);
    });
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

const respondToPrompt = useCallback(
  async (prompt: string) => {
    addUserMessage(prompt);

    try {
      const res = await fetch('http://localhost:8000/recommendations/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'usr_001',
          message: prompt,
        }),
      });

      if (!res.ok) {
        throw new Error('AI service error');
      }

      const data = await res.json();
      addAiMessage(data.answer);
    } catch (error) {
      console.error(error);
      addAiMessage('Не вдалося отримати відповідь від AI-сервісу. Перевірте, чи запущений Ollama та recommendation-service.');
    }
  },
  [addAiMessage, addUserMessage, user?.id],
);

const handleSend = useCallback(
  (value: string) => {
    respondToPrompt(value);
  },
  [respondToPrompt],
);

const handleQuickPrompt = useCallback(
  (value: string) => {
    respondToPrompt(value);
  },
  [respondToPrompt],
);

  const suggestions = useMemo(
    () => [
      'Порадуй мене концертами на вихідні',
      'Я люблю джаз та електроніку',
      'Підбери вистави для сімейного вечора',
      'Я в Києві лише два дні',
    ],
    [],
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-indigo-600">PulseBook</div>
            <span className="text-sm text-gray-500">Харків</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Вийти
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Персональні рекомендації</p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">Чат зі ШІ для ваших культурних інтересів</h1>
              <p className="mt-3 max-w-3xl text-gray-600">
                Запитайте у штучного інтелекту, які події будуть найцікавіші саме для вас. Пишіть у чат, і отримайте персональні поради.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center rounded-3xl border border-indigo-200 bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50">
                ← Назад на панель
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full">
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Почнімо чат</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Напишіть, що ви шукаєте, і отримаєте підбірку кращих подій.
                  </p>
                </div>
                <span className="rounded-3xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                  AI
                </span>
              </div>

              <MessageList messages={messages} />
              <ChatInput onSend={handleSend} />
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Швидкі підказки</h3>
              <p className="mt-2 text-sm text-gray-500">
                Натисніть на одну з тем, щоб швидко отримати ідею для подій.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleQuickPrompt(suggestion)}
                    className="rounded-3xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
