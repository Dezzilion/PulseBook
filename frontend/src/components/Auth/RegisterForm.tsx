'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authService, RegisterRequest } from '@/services/authService';

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    location: '',
    preferences: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Відправка даних на реєстрацію:', formData);

      const response = await authService.register(formData);
      
      console.log('Реєстрація успішна:', response);

      login(response.user, response.accessToken, response.refreshToken);
      
      // Перенаправити в головне меню після успішної реєстрації
      router.replace('/dashboard');
    }  catch (err: any) {
        console.error('❌ Помилка реєстрації:', err);

        let message = 'Помилка реєстрації. Спробуйте ще раз.';

        if (err.message.includes('Не вдалося підключитися')) {
          message = err.message; // чітке повідомлення про сервер
        } else if (err.message) {
          message = err.message;
        }

        setError(message);
      }finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Реєстрація в PulseBook</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Ім'я
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Прізвище
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+380XXXXXXXXX"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Стать
          </label>

          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value,
              })
            }
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Оберіть стать</option>
            <option value="male">Чоловіча</option>
            <option value="female">Жіноча</option>
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Місто
          </label>

          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({
                ...formData,
                location: e.target.value,
              })
            }
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Оберіть місто</option>

            <option value="Київ">Київ</option>
            <option value="Харків">Харків</option>
            <option value="Львів">Львів</option>
            <option value="Дніпро">Дніпро</option>
            <option value="Одеса">Одеса</option>
            <option value="Запоріжжя">Запоріжжя</option>
            <option value="Вінниця">Вінниця</option>
            <option value="Полтава">Полтава</option>
            <option value="Чернігів">Чернігів</option>
            <option value="Суми">Суми</option>
            <option value="Черкаси">Черкаси</option>
            <option value="Івано-Франківськ">Івано-Франківськ</option>
            <option value="Тернопіль">Тернопіль</option>
            <option value="Ужгород">Ужгород</option>
            <option value="Хмельницький">Хмельницький</option>
            <option value="Рівне">Рівне</option>
            <option value="Житомир">Житомир</option>
            <option value="Кропивницький">Кропивницький</option>
            <option value="Миколаїв">Миколаїв</option>
            <option value="Херсон">Херсон</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="preferences"
            className="block text-sm font-medium text-gray-700"
          >
            Вподобання
          </label>
          <textarea
            id="preferences"
            name="preferences"
            rows={4}
            value={formData.preferences}
            onChange={(e) =>
              setFormData({
                ...formData,
                preferences: e.target.value,
              })
            }
            placeholder="Наприклад: концерти, футбол, театр, IT-конференції..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>


        {error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
        </button>
      </form>
    </div>
  );
}