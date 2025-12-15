'use client';

import { PageShell } from "@/components/layout/PageShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CarCreateForm } from "@/components/car/CarCreateForm";
import { Heading } from "@chakra-ui/react";

export default function CreatePage() {
  return (
    <ProtectedRoute>
      <PageShell maxWidthClass="max-w-4xl">
        <Heading
          size="xl"
          mb={6}
          color={{ base: "gray.800", _dark: "gray.100" }}
        >
          Objavi oglas
        </Heading>
        <CarCreateForm />
      </PageShell>
    </ProtectedRoute>
  );
}

