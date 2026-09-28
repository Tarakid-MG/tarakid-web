import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { useKidMode } from "../hooks/useKidMode";
import { buildParentSidebarItems } from "../components/parent-dashboard";
import {
  SettingsAccountSection,
  SettingsErrorAlert,
  SettingsHero,
  SettingsKidProfileCard,
  SettingsKidsSection,
  SettingsPageShell,
  SettingsParentProfileCard,
  SettingsSuccessAlert,
  type KidInfoState,
  type ParentInfoState,
} from "../components/settings";
import api from "../api/client";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { selectedKid, updateSelectedKid } = useKidMode();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [parentInfo, setParentInfo] = useState<ParentInfoState>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  });
  const [kidInfo, setKidInfo] = useState<KidInfoState>({
    name: selectedKid?.name || "",
    age: selectedKid?.age || 0,
    gender: selectedKid?.gender || "BOY",
    motherTongueProficiency: selectedKid?.motherTongueProficiency || "NONE",
    englishReadingLevel: selectedKid?.englishReadingLevel || "NONE",
    englishSpeakingLevel: selectedKid?.englishSpeakingLevel || "NONE",
    learningDuration: selectedKid?.learningDuration || "",
    hobbies: selectedKid?.hobbies || [],
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    selectedKid?.avatarUrl || null,
  );

  const kids = user?.kids || [];

  const sidebarItems = useMemo(
    () =>
      buildParentSidebarItems({
        onDashboard: () => navigate("/dashboard"),
        onSchedule: () => navigate("/schedule"),
        onHistory: () => navigate("/history"),
        onActivities: () => navigate("/kid-dashboard"),
        onSettings: () => navigate("/settings"),
        activeItem: "profile",
      }),
    [navigate],
  );

  const mobileSidebarItems = useMemo(
    () =>
      sidebarItems.map((item) => ({
        ...item,
        onClick: () => {
          item.onClick?.();
          setMobileSidebarOpen(false);
        },
      })),
    [sidebarItems],
  );

  useEffect(() => {
    if (!user) return;

    setParentInfo({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    });
  }, [user]);

  useEffect(() => {
    if (!selectedKid) return;

    setKidInfo({
      name: selectedKid.name || "",
      age: selectedKid.age || 0,
      gender: selectedKid.gender || "BOY",
      motherTongueProficiency: selectedKid.motherTongueProficiency || "NONE",
      englishReadingLevel: selectedKid.englishReadingLevel || "NONE",
      englishSpeakingLevel: selectedKid.englishSpeakingLevel || "NONE",
      learningDuration: selectedKid.learningDuration || "",
      hobbies: selectedKid.hobbies || [],
    });
    setAvatarPreview(selectedKid.avatarUrl || null);
  }, [selectedKid]);

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      const response = await api.patch("/users/profile", parentInfo);
      updateUser?.(response.data);
      setSuccessMsg("Informations parent enregistrées !");
    } catch {
      setErrorMsg("Erreur lors de la mise à jour des informations parent.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKid) return;

    setIsLoading(true);
    resetMessages();

    try {
      const response = await api.patch(`/kids/${selectedKid.id}`, kidInfo);
      updateSelectedKid?.(response.data);
      setSuccessMsg("Informations enfant enregistrées !");
    } catch {
      setErrorMsg("Erreur lors de la mise à jour des informations enfant.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedKid) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await api.post(`/kids/${selectedKid.id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      updateSelectedKid?.(response.data);
      setSuccessMsg("Photo de profil mise à jour !");
    } catch {
      setErrorMsg("Erreur lors de l'upload de l'image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SettingsPageShell
      kidName={selectedKid?.name || "Mizy"}
      sidebarItems={sidebarItems}
      mobileSidebarItems={mobileSidebarItems}
      mobileSidebarOpen={mobileSidebarOpen}
      onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
    >
      <SettingsHero onBack={() => navigate(-1)} />

      {successMsg ? <SettingsSuccessAlert message={successMsg} /> : null}
      {errorMsg ? <SettingsErrorAlert message={errorMsg} /> : null}

      <SettingsKidsSection
        kids={kids}
        selectedKidId={selectedKid?.id}
        onSelectKid={updateSelectedKid}
        onAddKid={() => navigate("/quiz")}
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <SettingsParentProfileCard
          parentInfo={parentInfo}
          isLoading={isLoading}
          onSubmit={handleParentSubmit}
          onChange={(patch) =>
            setParentInfo((prev) => ({
              ...prev,
              ...patch,
            }))
          }
        />

        <SettingsKidProfileCard
          selectedKid={selectedKid}
          kidInfo={kidInfo}
          avatarPreview={avatarPreview}
          isLoading={isLoading}
          onSubmit={handleKidSubmit}
          onChange={(patch) =>
            setKidInfo((prev) => ({
              ...prev,
              ...patch,
            }))
          }
          onAvatarChange={handleAvatarChange}
        />
      </div>

      <SettingsAccountSection onLogout={handleLogout} />
    </SettingsPageShell>
  );
}
