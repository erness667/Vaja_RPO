"use client";

import { useParams } from "next/navigation";
import { CarDetailPage } from "@/components/car/CarDetailPage";

export default function CarDetail() {
  const params = useParams();
  const carId = params?.id ? parseInt(params.id as string, 10) : null;

  return <CarDetailPage carId={carId} />;
}

