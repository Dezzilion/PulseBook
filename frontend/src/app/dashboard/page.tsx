'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  image: string;
  category: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Концерт Okean Elzy",
    date: "15 липня 2026",
    location: "Палац спорту, Київ",
    price: 850,
    image: "/images/events/okean-elzy.jpg",
    category: "Концерт",
  },
  {
    id: 2,
    title: "Вистава «Кайдашева сім'я»",
    date: "18 липня 2026",
    location: "Театр ім. І. Франка, Київ",
    price: 450,
    image: "/images/events/theater.jpg",
    category: "Театр",
  },
  {
    id: 3,
    title: "Виставка «Світло і тінь»",
    date: "20 липня 2026",
    location: "Мистецький арсенал, Київ",
    price: 250,
    image: "/images/events/exhibition.jpg",
    category: "Виставка",
  },
];

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Доброго дня, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Готові відкрити для себе нові культурні події?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/events" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <div className="text-indigo-600 text-2xl mb-3">🎟️</div>
            <h3 className="font-semibold text-lg">Переглянути всі події</h3>
            <p className="text-gray-500 text-sm mt-1">Понад 120 заходів цього місяця</p>
          </Link>

          <Link href="/bookings" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <div className="text-indigo-600 text-2xl mb-3">📋</div>
            <h3 className="font-semibold text-lg">Мої бронювання</h3>
            <p className="text-gray-500 text-sm mt-1">У вас 3 активні бронювання</p>
          </Link>

          <Link href="/recommendations" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <div className="text-indigo-600 text-2xl mb-3">✨</div>
            <h3 className="font-semibold text-lg">Персональні рекомендації</h3>
            <p className="text-gray-500 text-sm mt-1">На основі ваших інтересів</p>
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Рекомендовано для вас</h2>
            <Link href="/recommendations" className="text-indigo-600 hover:underline text-sm">
              Дивитись всі →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Зображення події</span>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        {event.category}
                      </span>
                      <h3 className="font-semibold text-lg mt-2">{event.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{event.price} грн</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{event.date} • {event.location}</p>
                  <Link
                    href={`/events/${event.id}`}
                    className="mt-4 block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Забронювати
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Популярні події цього тижня</h2>
            <Link href="/events" className="text-indigo-600 hover:underline text-sm">
              Всі події →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {mockEvents.map((event) => (
              <div key={event.id} className="bg-white p-4 rounded-xl border hover:shadow transition">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-semibold">{event.price} грн</span>
                  <Link href={`/events/${event.id}`} className="text-sm text-indigo-600 hover:underline">
                    Детальніше
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
