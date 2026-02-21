import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { marked } from "marked";

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), "content", "terms.md");
  const markdownContent = fs.readFileSync(filePath, "utf8");

  // Convert markdown to HTML using marked
  const htmlContent = await marked.parse(markdownContent);

  return (
    <div className="min-h-screen bg-[#09090B] text-foreground font-sans selection:bg-primary/30">
      {/* Background Blobs (keeping the premium look) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Legal Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> Legal & Governance
          </div>
        </div>

        {/* Rendered Markdown with Tailwind Typography */}
        <article
          className="prose prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-4
            prose-p:text-[#A1A1AA] prose-p:leading-relaxed
            prose-strong:text-white
            prose-hr:border-white/5
            prose-li:text-[#A1A1AA]"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>
    </div>
  );
}
