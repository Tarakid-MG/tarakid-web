import { Camera, CheckCircle, HelpCircle, Mic } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ParentPanel } from "../layout/ParentPanel";

export function ParentSupportCard({ onTest }: { onTest: () => void }) {
  return (
    <ParentPanel className="bg-linear-to-br from-white via-[#fcfeff] to-[#f6fbff] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-blue/10 text-blue">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-[1.45rem] font-bold tracking-[-0.02em] text-navy">
            Besoin d&apos;aide ?
          </h3>
          <p className="mt-1 text-[15px] text-navy/58">
            Vérifiez votre matériel avant le prochain cours.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SupportMiniTile icon={CheckCircle} label="Navigateur" accent="blue" />
        <SupportMiniTile icon={Camera} label="Caméra" accent="turquoise" />
        <SupportMiniTile icon={Mic} label="Micro" accent="orange" />
      </div>

      <div className="mt-6">
        <Button
          variant="parentOutlineBlue"
          onClick={onTest}
          className="w-full rounded-[1.1rem]"
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
    <Card
      variant="default"
      className="rounded-[1.15rem] border-slate-200/90 bg-white/80 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
    >
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
      <p className="mt-3 text-sm font-semibold text-navy">{label}</p>
    </Card>
  );
}
