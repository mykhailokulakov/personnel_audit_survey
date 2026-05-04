import Link from 'next/link';

export default function SharedResultsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Перегляд результатів</h1>
      <p className="max-w-md text-muted-foreground leading-relaxed">
        Ця функція буде доступна після підключення бекенду. Введіть код результату, щоб переглянути
        профіль респондента.
      </p>
      <p className="text-sm text-muted-foreground">
        Якщо ви хочете пройти анкету,{' '}
        <Link href="/survey" className="underline underline-offset-4 hover:text-foreground">
          натисніть тут
        </Link>
        .
      </p>
    </main>
  );
}
