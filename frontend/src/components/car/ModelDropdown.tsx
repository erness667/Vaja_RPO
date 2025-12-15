'use client';

import { Field } from "@chakra-ui/react";
import { useCarModels } from "@/lib/hooks/useCarModels";

interface ModelDropdownProps {
  makeId: string | null | undefined;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ModelDropdown({
  makeId,
  value,
  onChange,
  label = "Vsi modeli",
  placeholder = "Vsi modeli",
  disabled = false,
}: ModelDropdownProps) {
  const { models, isLoading } = useCarModels(makeId);

  return (
    <Field.Root>
      <Field.Label
        fontSize="sm"
        fontWeight="medium"
        color={{ base: "gray.700", _dark: "gray.300" }}
      >
        {label}
      </Field.Label>
      <select
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        disabled={disabled || isLoading || !makeId}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--chakra-colors-gray-300)",
          borderRadius: "0.375rem",
          backgroundColor: "var(--chakra-colors-white)",
          color: "var(--chakra-colors-gray-900)",
          fontSize: "1rem",
        }}
      >
        <option value="">{placeholder}</option>
        {models.map((model) => (
          <option key={model.id} value={model.id || ""}>
            {model.name}
          </option>
        ))}
      </select>
    </Field.Root>
  );
}

