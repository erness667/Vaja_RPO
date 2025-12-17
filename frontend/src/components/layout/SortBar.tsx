'use client';

import {
  HStack,
  Icon,
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Text,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuArrowDownWideNarrow, LuArrowUpNarrowWide, LuArrowDown01, LuArrowUp01, LuFilter, LuCheck } from "react-icons/lu";

export type SortOption = "newest" | "oldest" | "priceDesc" | "priceAsc";

const options: { key: SortOption; label: string; icon: IconType }[] = [
  { key: "newest", label: "Najnovejši", icon: LuArrowDownWideNarrow },
  { key: "oldest", label: "Najstarejši", icon: LuArrowUpNarrowWide },
  { key: "priceDesc", label: "Najdražji", icon: LuArrowDown01 },
  { key: "priceAsc", label: "Najcenejši", icon: LuArrowUp01 },
];

interface SortBarProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortBar({ value, onChange }: SortBarProps) {
  return (
    <MenuRoot positioning={{ placement: "bottom-end", offset: { mainAxis: 6 } }}>
      <MenuTrigger asChild>
        <IconButton
          aria-label="Razvrsti"
          variant="outline"
          size="sm"
        >
          <LuFilter />
        </IconButton>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent>
          {options.map((opt) => (
            <MenuItem key={opt.key} value={opt.key} onClick={() => onChange(opt.key)}>
              <HStack justify="space-between" w="full">
                <HStack gap={2}>
                  <Icon as={opt.icon} />
                  <Text>{opt.label}</Text>
                </HStack>
                {value === opt.key && <Icon as={LuCheck} color="blue.500" boxSize={4} />}
              </HStack>
            </MenuItem>
          ))}
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  );
}

