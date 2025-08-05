'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const cookieStore = await cookies();

  // Clear common session-related cookies
  cookieStore.set('userId', '', { path: '/', expires: new Date(0) });
  cookieStore.set('userRole', '', { path: '/', expires: new Date(0) });
  cookieStore.set('token', '', { path: '/', expires: new Date(0) });
  // Add more cookie names here if needed

  // Redirect to login
  redirect('/login')
}
