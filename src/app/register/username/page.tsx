import Username from "@/components/account/accountIngame/page";
import React, { Suspense } from "react";

const AccountPage: React.FC = () => (
  <Suspense
    fallback={
      <div className="flex justify-center items-center min-h-screen bg-midnight">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading account settings...</p>
        </div>
      </div>
    }
  >
    <Username />
  </Suspense>
);

export default AccountPage;
