'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function EventsPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Усі');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('http://localhost:3002/events')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Не вдалося завантажити події');
        }

        return res.json();
      })
      .then((data: Event[]) => {
        setEvents(data);
      })
      .catch((error) => {
        console.error(error);
        setEventsError('Не вдалося завантажити події. Перевірте, чи запущений event-service.');
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });
  }, [isAuthenticated]);

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

  const categories = useMemo(() => {
    const uniqueCategories = new Set(events.map((event) => event.category).filter(Boolean));
    return ['Усі', ...Array.from(uniqueCategories)];
  }, [events]);

  const filteredEvents = useMemo(() => {

    const handleBooking = async (eventId: string) => {
  if (!user?.id) {
    alert('Користувач не знайдений');
    return;
  }

  try {
    const res = await fetch('http://localhost:3003/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        eventId,
        seatsAmount: 1,
      }),
    });

    if (!res.ok) {
      throw new Error('Не вдалося створити бронювання');
    }

    alert('Бронювання успішно створено!');
    router.push('/bookings');
  } catch (error) {
    console.error(error);
    alert('Помилка бронювання. Перевірте booking-service.');
  }
};

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCategory = selectedCategory === 'Усі' || event.category === selectedCategory;
      const haystack = `${event.title} ${event.description ?? ''} ${event.location} ${event.tags.join(' ')}`.toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || haystack.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [events, searchTerm, selectedCategory]);

  const handleBooking = async (eventId: string) => {
  if (!user?.id) {
    alert('Користувач не знайдений');
    return;
  }

  try {
    const res = await fetch('http://localhost:3003/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        eventId,
        seatsAmount: 1,
      }),
    });

    if (!res.ok) {
      throw new Error('Не вдалося створити бронювання');
    }

    alert('Бронювання успішно створено!');
    router.push('/bookings');
  } catch (error) {
    console.error(error);
    alert('Помилка бронювання. Перевірте booking-service.');
  }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-indigo-600">PulseBook</div>
            <span className="text-sm text-slate-500">Події</span>
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
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Культурний календар</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Всі події PulseBook</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Шукайте концерти, вистави, майстер-класи та спортивні заходи в одному місці.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-3xl border border-indigo-200 bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
            >
              ← На панель
            </Link>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex-1">
              <span className="sr-only">Пошук подій</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Пошук за назвою, місцем або тегом"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingEvents && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Завантаження подій...
          </div>
        )}

        {eventsError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
            {eventsError}
          </div>
        )}

        {!isLoadingEvents && !eventsError && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Знайдено {filteredEvents.length} подій
              </p>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                За вашим запитом нічого не знайдено. Спробуйте змінити фільтри.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => {
                  const seatsLeft = Math.max(event.capacity - event.bookedSeats, 0);
                  const isSoldOut = seatsLeft === 0;

                  return (
                    <article key={event.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 px-6 text-center text-white">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">{event.category}</p>
                          <h2 className="mt-2 text-xl font-semibold">{event.title}</h2>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                            {event.status}
                          </span>
                          <span className="text-lg font-semibold text-slate-900">{event.price} грн</span>
                        </div>

                        <p className="text-sm text-slate-500">{formatDate(event.date)}</p>
                        <p className="mt-2 text-sm text-slate-600">{event.location}</p>

                        {event.description && (
                          <p className="mt-3 line-clamp-3 text-sm text-slate-500">{event.description}</p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {event.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex items-center justify-between text-sm">
                          <span className={isSoldOut ? 'text-red-500' : 'text-slate-500'}>
                            {isSoldOut ? 'Продано' : `${seatsLeft} місць залишилось`}
                          </span>
                          <button
                            type="button"
                            disabled={isSoldOut}
                            onClick={() => handleBooking(event.id)}
                            className={`rounded-full px-4 py-2 font-medium text-white transition ${
                              isSoldOut
                                ? 'cursor-not-allowed bg-slate-400'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            {isSoldOut ? 'Немає місць' : 'Забронювати'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
