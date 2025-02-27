import TypingTest from '@/components/TypingTest';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">FastKeyTest</h1>
          <p className="text-gray-400">Test your typing speed and accuracy</p>
        </header>

        <div className="max-w-3xl mx-auto">
          <TypingTest duration={60} />
        </div>
      </div>
    </main>
  );
}
