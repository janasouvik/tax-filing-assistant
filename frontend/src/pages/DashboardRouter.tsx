import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

export default function DashboardRouter() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUser = async () => {
      try {
        const token = await getToken();
        // Here we would call the backend to sync user and get their workspaces
        // For now, simulating the sync and redirect
        // In a real implementation, we'd fetch from /api/workspaces
        
        // Mock backend call
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName || "User",
          })
        });

        if (!response.ok) {
          throw new Error("Failed to sync user");
        }

        const data = await response.json();
        
        if (data.workspaces && data.workspaces.length > 0) {
          const type = data.workspaces[0].type;
          if (type === "INDIVIDUAL") {
            navigate("/individualtaxdashboard");
          } else if (type === "SME") {
            navigate("/smetaxdashboard");
          } else {
            navigate("/onboarding");
          }
        } else {
          navigate("/onboarding");
        }
      } catch (err) {
        console.error("Error in dashboard router", err);
        setError("Failed to initialize session. Please try again.");
      }
    };

    syncUser();
  }, [isLoaded, user, navigate, getToken]);

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-app-bg text-app-error">{error}</div>;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-app-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
