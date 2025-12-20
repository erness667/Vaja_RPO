"use client";

import { useParams } from "next/navigation";
import { CarEditForm } from "@/components/car/CarEditForm";

export default function CarEditPage() {
  const params = useParams();
  const carId = params?.id ? parseInt(params.id as string, 10) : null;

  if (!carId) {
    return <div>Invalid car ID</div>;
  }

  return <CarEditForm carId={carId} />;
}

