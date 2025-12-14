import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const ComingSoon = ({ 
  title, 
  description, 
  icon = <Construction className="h-12 w-12 text-primary mb-4" /> 
}: ComingSoonProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 pt-[30px]">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-12 pb-12 space-y-6">
          <div className="flex justify-center">
            {icon}
          </div>
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-2">Coming Soon</Badge>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="pt-4">
            <Button asChild>
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
