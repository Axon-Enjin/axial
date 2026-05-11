import { AppSidebar } from "@/components/AppSidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-container-lowest font-body-md text-body-md text-on-surface selection:bg-primary/20 selection:text-primary">
      <AppSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-64">
        {children}
      </div>
    </div>
  );
}
