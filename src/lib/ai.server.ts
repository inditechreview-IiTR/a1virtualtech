
export type AiResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Calls Gemini from the server; never expose the API key to the browser. */
export async function runResponses(
  instructions: string,
  input: unknown,
): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return {
      ok: false,
      error: "Gemini is not configured on the server.",
    };
  }

  if (
    !Array.isArray(input) ||
    !input.every(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        "role" in m &&
        "content" in m &&
        ((m as ChatMessage).role === "user" ||
          (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
  ) {
    return { ok: false, error: "Invalid chat input." };
  }

  const contents = (input as ChatMessage[]).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: instructions }],
          },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
          },
        }),
      },
    );

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 429) {
        return {
          ok: false,
          error: "Gemini rate limit reached. Please try again shortly.",
        };
      }

      console.error("Gemini API request failed:", res.status);

      return {
        ok: false,
        error: "Gemini could not answer. Check the server configuration.",
      };
    }

    const text = body?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return {
        ok: false,
        error: "Gemini returned no answer. Please try again.",
      };
    }

    return { ok: true, text };
  } catch {
    return {
      ok: false,
      error: "Could not connect to Gemini. Check the server connection.",
    };
  }
}
