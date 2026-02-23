import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (
    username === process.env.JAR_USERNAME &&
    password === process.env.JAR_PASSWORD
  ) {
    const response = NextResponse.json({ success: true })

    response.cookies.set('jar-session', 'active', {
      httpOnly: true,
      path: '/',
    })

    return response
  }

  return NextResponse.json(
    { success: false, message: 'Invalid credentials' },
    { status: 401 }
  )
}