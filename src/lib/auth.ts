import { cookies } from "next/headers";


export async function getUserSession() {
  // KHÔNG được await ở đây
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const res = await fetch("http://localhost:8080/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // tránh cache session
  });

  if (!res.ok) return null;
  return res.json();
}