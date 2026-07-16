'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  category: string;
  capacity: number;
  bookedSeats: number;
}

export default function SeatsPage() {
  const params = useParams();
  const id = params?.id as string;

  const EVENT_API =
    process.env.NEXT_PUBLIC_EVENT_API_URL || 'http://localhost:3002';

  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    fetch(`${EVENT_API}/events/${id}`)
      .then((res) => res.json())
      .then((data: Event) => setEvent(data))
      .catch((error) => {
        console.error(error);
        alert('Не вдалося завантажити подію');
      })
      .finally(() => setIsLoading(false));
  }, [id, isAuthenticated]);

  const seats = useMemo(() => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    return rows.flatMap((row) =>
      Array.from({ length: 10 }, (_, index) => `${row}${index + 1}`)
    );
  }, []);

  const occupiedSeats = useMemo(() => {
    return ['A1', 'A2', 'B5', 'C3', 'D7'];
  }, []);

  const handleBooking = async () => {
    if (!user?.id || !event?.id || !selectedSeat) {
      alert('Оберіть місце');
      return;
    }

    try {
      setIsBooking(true);

      const res = await fetch('http://localhost:3003/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId: event.id,
          seatsAmount: 1,
          seatNumber: selectedSeat,
        }),
      });

      if (!res.ok) {
        throw new Error('Не вдалося створити бронювання');
      }

      alert(`Місце ${selectedSeat} успішно заброньовано!`);
      router.push('/bookings');
    } catch (error) {
      console.error(error);
      alert('Помилка бронювання. Перевірте booking-service.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-indigo-600">PulseBook</div>
            <span className="text-sm text-slate-500">Вибір місця</span>
          </div>

          <div className="text-right">
            <p className="font-medium text-slate-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href={`/events/${id}`}
          className="mb-6 inline-flex rounded-3xl border border-indigo-200 bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
        >
          ← Назад до події
        </Link>

        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Завантаження місць...
          </div>
        )}

        {!isLoading && event && (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Схема залу
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">
                Оберіть місце
              </h1>

              <div className="mt-6 rounded-2xl bg-slate-900 py-3 text-center text-sm font-semibold text-white">
                СЦЕНА
              </div>

              <div className="mt-8 grid grid-cols-10 gap-3">
                {seats.map((seat) => {
                  const isOccupied = occupiedSeats.includes(seat);
                  const isSelected = selectedSeat === seat;

                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedSeat(seat)}
                      className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                        isOccupied
                          ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                          : isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>🟦 Доступно</span>
                <span>🟪 Обрано</span>
                <span>⬜ Зайнято</span>
              </div>
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                Ваш вибір
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Подія</p>
                  <p className="mt-1 font-semibold text-slate-900">{event.title}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Місце</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">
                    {selectedSeat || 'Не обрано'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">До сплати</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">
                    {event.price} грн
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedSeat || isBooking}
                onClick={handleBooking}
                className={`mt-6 w-full rounded-2xl px-5 py-3 font-semibold text-white transition ${
                  !selectedSeat || isBooking
                    ? 'cursor-not-allowed bg-slate-400'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isBooking ? 'Бронювання...' : 'Забронювати місце'}
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}