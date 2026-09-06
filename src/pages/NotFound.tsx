import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <div className="font-display text-8xl font-bold text-accent/30">404</div>
      <h1 className="mt-2 font-display text-2xl font-bold text-zinc-100">Страница не найдена</h1>
      <p className="mt-2 text-zinc-500">Похоже, этот юнит уже снят с вооружения.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#151515] hover:bg-[#dbb62f]"
      >
        Вернуться в штаб
      </Link>
    </div>
  );
}
