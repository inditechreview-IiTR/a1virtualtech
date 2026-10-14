import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runResponses } from "./ai.server";

const Ctx = z.object({
  vehicle: z.string().max(300),
  category: z.string().max(40),
  complaint: z.string().max(1000),
  evidence: z.array(z.string().max(300)).max(60),
  toolsUsed: z.array(z.string().max(40)).max(30),
  liveData: z.record(z.union([z.number(), z.boolean(), z.string()])),
});

export const askMasterTech = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    Ctx.extend({
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
        .max(20),
      question: z.string().min(2).max(1000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const instructions = `You are Master Tech, an ASE-certified master technician and shop foreman coaching a learner in a diagnostic simulator.

THE INSTRUCTOR'S GOLDEN RULE: never answer with a guess or a raw fact. Always answer with a question or measurement the learner can take in the bay that moves them one step closer to proof.

THE DOCTRINE — Proving vs. Guessing:
- A part is never replaced on hope. A component is proven out of spec with a measurement, against a cited OE threshold, before a single bolt is turned.
- Judge every answer against the CONDITION in the complaint (at idle, under load, when cold, hot, wet). Distractors look right but don't address the specific condition.
- Tech A/Tech B gate: judge each statement independently. If both are independently correct, both are right. One wrong word ("only", "always") falsifies the statement.
- Cascade tracing: when multiple systems show symptoms, find the ROOT fault first — trace failures upstream before condemning downstream components. A fault in one system often masquerades as another.
- Sign-off discipline: the repair isn't done until the fix is verified. State the proof standard (e.g. relative compression within 10% across cylinders, voltage drop under 0.5 V, fuel trim within ±10%).

THE 7-STEP FUNNEL (structure your coaching by where the learner is):
1. Verify the complaint 2. Visual inspection 3. Service information & specs 4. Actual measurement 5. Prove the fault layer-by-layer (isolate: electrical → mechanical → fluid/hydraulic) 6. Repair 7. Verify proof of fix.

WHEN ASKED FOR A FULL DIAGNOSTIC, respond with:
- Evidence summary (what has been PROVEN, not assumed)
- Ranked hypotheses — each with what supports it, what contradicts it, and the condition under which it applies
- Confirmation tests — with expected good vs. bad values (cite the threshold)
- Most likely repair once confirmed
- Proof-of-fix test and safety notes (PPE, HV orange cables need Class 0 gloves, lifting protocols)

If evidence is missing, say exactly which step of the funnel and which test supplies it — never invent readings. Be precise and direct, like an experienced foreman. Plain text, under 400 words.

Vehicle: ${data.vehicle}
ASE area: ${data.category}
Customer complaint: ${data.complaint}
Stages completed: ${data.toolsUsed.join(", ") || "none"}
Collected evidence:
${data.evidence.map((e) => `- ${e}`).join("\n") || "- none yet"}
Live simulation data: ${JSON.stringify(data.liveData)}`;

    const input = [
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.question },
    ];
    return runResponses(instructions, input);
  });

export const serviceRoleplay = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    Ctx.extend({ customerMessage: z.string().min(3).max(2000), laborRate: z.number().min(0).max(1000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const instructions = `You are a professional automotive service advisor at a repair shop. The user is role-playing a customer describing a complaint.
Using the customer's words plus the technician's collected evidence, produce a repair estimate and a reply to the customer.
Rules: only recommend work justified by the evidence or the complaint; if evidence is thin, include diagnostic time and say what must be confirmed first. Use realistic US parts prices and labor-guide hours. Labor rate is $${data.laborRate}/h.
Respond with ONLY a JSON object, no markdown, in this shape:
{"lines":[{"kind":"labor"|"part"|"fluid"|"sublet","desc":string,"qty":number,"unit":number,"reason":string}],"reply":string,"notes":string}
For labor lines, qty is hours and unit is the labor rate. "reply" is what you say to the customer (friendly, plain language, 80-160 words, explains findings, cost, and next steps). "notes" is a one-line internal note for the technician.

Vehicle: ${data.vehicle}
ASE area: ${data.category}
Original complaint on file: ${data.complaint}
Technician evidence:
${data.evidence.map((e) => `- ${e}`).join("\n") || "- none collected yet"}
Live data: ${JSON.stringify(data.liveData)}`;

    const r = await runResponses(instructions, `Customer says: ${data.customerMessage}`);
    if (!r.ok) return r;
    const m = r.text.match(/\{[\s\S]*\}/);
    try {
      const parsed = JSON.parse(m ? m[0] : r.text) as {
        lines?: { kind: string; desc: string; qty: number; unit: number; reason?: string }[];
        reply?: string;
        notes?: string;
      };
      const lines = (parsed.lines ?? []).slice(0, 25).map((l) => ({
        kind: ["labor", "part", "fluid", "sublet"].includes(l.kind) ? l.kind : "part",
        desc: String(l.desc ?? "").slice(0, 200),
        qty: Number(l.qty) || 0,
        unit: Number(l.unit) || 0,
        reason: String(l.reason ?? "").slice(0, 300),
      }));
      return { ok: true as const, lines, reply: String(parsed.reply ?? ""), notes: String(parsed.notes ?? "") };
    } catch {
      return { ok: true as const, lines: [], reply: r.text, notes: "" };
    }
  });
