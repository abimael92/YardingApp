export type MockRole = "admin" | "client" | "supervisor" | "worker"

const roleCookieKey = "mock-role"
const userEmailCookieKey = "mock-user-email"

export const setMockRole = (role: MockRole, email?: string) => {
  document.cookie = `${roleCookieKey}=${role}; path=/; SameSite=Lax`
  if (email) {
    document.cookie = `${userEmailCookieKey}=${encodeURIComponent(email)}; path=/; SameSite=Lax`
  }
}

export const getMockRole = (): MockRole | null => {
  if (typeof document === "undefined") return null
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
  const roleCookie = cookies.find((cookie) => cookie.startsWith(`${roleCookieKey}=`))
  if (!roleCookie) return null
  return roleCookie.split("=")[1] as MockRole
}

export const getMockUserEmail = (): string | null => {
  if (typeof document === "undefined") return null
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
  const emailCookie = cookies.find((cookie) => cookie.startsWith(`${userEmailCookieKey}=`))
  if (!emailCookie) return null
  return decodeURIComponent(emailCookie.split("=")[1])
}

export const clearMockRole = () => {
  document.cookie = `${roleCookieKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  document.cookie = `${userEmailCookieKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
