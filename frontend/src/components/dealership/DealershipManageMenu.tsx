"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  HStack,
  Button,
  Icon,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { LuFileText, LuTrendingUp } from "react-icons/lu";

export function DealershipManageMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <MenuRoot positioning={{ placement: "bottom-start", offset: { mainAxis: 6 } }}>
      <MenuTrigger asChild>
        <Button variant="outline" size="sm">
          <HStack gap={2}>
            <Icon as={LuFileText} boxSize={4} />
            <Trans>Meni</Trans>
          </HStack>
        </Button>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent>
          <MenuItem 
            value="cars" 
            onClick={() => router.push("/dealerships/manage/cars")}
            bg={isActive("/dealerships/manage/cars") ? { base: "blue.50", _dark: "blue.900" } : undefined}
          >
            <HStack gap={2}>
              <Icon as={LuFileText} boxSize={4} />
              <Trans>Objavljeni avtomobili</Trans>
            </HStack>
          </MenuItem>
          <MenuItem 
            value="analytics" 
            onClick={() => router.push("/dealerships/manage/analytics")}
            bg={isActive("/dealerships/manage/analytics") ? { base: "blue.50", _dark: "blue.900" } : undefined}
          >
            <HStack gap={2}>
              <Icon as={LuTrendingUp} boxSize={4} />
              <Trans>Analitika</Trans>
            </HStack>
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  );
}
