import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">PulseBook</h1>
        <p className="text-xl mb-8">Інтелектуальна система бронювання місць на культурні та спортивні заходи</p>
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Увійти
          </Link>
          <Link
            href="/auth/register"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Зареєструватися
          </Link>
        </div>
      </div>
    </main>
  );
}