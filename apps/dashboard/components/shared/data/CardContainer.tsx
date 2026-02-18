import { Card, CardContent } from "@/components/ui/card";

export function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <Card className="hover:border-highlight-border transition-colors p-[18px] rounded-lg w-full">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
