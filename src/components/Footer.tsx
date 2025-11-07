'use client';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Criado por <span className="font-bold text-primary">Nardoto</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Gerador Profissional de Roteiros para Documentários Bíblicos
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            v2.0 - Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
