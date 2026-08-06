const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export async function sendChatMessage(message: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (res.status === 429) {
    throw new Error("Rate limit exceeded. Try again in a minute.");
  }

  if (!res.ok) {
    throw new Error("Failed to get a response. Please try again.");
  }

  const data = (await res.json()) as { response: string };
  return data.response;
}
