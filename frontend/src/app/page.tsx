import { Button } from "@/shared/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl font-bold tracking-tight">Synapse KL</h1>
      <p className="text-muted-foreground">Spa Management System</p>
      <div className="flex gap-4">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}
