import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Camera,
  Save,
  Baby,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Plus,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContextDefinition";
import { useKidMode } from "../hooks/useKidMode";
import { Navbar } from "../components/layout/Navbar";
import api from "../api/client";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { selectedKid, updateSelectedKid } = useKidMode();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [parentInfo, setParentInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  });

  const [kidInfo, setKidInfo] = useState({
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

  useEffect(() => {
    if (user) {
      setParentInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedKid) {
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
    }
  }, [selectedKid]);

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await api.patch("/users/profile", parentInfo);
      if (updateUser) updateUser(response.data);
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
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await api.patch(`/kids/${selectedKid.id}`, kidInfo);
      if (updateSelectedKid) updateSelectedKid(response.data);
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

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await api.post(
        `/kids/${selectedKid.id}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (updateSelectedKid) updateSelectedKid(response.data);
      setSuccessMsg("Photo de profil mise à jour !");
    } catch {
      setErrorMsg("Erreur lors de l'upload de l'image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl transition-colors text-navy/60"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-navy">Paramètres</h1>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <p className="font-bold">{errorMsg}</p>
          </div>
        )}

        <section className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-blue/10 p-3">
                  <Users className="h-6 w-6 text-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-navy">
                    Profils enfants
                  </h2>
                  <p className="text-sm font-medium text-navy/55">
                    Sélectionnez un enfant à modifier ou ajoutez-en un autre.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {kids.map((kid) => {
                  const active = selectedKid?.id === kid.id;
                  return (
                    <button
                      key={kid.id}
                      type="button"
                      onClick={() => updateSelectedKid(kid)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left transition-all",
                        active
                          ? "border-blue/20 bg-blue/8 text-blue shadow-[0_12px_24px_rgba(33,158,188,0.12)]"
                          : "border-slate-200 bg-slate-50 text-navy hover:border-blue/20 hover:bg-white",
                      ].join(" ")}
                    >
                      <div className="text-sm font-black">{kid.name}</div>
                      <div className="mt-1 text-xs font-medium opacity-70">
                        {kid.age} ans
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/quiz")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-4 font-black text-white shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Ajouter un enfant
            </button>
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Parent Profile */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue/10 rounded-2xl">
                <UserIcon className="w-6 h-6 text-blue" />
              </div>
              <h2 className="text-xl font-black text-navy">Profil Parent</h2>
            </div>

            <form onSubmit={handleParentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-navy/60 ml-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={parentInfo.firstName}
                    onChange={(e) =>
                      setParentInfo({
                        ...parentInfo,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-black text-navy/60 ml-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={parentInfo.lastName}
                    onChange={(e) =>
                      setParentInfo({ ...parentInfo, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-navy/60 ml-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/30" />
                  <input
                    type="tel"
                    value={parentInfo.phoneNumber}
                    onChange={(e) =>
                      setParentInfo({
                        ...parentInfo,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy"
                    placeholder="06 00 00 00 00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-black text-navy/60 ml-1">
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-navy/30" />
                  <textarea
                    rows={3}
                    value={parentInfo.address}
                    onChange={(e) =>
                      setParentInfo({ ...parentInfo, address: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy resize-none"
                    placeholder="Votre adresse complète"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue text-white py-4 rounded-2xl font-black shadow-lg shadow-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Enregistrer
              </button>
            </form>
          </section>

          {/* Kid Profile */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow/10 rounded-2xl">
                <Baby className="w-6 h-6 text-yellow" />
              </div>
              <h2 className="text-xl font-black text-navy">Profil Enfant</h2>
            </div>

            {!selectedKid ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-navy/60 font-medium">
                  Veuillez sélectionner un enfant pour modifier ses paramètres.
                </p>
              </div>
            ) : (
              <form onSubmit={handleKidSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-slate-100 rounded-full overflow-hidden border-4 border-white shadow-md">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-navy/20 font-black text-4xl">
                          {kidInfo.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2.5 bg-yellow text-white rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs font-black text-navy/40 uppercase tracking-wider">
                    Changer la photo
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-black text-navy/60 ml-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={kidInfo.name}
                        onChange={(e) =>
                          setKidInfo({ ...kidInfo, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-black text-navy/60 ml-1">
                        Âge
                      </label>
                      <input
                        type="number"
                        value={kidInfo.age}
                        onChange={(e) =>
                          setKidInfo({
                            ...kidInfo,
                            age: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-navy"
                      />
                    </div>
                  </div>

                  {/* Add more kid fields as needed from kidInfo */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-yellow text-white py-4 rounded-2xl font-black shadow-lg shadow-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Enregistrer l'enfant
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
