'use client';

import { useItems } from '@/hooks/use-items';
import { useBOM } from '@/hooks/use-bom';
import { useProcesses } from '@/hooks/use-processes';
import { useProcessSteps } from '@/hooks/use-process-steps';
import { useSetupStore } from '@/stores/useSetupStore';
import { setupSteps } from '@/config/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HomeContent() {
  const { items, isLoading: itemsLoading } = useItems();
  const { boms, isLoading: bomsLoading } = useBOM();
  const { processes, isLoading: processesLoading } = useProcesses();
  const { processSteps, isLoading: stepsLoading } = useProcessSteps();
  const progress = useSetupStore((state) => state.progress);

  const isLoading = itemsLoading || bomsLoading || processesLoading || stepsLoading;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {setupSteps.map((step, index) => {
          const stepProgress = progress[step.title.toLowerCase() as keyof typeof progress] || 0;
          const isComplete = stepProgress === 100;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader className="space-y-1" style={{ flex: 1 }}>
                <CardTitle className="flex items-center space-x-2">
                  {step.icon && <step.icon className="w-5 h-5" />}
                  <span>{step.title}</span>
                  {isComplete && (
                    <span className="ml-2 text-sm text-green-500">(Complete)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground">
                    {getStepDescription(step.title)}
                  </p>
                  {stepProgress > 0 && stepProgress < 100 && (
                    <p className="text-sm text-blue-500">{stepProgress}% complete</p>
                  )}
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link href={step.path} className="flex items-center justify-center">
                    {isComplete ? 'View' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-2">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : items.length}
                </span>
                <span className="text-sm text-muted-foreground">Total Items</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : boms.length}
                </span>
                <span className="text-sm text-muted-foreground">Active BOMs</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : processes.length}
                </span>
                <span className="text-sm text-muted-foreground">Processes</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : processSteps.length}
                </span>
                <span className="text-sm text-muted-foreground">Process Steps</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStepDescription(title: string): string {
  switch (title) {
    case 'Items':
      return 'Manage your inventory items, including sell items, purchase items, and components.';
    case 'Bill of Materials':
      return 'Create and manage bill of materials (BOM) for your manufacturing processes.';
    case 'Processes':
      return 'Define and organize manufacturing processes and work centers.';
    case 'Process Steps':
      return 'Break down processes into detailed steps for better workflow management.';
    default:
      return '';
  }
} 