import type { RefObject } from "react";
import { Camera, CheckCircle, HelpCircle, Mic, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ParentOrb, ParentPanel } from "../layout/ParentPanel";

export function ParentDeviceTestModal({
  open,
  isTesting,
  error,
  deviceStatus,
  micLevel,
  videoPreviewRef,
  onClose,
  onRetry,
}: {
  open: boolean;
  isTesting: boolean;
  error: string;
  deviceStatus: {
    camera: boolean;
    microphone: boolean;
    browser: boolean;
  };
  micLevel: number;
  videoPreviewRef: RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  onRetry: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/42 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl">
        <ParentPanel className="relative p-5 md:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-navy/45 transition hover:bg-slate-50"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <ParentOrb accent="blue">
              <HelpCircle className="h-6 w-6" />
            </ParentOrb>
            <div>
              <h3 className="text-2xl font-black text-navy">
                Test de matériel
              </h3>
              <p className="mt-2 text-base leading-7 text-navy/60">
                Vérifiez votre caméra, votre micro et les permissions du
                navigateur avant le cours.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50/75 p-4">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-navy/55">
                Aperçu caméra
              </p>
              <div className="mt-4 aspect-video overflow-hidden rounded-[1.5rem] bg-navy/92">
                {deviceStatus.camera ? (
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-white/75">
                    <div>
                      <Camera className="mx-auto h-9 w-9" />
                      <p className="mt-3 text-sm font-semibold">
                        {isTesting
                          ? "Initialisation de la caméra..."
                          : "Caméra indisponible"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <DeviceStatusTile
                icon={CheckCircle}
                label="Navigateur"
                value={
                  deviceStatus.browser
                    ? "Compatible avec le test"
                    : "Navigateur non compatible"
                }
                ok={deviceStatus.browser}
              />
              <DeviceStatusTile
                icon={Camera}
                label="Caméra"
                value={deviceStatus.camera ? "Détectée" : "Non détectée"}
                ok={deviceStatus.camera}
              />
              <DeviceStatusTile
                icon={Mic}
                label="Microphone"
                value={deviceStatus.microphone ? "Détecté" : "Non détecté"}
                ok={deviceStatus.microphone}
                meter={micLevel}
              />
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-[1.4rem] border border-orange/20 bg-orange/10 px-4 py-3 text-sm font-semibold text-orange">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="parentOutlineBlue"
              onClick={onClose}
              className="rounded-[1.2rem]"
            >
              Fermer
            </Button>
            <Button
              onClick={onRetry}
              loading={isTesting}
              className="rounded-[1.2rem]"
            >
              Relancer le test
            </Button>
          </div>
        </ParentPanel>
      </div>
    </div>
  );
}

function DeviceStatusTile({
  icon: Icon,
  label,
  value,
  ok,
  meter,
}: {
  icon: typeof CheckCircle;
  label: string;
  value: string;
  ok: boolean;
  meter?: number;
}) {
  return (
    <Card
      variant="default"
      className="rounded-[1.6rem] p-4 shadow-[0_10px_24px_rgba(32,42,68,0.04)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-[1rem]",
            ok ? "bg-turquoise/15 text-teal" : "bg-orange/12 text-orange",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black text-navy">{label}</p>
          <p className="mt-1 text-sm leading-6 text-navy/60">{value}</p>
          {typeof meter === "number" ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-lightBlue to-turquoise transition-all"
                style={{ width: `${meter}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
