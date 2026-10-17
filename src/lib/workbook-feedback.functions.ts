import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runResponses } from "./ai.server";
import { GOLDEN_RULES, KEY_TERMS, REALITY_CHECK } from "./study/workbook";

const Input = z.object({
  page: z.number().int().min(1).max(99),
  title: z.string().max(200),
  objectives: z.array(z.string().max(300)).max(20),
  vocab: z.array(z.string().max(100)).max(30).optional(),
  questions: z.array(z.object({ q: z.string().max(500), a: z.string().max(800) })).max(10),
  answers: z.array(z.string().max(2000)).max(10),
});

export type WorkbookFeedback = {
  ok: true;
  results: { index: number; verdict: "strong" | "partial" | "missing"; feedback: string }[];
  summary: string;
} | { ok: false; error: string };

export const gradeWorkbookPage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<WorkbookFeedback> => {
    const courseMaterials = [
      "GOLDEN RULES (A1-A9):",
      ...GOLDEN_RULES.map((g) => `- ${g.area} ${g.focus} / ${g.concept}: ${g.rule}`),
      "KEY TERMS:",
      ...KEY_TERMS.map((t) => `- ${t.term}: ${t.def}`),
      "THREE-STEP REALITY CHECK:",
      ...REALITY_CHECK.map((r) => `- ${r.title}: ${r.body}`),
    ].join("\n");

    const qa = data.questions
      .map((q, i) => {
        const answer = (data.answers[i] ?? "").trim();
        return `Q${i + 1}: ${q.q}\nInstructor key: ${q.a}\nStudent answer: ${answer || "(left blank)"}`;
      })
      .join("\n\n");

    const instructions = `You are Master Tech, an ASE master technician and instructor grading a student's answers on page ${data.page} ("${data.title}") of the ASE A1-A9 Student Workbook.
Grade ONLY against the course materials and the instructor keys given below. Follow the instructor's golden rule: feedback must teach, not just correct — tell the student what measurement, spec, or reasoning proves the right answer.
For each question, give a verdict:
- "strong" — captures the key point and its reasoning
- "partial" — right direction but missing the key detail, threshold, or condition
- "missing" — blank, wrong, or off-topic
Keep each feedback to 1-2 sentences, plain language, referencing the specific key fact.
Then write a short overall summary (2-3 sentences) on what the student understands well and what to review next, naming the relevant golden rule or key term when it fits.

Course materials:
${courseMaterials}

Workbook page objectives:
${data.objectives.map((o) => `- ${o}`).join("\n")}
${data.vocab?.length ? `Vocabulary: ${data.vocab.join(", ")}` : ""}

Questions and answers:
${qa}

Respond with ONLY a JSON object, no markdown, in this shape:
{"results":[{"index":0,"verdict":"strong"|"partial"|"missing","feedback":string}],"summary":string}
Include one result per question in order.`;

    const r = await runResponses(instructions, `Grade the student's answers for workbook page ${data.page}.`);
    if (!r.ok) return { ok: false, error: r.error };

    const m = r.text.match(/\{[\s\S]*\}/);
    try {
      const parsed = JSON.parse(m ? m[0] : r.text) as {
        results?: { index?: number; verdict?: string; feedback?: string }[];
        summary?: string;
      };
      const verdicts = ["strong", "partial", "missing"] as const;
      const results = (parsed.results ?? []).slice(0, 10).map((x, i) => ({
        index: Number.isInteger(x.index) ? (x.index as number) : i,
        verdict: (verdicts as readonly string[]).includes(x.verdict ?? "")
          ? (x.verdict as "strong" | "partial" | "missing")
          : ("partial" as const),
        feedback: String(x.feedback ?? "").slice(0, 500),
      }));
      return { ok: true, results, summary: String(parsed.summary ?? "").slice(0, 800) };
    } catch {
      return { ok: false, error: "The model returned an unreadable response. Try again." };
    }
  });
