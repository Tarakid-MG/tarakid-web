
import { Camera, CheckCircle, HelpCircle, Mic } from "lucide-react";
import { Button } from "../ui/Button";
import { ParentPanel } from "./ParentPanel";

export function ParentSupportCard({ onTest }: { onTest: () => void }) {
  return (
    <ParentPanel className="p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-blue/10 text-blue">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-[1.45rem] font-bold tracking-[-0.02em] text-navy">Besoin d&apos;aide ?</h3>
          <p className="mt-1 text-[15px] text-navy/58">Vérifiez votre matériel avant le prochain cours.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SupportMiniTile icon={CheckCircle} label="Navigateur" accent="blue" />
        <SupportMiniTile icon={Camera} label="Caméra" accent="turquoise" />
        <SupportMiniTile icon={Mic} label="Micro" accent="orange" />
      </div>

      <div className="mt-5">
        <Button
          variant="outline"
          onClick={onTest}
          className="w-full rounded-[1.1rem] border-blue/20 text-blue hover:bg-blue/6"
        >
          Tester mon matériel
        </Button>
      </div>
    </ParentPanel>
  );
}

function SupportMiniTile({
  icon: Icon,
  label,
  accent,
}: {
  icon: typeof CheckCircle;
  label: string;
  accent: "blue" | "turquoise" | "orange";
}) {
  return (
    <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50/75 p-3">
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full",
          accent === "orange"
            ? "bg-orange/12 text-orange"
            : accent === "turquoise"
              ? "bg-turquoise/15 text-teal"
              : "bg-blue/10 text-blue",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-navy">{label}</p>
    </div>
  );
}
