import { SignUp } from "@clerk/react";
import Navbar from "../components/Navbar";

export default function SignUpPage() {
  return (
    <div className="bg-app-bg min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard-router" />
      </div>
    </div>
  );
}
