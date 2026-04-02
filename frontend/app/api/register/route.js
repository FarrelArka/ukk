import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // 🔥 KIRIM KE BACKEND GO LU
    const res = await fetch("http://localhost:5050/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password, // kirim plaintext → backend yang hash
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Register gagal" },
        { status: res.status }
      );
    }

    // 🔥 RETURN RESPONSE KE FRONTEND
    return NextResponse.json(
      {
        message: "Register berhasil",
        user: data.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}