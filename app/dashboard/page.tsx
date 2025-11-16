import { getUserSession } from '@/src/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // const user = await getUserSession();
  // if (!user) redirect("/login");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chào,👋</h1>
      <p>Đây là dashboard của bạn.</p>
      <Link href="/">
        <button>Logout</button>
      </Link>
    </main>
  );
}
