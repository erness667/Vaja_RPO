"use client";

import { useState } from "react";

export function CarSearch() {
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

  const handleChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search logic
    console.log("Search filters:", filters);
  };

  const handleAdvancedSearch = () => {
    // TODO: Navigate to advanced search page or open modal
    console.log("Advanced search clicked");
  };

  // Mock data for dropdowns - replace with actual API data
  const brands = ["Vse znamke", "BMW", "Mercedes", "Audi", "Volkswagen"];
  const models = ["Vsi modeli", "Model 1", "Model 2", "Model 3"];
  const fuelTypes = ["Gorivo", "Benzin", "Diesel", "Električno", "Hibridno"];

  // Generate price options
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

  // Generate year options (from 2000 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) =>
    (2000 + i).toString()
  );

  // Generate kilometer options
  const kilometerOptions = [
    "Vse",
    "10.000",
    "20.000",
    "50.000",
    "100.000",
    "150.000",
    "200.000",
  ];

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 py-6 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Hitro iskanje osebnih vozil
        </h2>

        <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Brand */}
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Vse znamke
              </label>
              <select
                id="brand"
                value={filters.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Cena od
              </label>
              <select
                id="priceFrom"
                value={filters.priceFrom}
                onChange={(e) => handleChange("priceFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Cena do
              </label>
              <select
                id="priceTo"
                value={filters.priceTo}
                onChange={(e) => handleChange("priceTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Prevoženih km do
              </label>
              <select
                id="kilometers"
                value={filters.kilometers}
                onChange={(e) => handleChange("kilometers", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Model */}
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Vsi modeli
              </label>
              <select
                id="model"
                value={filters.model}
                onChange={(e) => handleChange("model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Letnik od
              </label>
              <select
                id="yearFrom"
                value={filters.yearFrom}
                onChange={(e) => handleChange("yearFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Letnik do
              </label>
              <select
                id="yearTo"
                value={filters.yearTo}
                onChange={(e) => handleChange("yearTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Gorivo
              </label>
              <select
                id="fuel"
                value={filters.fuel}
                onChange={(e) => handleChange("fuel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={handleAdvancedSearch}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
            >
              <svg
                className="w-5 h-5"
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
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
        </form>
      </div>
    </div>
  );
}

