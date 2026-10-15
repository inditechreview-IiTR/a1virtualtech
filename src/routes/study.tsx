import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ClipboardList, GraduationCap, ListChecks, Map } from "lucide-react";
import { SiteNav } from "@/components/ase/SiteNav";
import { PracticeExam } from "@/components/study/PracticeExam";
import { FieldProtocols } from "@/components/study/FieldProtocols";
import { RoadmapTracker } from "@/components/study/RoadmapTracker";
import { DiagnosticWorksheet } from "@/components/study/DiagnosticWorksheet";
import { Workbook } from "@/components/study/Workbook";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Hub & exam prep | ASE Virtual" },
      {
        name: "description",
        content:
          "ASE-style practice exams with rationales, field diagnostic protocols, a 16-week study roadmap and a printable lab worksheet — built from the shop manuals.",
      },
      { property: "og:title", content: "Study Hub & exam prep | ASE Virtual" },
      {
        property: "og:description",
        content: "Practice exams, field protocols, the 16-week roadmap and the diagnostic worksheet — study like a shop foreman.",
      },
    ],
  }),
  component: StudyHub,
});

const TABS = [
  { id: "exam", label: "Practice exam", icon: ListChecks },
  { id: "protocols", label: "Field protocols", icon: ClipboardList },
  { id: "roadmap", label: "16-week roadmap", icon: Map },
  { id: "worksheet", label: "Lab worksheet", icon: FileIcon },
  { id: "workbook", label: "Student workbook", icon: GraduationCap },
] as const;

function FileIcon(props: { className?: string }) {
  return <BookOpen className={props.className} />;
}

type TabId = (typeof TABS)[number]["id"];

function StudyHub() {
  const [tab, setTab] = useState<TabId>("exam");

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-sm border border-primary/50 bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Study hub</h1>
            <p className="label-tech">Prove it, don't guess it · built from the shop manuals</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-sm transition-colors ${
                  tab === t.id
                    ? "border-primary bg-primary/15 font-semibold text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {tab === "exam" && <PracticeExam />}
          {tab === "protocols" && <FieldProtocols />}
          {tab === "roadmap" && <RoadmapTracker />}
          {tab === "worksheet" && <DiagnosticWorksheet />}
          {tab === "workbook" && <Workbook />}
        </div>
      </main>
    </div>
  );
}
