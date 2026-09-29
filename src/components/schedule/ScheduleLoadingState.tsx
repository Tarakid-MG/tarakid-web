import { SchedulePageShell } from "./SchedulePageShell";
import type { ParentSidebarItem } from "../parent-dashboard/parentDashboardUtils";

type ScheduleLoadingStateProps = {
  kidName: string;
  sidebarItems: ParentSidebarItem[];
};

export function ScheduleLoadingState({
  kidName,
  sidebarItems,
}: ScheduleLoadingStateProps) {
  return (
    <SchedulePageShell
      kidName={kidName}
      sidebarItems={sidebarItems}
      mobileSidebarItems={sidebarItems}
      mobileSidebarOpen={false}
      onOpenMobileSidebar={() => undefined}
      onCloseMobileSidebar={() => undefined}
    >
      <div className="flex min-h-[60vh] items-center justify-center rounded-4xl border border-white/80 bg-white/70">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-blue" />
      </div>
    </SchedulePageShell>
  );
}
