import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { ParentSidebar } from "../parent-dashboard";
import type { ParentSidebarItem } from "../parent-dashboard/parentDashboardUtils";

type SchedulePageShellProps = {
  kidName: string;
  sidebarItems: ParentSidebarItem[];
  mobileSidebarItems: ParentSidebarItem[];
  mobileSidebarOpen: boolean;
  onOpenMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
  children: ReactNode;
};

export function SchedulePageShell({
  kidName,
  sidebarItems,
  mobileSidebarItems,
  mobileSidebarOpen,
  onOpenMobileSidebar,
  onCloseMobileSidebar,
  children,
}: SchedulePageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5fbff] text-navy">
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          backgroundImage:
            "radial-gradient(circle at 13% 6%, rgba(76,201,240,0.24), transparent 28%), radial-gradient(circle at 88% 4%, rgba(255,214,102,0.24), transparent 20%), radial-gradient(circle at 75% 90%, rgba(64,224,208,0.17), transparent 30%), linear-gradient(180deg, #f8fcff 0%, #eef9ff 52%, #fffdf3 100%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-gold/14 blur-3xl" />

      <div className="relative mx-auto max-w-[1660px] px-4 py-4 md:px-6 md:py-6 xl:px-8 xl:py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <ParentSidebar kidName={kidName} items={sidebarItems} />
            </div>
          </aside>

          <main className="min-w-0 space-y-6 md:space-y-8">
            <div className="flex justify-end xl:hidden">
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="inline-flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/90 px-4 py-3 text-sm font-bold text-navy shadow-[0_16px_36px_rgba(32,42,68,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5 text-blue" />
                <span>Menu</span>
              </button>
            </div>

            {children}
          </main>
        </div>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-navy/42 backdrop-blur-sm"
            onClick={onCloseMobileSidebar}
          />
          <div className="absolute left-0 top-0 h-full w-[min(88vw,350px)] overflow-y-auto p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onCloseMobileSidebar}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/92 text-navy shadow-[0_12px_30px_rgba(32,42,68,0.14)]"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ParentSidebar kidName={kidName} items={mobileSidebarItems} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
