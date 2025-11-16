import Link from 'next/link';

export default function Root() {
  return (
    <>
      <Link href="/login">
        <button>Login</button>
      </Link>
      <h1>THIS IS ROOT</h1>
    </>
  );
}
