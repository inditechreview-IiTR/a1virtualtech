import { useState } from "react";
import { WORKBOOK, GOLDEN_RULES, KEY_TERMS, REALITY_CHECK, SHOP_STORY, GRADING } from "@/lib/study/workbook";

export function Workbook() {
  const [page, setPage] = useState(1);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const p = WORKBOOK.find((w) => w.page === page)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-1">
        {WORKBOOK.map((w) => (
          <button key={w.page} onClick={() => setPage(w.page)}
            className={`rounded-sm border px-3 py-2 text-left text-sm ${w.page === page ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"}`}>
            <span className="label-tech mr-2">P{w.page}</span>{w.title}
          </button>
        ))}
      </aside>
      <div className="space-y-6">
        <section className="rounded-sm border border-border bg-card p-6">
          <p className="label-tech">Workbook page {p.page}</p>
          <h2 className="font-display text-2xl font-bold uppercase">{p.title}</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">{p.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          {p.vocab && <p className="mt-3 text-sm"><span className="font-semibold">Vocabulary:</span> {p.vocab.join(" · ")}</p>}
          <div className="mt-5 space-y-3">
            {p.questions.map((q, i) => {
              const k = `${p.page}-${i}`;
              return (
                <div key={k} className="rounded-sm border border-border p-4">
                  <p className="font-medium">{i + 1}. {q.q}</p>
                  <textarea placeholder="Your answer…" className="mt-2 w-full rounded-sm border border-border bg-background p-2 text-sm" rows={2} />
                  <button onClick={() => setShown((s) => ({ ...s, [k]: !s[k] }))} className="mt-2 text-xs font-semibold text-primary">
                    {shown[k] ? "Hide key" : "Check answer key"}
                  </button>
                  {shown[k] && <p className="mt-2 text-sm text-muted-foreground">{q.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold uppercase">A1–A9 Golden Rules</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {GOLDEN_RULES.map((g) => (
              <div key={g.area} className="rounded-sm border border-border p-3 text-sm">
                <p className="label-tech">{g.area} · {g.focus}</p>
                <p className="font-semibold">{g.concept}</p>
                <p className="text-muted-foreground">{g.rule}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold uppercase">Key terms</h3>
            <dl className="mt-3 space-y-2 text-sm">{KEY_TERMS.map((t) => <div key={t.term}><dt className="font-semibold">{t.term}</dt><dd className="text-muted-foreground">{t.def}</dd></div>)}</dl>
          </div>
          <div className="rounded-sm border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold uppercase">Three-Step Reality Check</h3>
            <ol className="mt-3 space-y-2 text-sm">{REALITY_CHECK.map((r, i) => <li key={r.title}><span className="font-semibold">{i + 1}. {r.title}</span> <span className="text-muted-foreground">{r.body}</span></li>)}</ol>
          </div>
        </section>

        <section className="rounded-sm border border-primary/50 bg-primary/10 p-6">
          <p className="label-tech">Shop story</p>
          <h3 className="font-display text-lg font-bold uppercase">{SHOP_STORY.title}</h3>
          <p className="mt-2 text-sm">{SHOP_STORY.body}</p>
          <p className="mt-2 text-sm font-semibold">{SHOP_STORY.lesson}</p>
          <p className="mt-4 text-xs text-muted-foreground">{GRADING}</p>
        </section>
      </div>
    </div>
  );
}
