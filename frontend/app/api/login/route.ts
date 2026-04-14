export async function POST(req: Request) {
  const body = await req.json()

  const res = await fetch("http://localhost:5050/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  })

  const data = await res.json()

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "Set-Cookie": res.headers.get("set-cookie") || "",
      "Content-Type": "application/json",
    },
  })
}