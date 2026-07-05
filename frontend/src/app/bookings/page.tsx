'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface Booking {
  id: string;
  eventTitle: string;
  category: string;
  date: string;
  location: string;
  seats: number;
  totalAmount: number;
  status: 'Підтверджено' | 'Очікує підтвердження' | 'Скасовано';
}


export default function BookingsPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
  if (!isAuthenticated || !user?.id) return;

  fetch(`http://localhost:3003/bookings/user/${user.id}`)
    .then((res) => res.json())
    .then((data) => {
      setBookings(
        data
        .filter((booking: any) => booking.status !== 'cancelled')
        .map((booking: any) => ({
          id: booking.id,
          eventTitle: booking.event.title,
          category: booking.event.category,
          date: booking.event.date,
          location: booking.event.location,
          seats: booking.seatsAmount,
          totalAmount: booking.totalAmount,
          status:
            booking.status === 'cancelled'
              ? 'Скасовано'
              : booking.status === 'pending'
              ? 'Очікує підтвердження'
              : 'Підтверджено',
        }))
      );
    })
    .catch(console.error);
}, [isAuthenticated, user?.id]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

const handleCancelBooking = async (bookingId: string) => {
  const res = await fetch(`http://localhost:3003/bookings/${bookingId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    alert("Не вдалося скасувати бронювання");
    return;
  }

  setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
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

  const stats = useMemo(() => {
    const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const confirmed = bookings.filter((booking) => booking.status === 'Підтверджено').length;
    const pending = bookings.filter((booking) => booking.status === 'Очікує підтвердження').length;

    return { totalAmount, confirmed, pending };
  }, [bookings]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-indigo-600">PulseBook</div>
            <span className="text-sm text-slate-500">Бронювання</span>
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Мої бронювання</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Ваші активні бронювання</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Керуйте своїми бронюваннями, відстежуйте статус та переглядайте деталі подій.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-3xl border border-indigo-200 bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
            >
              ← На панель
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Переглянути події
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всього бронювань</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{bookings.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Підтверджено</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">{stats.confirmed}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Сума бронювань</p>
            <p className="mt-2 text-3xl font-semibold text-indigo-600">{stats.totalAmount} грн</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
            У вас поки немає бронювань. Перегляньте доступні події та забронюйте місце.
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <article key={booking.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {booking.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {booking.status}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-semibold text-slate-900">{booking.eventTitle}</h2>
                    <p className="mt-2 text-sm text-slate-500">{formatDate(booking.date)}</p>
                    <p className="mt-1 text-sm text-slate-600">{booking.location}</p>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[220px]">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Кількість місць</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{booking.seats}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">До сплати</p>
                      <p className="mt-1 text-lg font-semibold text-indigo-600">{booking.totalAmount} грн</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(booking.id)}
                      className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Скасувати
                    </button>
                    <Link
                      href="/events"
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Дивитись події
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
