import Link from "next/link";

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002";

export default function Footer() {
  return (
    <footer className="bg-[#09090B] border-t border-white/5 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[#71717A] text-sm">
          &copy; {new Date().getFullYear()} EigenWatch. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="https://docs.eigenwatch.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#71717A] hover:text-white text-sm transition-colors"
          >
            Documentation
          </Link>
          <Link
            href={`${dashboardUrl}/operator`}
            className="text-[#71717A] hover:text-white text-sm transition-colors"
          >
            Operators
          </Link>
          <Link
            href="https://x.com/eigenwatch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#71717A] hover:text-white text-sm transition-colors"
          >
            𝕏
          </Link>
        </div>
      </div>
    </footer>
  );
}
