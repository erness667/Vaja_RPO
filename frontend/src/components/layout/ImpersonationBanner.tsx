"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  HStack,
  Button,
  Icon,
  Text,
} from "@chakra-ui/react";
import { LuShield, LuX } from "react-icons/lu";
import { Trans } from "@lingui/macro";
import { isImpersonating, stopImpersonating, getOriginalAdminTokens, getStoredUser } from "@/lib/utils/auth-storage";

export function ImpersonationBanner() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<string | null>(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const impersonating = isImpersonating();
      setIsActive(impersonating);
      
      if (impersonating) {
        const currentUser = getStoredUser();
        const originalTokens = getOriginalAdminTokens();
        
        if (currentUser) {
          const userName = currentUser.name && currentUser.surname 
            ? `${currentUser.name} ${currentUser.surname}`
            : currentUser.username || currentUser.email || 'Uporabnik';
          setImpersonatedUser(userName);
        }
        
        if (originalTokens?.user) {
          const adminName = originalTokens.user.name && originalTokens.user.surname
            ? `${originalTokens.user.name} ${originalTokens.user.surname}`
            : originalTokens.user.username || originalTokens.user.email || 'Admin';
          setOriginalAdmin(adminName);
        }
      } else {
        setImpersonatedUser(null);
        setOriginalAdmin(null);
      }
    };

    checkImpersonation();
    
    // Listen for auth state changes and impersonation changes
    const handleAuthChange = () => {
      checkImpersonation();
    };
    
    const handleImpersonationStop = () => {
      checkImpersonation();
    };
    
    // No need for periodic polling - event listeners handle all state changes
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('userDataUpdated', handleAuthChange);
    window.addEventListener('impersonationStopped', handleImpersonationStop);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('userDataUpdated', handleAuthChange);
      window.removeEventListener('impersonationStopped', handleImpersonationStop);
    };
  }, []);

  const handleStopImpersonating = useCallback(() => {
    const success = stopImpersonating();
    if (success) {
      // Update state immediately
      setIsActive(false);
      setImpersonatedUser(null);
      setOriginalAdmin(null);
      // Redirect to admin users page
      router.push("/admin/users");
      router.refresh();
    }
  }, [router]);

  if (!isActive) {
    return null;
  }

  return (
    <Box
      bg={{ base: "blue.600", _dark: "blue.700" }}
      color="white"
      py={2}
      px={4}
      borderBottomWidth="1px"
      borderColor={{ base: "blue.700", _dark: "blue.800" }}
    >
      <HStack justify="space-between" align="center" maxW="100%" gap={4}>
        <HStack gap={2} flex={1} minW={0}>
          <Icon as={LuShield} boxSize={5} />
          <Text fontSize="sm" fontWeight="medium">
            <Trans>Impersoniranje: Ste prijavljeni kot</Trans>{" "}
            <Text as="span" fontWeight="bold">
              {impersonatedUser || "Uporabnik"}
            </Text>
            {originalAdmin && (
              <>
                {" "}
                <Trans>(Admin:</Trans>{" "}
                <Text as="span" fontWeight="bold">
                  {originalAdmin}
                </Text>
                )
              </>
            )}
          </Text>
        </HStack>
        <Button
          size="xs"
          variant="solid"
          colorPalette="white"
          onClick={handleStopImpersonating}
          leftIcon={<Icon as={LuX} />}
        >
          <Trans>Prekini impersoniranje</Trans>
        </Button>
      </HStack>
    </Box>
  );
}

