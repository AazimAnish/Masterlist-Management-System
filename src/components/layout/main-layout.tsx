import { TabNavigation } from '@/components/navigation/tab-navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <TabNavigation />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
