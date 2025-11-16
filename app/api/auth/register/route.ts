// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, confirmPassword } = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Tất cả các trường là bắt buộc' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Mật khẩu xác nhận không khớp' }, { status: 400 });
    }

    // Gọi đến backend Spring Boot
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Đăng ký thất bại' }, { status: res.status });
    }

    // Đăng ký thành công
    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        user: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi đăng ký' }, { status: 500 });
  }
}
