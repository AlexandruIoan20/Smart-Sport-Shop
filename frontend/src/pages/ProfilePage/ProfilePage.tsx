import { useState } from "react"
import ProfileForm from "./components/ProfileForm"
import PersonalDataForm from "./components/PersonalDataForm"

type Tab = "sport" | "personal"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("sport")

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Profilul meu</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Gestionează informațiile tale personale și preferințele sportive.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "personal"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Date personale
          </button>
          <button
            onClick={() => setActiveTab("sport")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "sport"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Profil sportiv
          </button>
        </div>

        {/* Content */}
        {activeTab === "personal" && <PersonalDataForm />}
        {activeTab === "sport"    && <ProfileForm />}
      </div>
    </div>
  )
}