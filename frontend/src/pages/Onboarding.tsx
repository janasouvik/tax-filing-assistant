import { useUser, useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Onboarding() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleSelectWorkspace = async (type: "INDIVIDUAL" | "SME") => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, name: `${user?.firstName}'s Workspace` })
      });
      if (response.ok) {
        if (type === "INDIVIDUAL") navigate("/individualtaxdashboard");
        else navigate("/smetaxdashboard");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-app-bg min-h-screen">
      <Navbar />
      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-app-text-primary mb-8">Welcome, {user?.firstName}! Choose your profile</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => handleSelectWorkspace("INDIVIDUAL")}
            className="p-6 border border-app-border rounded-xl bg-app-surface cursor-pointer hover:border-primary transition-all shadow-sm"
          >
            <h2 className="text-xl font-medium text-app-text-primary mb-2">Individual Taxpayer</h2>
            <p className="text-app-text-secondary text-sm">For salaried employees, freelancers, and individual investors.</p>
          </div>
          <div 
            onClick={() => handleSelectWorkspace("SME")}
            className="p-6 border border-app-border rounded-xl bg-app-surface cursor-pointer hover:border-primary transition-all shadow-sm"
          >
            <h2 className="text-xl font-medium text-app-text-primary mb-2">SME / Business</h2>
            <p className="text-app-text-secondary text-sm">For small to medium enterprises, businesses, and corporate entities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
