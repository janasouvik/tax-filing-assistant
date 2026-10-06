import { SignIn } from "@clerk/react";
import Navbar from "../components/Navbar";

export default function SignInPage() {
  return (
    <div className="bg-app-bg min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard-router" />
      </div>
    </div>
  );
}
