export type MockRole = "admin" | "client" | "supervisor" | "worker"

const roleCookieKey = "mock-role"

export const setMockRole = (role: MockRole) => {
  document.cookie = `${roleCookieKey}=${role}; path=/; SameSite=Lax`
}

export const getMockRole = (): MockRole | null => {
  if (typeof document === "undefined") return null
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
  const roleCookie = cookies.find((cookie) => cookie.startsWith(`${roleCookieKey}=`))
  if (!roleCookie) return null
  return roleCookie.split("=")[1] as MockRole
}

export const clearMockRole = () => {
  document.cookie = `${roleCookieKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
