'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location: string;
  price: number;
  category: string;
  tags: string[];
  capacity: number;
  bookedSeats: number;
  status: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  const EVENT_API =
    process.env.NEXT_PUBLIC_EVENT_API_URL || 'http://localhost:3002';

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    fetch(`${EVENT_API}/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Не вдалося завантажити подію');
        return res.json();
      })
      .then((data: Event) => setEvent(data))
      .catch((error) => {
        console.error(error);
        setError('Не вдалося завантажити подію. Перевірте event-service.');
      })
      .finally(() => setIsLoading(false));
  }, [id, isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  const seatsLeft = event ? Math.max(event.capacity - event.bookedSeats, 0) : 0;
  const isSoldOut = seatsLeft === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-indigo-600">PulseBook</div>
            <span className="text-sm text-slate-500">Деталі події</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
            >
              Вийти
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/events"
          className="mb-6 inline-flex rounded-3xl border border-indigo-200 bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
        >
          ← Назад до подій
        </Link>

        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Завантаження події...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && event && (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex min-h-[280px] items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 px-8 text-center text-white">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100">
                    {event.category}
                  </p>
                  <h1 className="mt-4 text-4xl font-bold">{event.title}</h1>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                    {event.status}
                  </span>
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl font-semibold text-slate-900">Опис події</h2>
                <p className="mt-4 text-slate-600">
                  {event.description || 'Опис події буде додано пізніше.'}
                </p>
              </div>
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Інформація</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Дата</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(event.date)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Локація</p>
                  <p className="mt-1 font-semibold text-slate-900">{event.location}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Ціна</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">
                    {event.price} грн
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Вільні місця</p>
                  <p
                    className={
                      isSoldOut
                        ? 'mt-1 font-semibold text-red-500'
                        : 'mt-1 font-semibold text-slate-900'
                    }
                  >
                    {isSoldOut ? 'Продано' : `${seatsLeft} місць залишилось`}
                  </p>
                </div>
              </div>

              {isSoldOut ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-2xl bg-slate-400 px-5 py-3 font-semibold text-white"
                >
                  Немає місць
                </button>
              ) : (
                <Link
                  href={`/events/${event.id}/seats`}
                  className="mt-6 block w-full rounded-2xl bg-indigo-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
                >
                  Обрати місце
                </Link>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}