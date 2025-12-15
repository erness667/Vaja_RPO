'use client';

import { useEffect, useMemo } from "react";
import { Field, Select, useListCollection } from "@chakra-ui/react";
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

  const items = useMemo(
    () =>
      makes.map((make) => ({
        value: make.id || "",
        label: make.name ?? "",
      })),
    [makes]
  );

  const list = useListCollection({
    initialItems: items,
    itemToString: (item) => item.label,
  });

  // Keep collection in sync when items change (after API fetch)
  useEffect(() => {
    list.set(items);
  }, [items, list]);

  return (
    <Field.Root>
      <Field.Label
        fontSize="sm"
        fontWeight="medium"
        color={{ base: "gray.700", _dark: "gray.300" }}
      >
        {label}
      </Field.Label>
      <Select.Root
        collection={list.collection}
        value={value ? [value] : []}
        onValueChange={(details) => onChange(details.value[0] ?? "")}
        disabled={disabled || isLoading}
      >
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
            <Select.ClearTrigger />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {list.collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </Field.Root>
  );
}

