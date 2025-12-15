'use client';

import { Field } from "@chakra-ui/react";
import { useCarMakes } from "@/lib/hooks/useCarMakes";

interface MakeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MakeDropdown({
  value,
  onChange,
  label = "Vse znamke",
  placeholder = "Vse znamke",
  disabled = false,
}: MakeDropdownProps) {
  const { makes, isLoading } = useCarMakes();

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
        disabled={disabled || isLoading}
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
        {makes.map((make) => (
          <option key={make.id} value={make.id || ""}>
            {make.name}
          </option>
        ))}
      </select>
    </Field.Root>
  );
}

