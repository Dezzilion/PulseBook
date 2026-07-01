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

const recommendations: RecommendationEvent[] = [
  {
    id: 1,
    title: 'Концерт Okean Elzy',
    date: '15 липня 2026',
    location: 'Палац спорту, Київ',
    price: 850,
    image: '/images/events/okean-elzy.jpg',
    category: 'Концерт',
  },
  {
    id: 2,
    title: 'Вистава «Кайдашева сім\'я»',
    date: '18 липня 2026',
    location: 'Театр ім. І. Франка, Київ',
    price: 450,
    image: '/images/events/theater.jpg',
    category: 'Театр',
  },
  {
    id: 3,
    title: 'Виставка «Світло і тінь»',
    date: '20 липня 2026',
    location: 'Мистецький арсенал, Київ',
    price: 250,
    image: '/images/events/exhibition.jpg',
    category: 'Виставка',
  },
];

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
          <p className="text-sm leading-6">{message.text}</p>
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
    (prompt: string) => {
      addUserMessage(prompt);

      const lowerPrompt = prompt.toLowerCase();
      let aiAnswer = 'Ось кілька варіантів, які можуть вам підійти.';

      if (lowerPrompt.includes('концерт')) {
        aiAnswer = 'Я підготував кілька концертів для вас: Okean Elzy, The Hardkiss, KAZKA та інші події з живою музикою.';
      } else if (lowerPrompt.includes('театр')) {
        aiAnswer = 'Чудовий вибір! Спробуйте виставу "Кайдашева сім’я" або сучасну драму в Театрі Франка.';
      } else if (lowerPrompt.includes('виставка')) {
        aiAnswer = 'Рекомендую виставку "Світло і тінь", галерею сучасного мистецтва і спеціальний арт-фестиваль.';
      } else if (lowerPrompt.includes('сім') || lowerPrompt.includes('сімей')) {
        aiAnswer = 'Для сімейного вечора підійдуть сімейні вистави, дитячі майстер-класи та інтерактивні екскурсії.';
      } else {
        aiAnswer = 'Я знайшов цікаві події для вас: концерти, театри та виставки на найближчі вихідні. Розкажіть більше про ваші вподобання.';
      }

      addAiMessage(aiAnswer);
    },
    [addAiMessage, addUserMessage],
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

        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
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
                  AI відповіді миттєво
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

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Ваші інтереси</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {['Концерти', 'Театр', 'Виставки', 'Музика', 'Нічне життя', 'Сімейні заходи'].map((tag) => (
                  <span key={tag} className="rounded-full bg-indigo-50 px-3 py-2 text-center text-sm font-medium text-indigo-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Топ події</h3>
              <div className="mt-5 space-y-4">
                {recommendations.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block rounded-3xl border border-gray-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-indigo-600">{event.category}</p>
                        <h4 className="mt-2 text-base font-semibold text-gray-900">{event.title}</h4>
                        <p className="mt-1 text-sm text-gray-500">{event.date}</p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">{event.price} грн</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
