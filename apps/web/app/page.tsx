import Hero from "@/components/landing/hero";
import Tools from "@/components/landing/tools";
import OperatorDiscovery from "@/components/landing/operator-discovery";
import CTA from "@/components/landing/cta";
import Sponsors from "@/components/landing/sponsors";
import { getNetworkStats } from "@/actions/network";
import { NetworkStats } from "@/types/network.types";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch network stats server-side — API key never reaches the client
  let stats: NetworkStats | null = null;
  try {
    const statsResponse = await getNetworkStats();
    if (statsResponse.success && statsResponse.data) {
      stats = (statsResponse.data as any)?.data ?? null;
    }
  } catch {
    // API unreachable
  }

  return (
    <main className="min-h-screen">
      <Hero stats={stats} />
      <Tools />
      <Sponsors />
      <OperatorDiscovery />
      <CTA stats={stats} />
    </main>
  );
}
