'use client';

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { useColorMode } from "@/components/ui/color-mode";

export function CarSearch() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    kilometers: "",
    fuel: "",
  });

  const handleChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search filters:", filters);
  };

  const handleAdvancedSearch = () => {
    console.log("Advanced search clicked");
  };

  const brands = ["Vse znamke", "BMW", "Mercedes", "Audi", "Volkswagen"];
  const models = ["Vsi modeli", "Model 1", "Model 2", "Model 3"];
  const fuelTypes = ["Gorivo", "Benzin", "Diesel", "Električno", "Hibridno"];

  const priceOptions = [
    "Vse",
    "0",
    "5.000",
    "10.000",
    "15.000",
    "20.000",
    "30.000",
    "50.000",
    "100.000",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) =>
    (2000 + i).toString()
  );

  const kilometerOptions = [
    "Vse",
    "10.000",
    "20.000",
    "50.000",
    "100.000",
    "150.000",
    "200.000",
  ];

  const formBg = isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.9)";
  const formBorder = isDark ? "rgba(51, 65, 85, 0.6)" : "rgba(229, 231, 235, 0.8)";
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const labelColor = isDark ? "#cbd5e1" : "#4b5563";
  const inputBg = isDark ? "#0f172a" : "#ffffff";
  const inputBorder = isDark ? "#475569" : "#d1d5db";
  const inputText = isDark ? "#f1f5f9" : "#111827";
  const buttonBg = "#2563eb";
  const buttonHover = "#1d4ed8";

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <h2 style={{
        fontSize: "24px",
        fontWeight: "600",
        color: textColor,
        marginBottom: "24px",
      }}>
        Hitro iskanje osebnih vozil
      </h2>

      <form
        onSubmit={handleSearch}
        style={{
          backgroundColor: formBg,
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: `1px solid ${formBorder}`,
        }}
      >
        {/* First Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}>
          {/* Brand */}
          <div>
            <label
              htmlFor="brand"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Vse znamke
            </label>
            <select
              id="brand"
              value={filters.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {brands.map((brand) => (
                <option key={brand} value={brand === "Vse znamke" ? "" : brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price From */}
          <div>
            <label
              htmlFor="priceFrom"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Cena od
            </label>
            <select
              id="priceFrom"
              value={filters.priceFrom}
              onChange={(e) => handleChange("priceFrom", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {priceOptions.map((price) => (
                <option key={price} value={price === "Vse" ? "" : price}>
                  {price === "Vse" ? price : `€ ${price}`}
                </option>
              ))}
            </select>
          </div>

          {/* Price To */}
          <div>
            <label
              htmlFor="priceTo"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Cena do
            </label>
            <select
              id="priceTo"
              value={filters.priceTo}
              onChange={(e) => handleChange("priceTo", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {priceOptions.map((price) => (
                <option key={price} value={price === "Vse" ? "" : price}>
                  {price === "Vse" ? price : `€ ${price}`}
                </option>
              ))}
            </select>
          </div>

          {/* Kilometers */}
          <div>
            <label
              htmlFor="kilometers"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Prevoženih km do
            </label>
            <select
              id="kilometers"
              value={filters.kilometers}
              onChange={(e) => handleChange("kilometers", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {kilometerOptions.map((km) => (
                <option key={km} value={km === "Vse" ? "" : km}>
                  {km === "Vse" ? km : `${km} km`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {/* Model */}
          <div>
            <label
              htmlFor="model"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Vsi modeli
            </label>
            <select
              id="model"
              value={filters.model}
              onChange={(e) => handleChange("model", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {models.map((model) => (
                <option key={model} value={model === "Vsi modeli" ? "" : model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Year From */}
          <div>
            <label
              htmlFor="yearFrom"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Letnik od
            </label>
            <select
              id="yearFrom"
              value={filters.yearFrom}
              onChange={(e) => handleChange("yearFrom", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">Vse</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Year To */}
          <div>
            <label
              htmlFor="yearTo"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Letnik do
            </label>
            <select
              id="yearTo"
              value={filters.yearTo}
              onChange={(e) => handleChange("yearTo", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">Vse</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel */}
          <div>
            <label
              htmlFor="fuel"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: labelColor,
                marginBottom: "4px",
              }}
            >
              Gorivo
            </label>
            <select
              id="fuel"
              value={filters.fuel}
              onChange={(e) => handleChange("fuel", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${inputBorder}`,
                borderRadius: "6px",
                backgroundColor: inputBg,
                color: inputText,
                outline: "none",
                cursor: "pointer",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = inputBorder;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel} value={fuel === "Gorivo" ? "" : fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <button
              type="button"
              onClick={handleAdvancedSearch}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: isDark ? "#e2e8f0" : "#4b5563",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#60a5fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isDark ? "#e2e8f0" : "#4b5563";
              }}
            >
              <svg
                style={{ width: "20px", height: "20px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Napredno iskanje z dodatnimi filtri
            </button>

            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: buttonBg,
                color: "white",
                fontWeight: "600",
                padding: "10px 24px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = buttonHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = buttonBg;
              }}
            >
              <svg
                style={{ width: "20px", height: "20px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Iskanje vozil
            </button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}


