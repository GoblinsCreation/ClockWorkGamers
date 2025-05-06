import { MicroInteractionDemo } from "@/components/demo/MicroInteractionDemo";
import { PageHeader } from "@/components/ui/page-header";

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <main className="flex-grow">
        <div className="container mx-auto pb-16 pt-8">
          <PageHeader 
            title="Micro-Interaction Demo" 
            description="Explore the animated interactions and Web3-styled UI elements for ClockWork Gamers" 
          />
          <MicroInteractionDemo />
        </div>
      </main>
    </div>
  );
}