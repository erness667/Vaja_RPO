"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

