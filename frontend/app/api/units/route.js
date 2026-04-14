export async function GET() {
  const res = await fetch("http://localhost:5050/accommodations")
  const data = await res.json()

  return Response.json(data)
}