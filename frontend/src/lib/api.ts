function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1" && !host.includes("vercel.app")) {
      return `http://${host}:8000/api/v1`;
    }
  }
  return "http://localhost:8000/api/v1";
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? (localStorage.getItem("nexora_token") || localStorage.getItem("token")) : null;
  const baseUrl = getBaseUrl();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    if (netErr?.name === "TypeError" || netErr?.message?.toLowerCase().includes("fetch")) {
      throw new Error(
        `Backend server is offline or unreachable at ${baseUrl}. Please start the backend server with: cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`
      );
    }
    throw netErr;
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
      localStorage.removeItem("nexora_token");
    }
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
