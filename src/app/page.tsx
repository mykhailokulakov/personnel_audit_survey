import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Діагностична анкета</h1>
      <p className="max-w-md text-muted-foreground leading-relaxed">
        Цей інструмент допомагає скласти професійний профіль на основі ваших звичок, досвіду і
        підходу до робочих задач. Проходження триває приблизно 30-40 хвилин і відбувається анонімно
        — без вказання імені.
      </p>
      <Link href="/survey" className={buttonVariants({ size: 'lg' })}>
        Розпочати
      </Link>
    </main>
  );
}
