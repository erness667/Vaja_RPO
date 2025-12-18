"use client";

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
import {
  LuArrowDownWideNarrow,
  LuArrowUpNarrowWide,
  LuArrowDown01,
  LuArrowUp01,
  LuFilter,
  LuCheck,
} from "react-icons/lu";
import { Trans, t } from "@lingui/macro";

export type SortOption = "newest" | "oldest" | "priceDesc" | "priceAsc";

const options: { key: SortOption; icon: IconType }[] = [
  { key: "newest", icon: LuArrowDownWideNarrow },
  { key: "oldest", icon: LuArrowUpNarrowWide },
  { key: "priceDesc", icon: LuArrowDown01 },
  { key: "priceAsc", icon: LuArrowUp01 },
];

interface SortBarProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortBar({ value, onChange }: SortBarProps) {
  return (
    <MenuRoot positioning={{ placement: "bottom-end", offset: { mainAxis: 6 } }}>
      <MenuTrigger asChild>
        <IconButton aria-label={t`Razvrsti`} variant="outline" size="sm">
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
                  <Text>
                    {opt.key === "newest" && <Trans>Najnovejši</Trans>}
                    {opt.key === "oldest" && <Trans>Najstarejši</Trans>}
                    {opt.key === "priceDesc" && <Trans>Najdražji</Trans>}
                    {opt.key === "priceAsc" && <Trans>Najcenejši</Trans>}
                  </Text>
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

