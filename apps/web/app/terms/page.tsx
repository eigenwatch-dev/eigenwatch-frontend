import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), "content", "terms.md");
  const content = fs.readFileSync(filePath, "utf8");

  // Simple markdown-to-JSX parsing for the specific structure of terms.md
  // In a more complex app, we'd use a real markdown renderer, but this keeps it lightweight and performant.
  const sections = content.split("## ").map((section, idx) => {
    if (idx === 0) return { title: "", content: section };
    const [title, ...rest] = section.split("\n");
    return { title, content: rest.join("\n") };
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-foreground font-sans selection:bg-primary/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> Legal & Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Please read these terms carefully before using the EigenWatch
            platform.
          </p>
        </div>

        <div className="space-y-12 leading-relaxed">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              {section.title && (
                <h2 className="text-xl font-semibold text-white/90 flex items-center gap-3">
                  <span className="text-primary text-sm font-mono opacity-50">
                    0{idx}
                  </span>
                  {section.title}
                </h2>
              )}
              <div className="text-muted-foreground text-sm space-y-4 whitespace-pre-wrap">
                {section.content.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>{para.trim()}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-muted-foreground opacity-50">
            EigenWatch &copy; {new Date().getFullYear()} &middot; Built for the
            modular future.
          </p>
        </div>
      </main>
    </div>
  );
}
