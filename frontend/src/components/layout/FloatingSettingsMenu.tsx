"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  IconButton,
  Icon,
  ClientOnly,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { t, Trans } from "@lingui/macro";
import {
  LuX,
  LuUsers,
  LuBuilding2,
  LuShield,
} from "react-icons/lu";
import { isAuthenticated, getStoredUser } from "@/lib/utils/auth-storage";

export function FloatingSettingsMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // Check authentication state and admin role
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(() => {
    if (typeof window === "undefined") return false;
    return isAuthenticated();
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser();
  });

  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!user || !isAuthenticatedState) return false;
    return user.role === 1; // 1 = Admin
  }, [user, isAuthenticatedState]);

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticatedState(isAuthenticated());
      setUser(getStoredUser());
    };
    
    window.addEventListener("authStateChanged", handleAuthChange);
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const handleAdminUsers = () => {
    router.push("/admin/users");
    setIsOpen(false);
  };

  const handleAdminDealerships = () => {
    router.push("/admin/dealerships");
    setIsOpen(false);
  };

  const menuItems = [
    // Admin features only
    {
      icon: LuUsers,
      onClick: handleAdminUsers,
      label: t`Upravljanje uporabnikov`,
      colorPalette: "blue",
    },
    {
      icon: LuBuilding2,
      onClick: handleAdminDealerships,
      label: t`Upravljanje avtohiš`,
      colorPalette: "blue",
    },
  ];

  return (
    <ClientOnly fallback={null}>
      <>
        {/* Fade overlay when menu is open - placed first so it's behind the menu */}
        {isOpen && (
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.300"
            zIndex={998}
            onClick={() => setIsOpen(false)}
            style={{
              animation: "fadeIn 0.2s ease",
            }}
          />
        )}

        {/* Menu Container */}
        <Box 
          position="fixed" 
          bottom={4} 
          right={4} 
          zIndex={1000}
        >
          <VStack gap={3} align="center">
            {/* Menu Items - shown when open */}
            {isOpen &&
              menuItems.map((item, index) => (
                <Box
                  key={index}
                  style={{
                    animation: `fadeInUp 0.3s ease ${index * 0.05}s backwards`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip
                    content={item.label}
                    positioning={{ placement: "left" }}
                  >
                    <IconButton
                      aria-label={item.label}
                      size="lg"
                      borderRadius="full"
                      boxShadow="xl"
                      bg={{ base: `${item.colorPalette}.500`, _dark: `${item.colorPalette}.600` }}
                      borderWidth="2px"
                      borderColor={{ base: `${item.colorPalette}.600`, _dark: `${item.colorPalette}.700` }}
                      color="white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (item.onClick) {
                          item.onClick();
                        }
                      }}
                      _hover={{
                        bg: { base: `${item.colorPalette}.600`, _dark: `${item.colorPalette}.700` },
                        transform: "scale(1.1)",
                      }}
                      transition="all 0.2s"
                    >
                      <Icon as={item.icon} boxSize={6} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}

            {/* Main Toggle Button */}
            <IconButton
              aria-label={isOpen ? t`Zapri` : t`Odpri`}
              size="xl"
              borderRadius="full"
              boxShadow="2xl"
              bg={{ base: "blue.600", _dark: "blue.500" }}
              color="white"
              borderWidth="3px"
              borderColor={{ base: "blue.700", _dark: "blue.600" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              _hover={{
                bg: { base: "blue.700", _dark: "blue.600" },
                transform: "scale(1.07)",
              }}
              transition="all 0.2s"
              width="64px"
              height="64px"
              minWidth="64px"
              minHeight="64px"
              padding={0}
            >
              <Icon
                as={isOpen ? LuX : LuShield}
                boxSize={7}
              />
            </IconButton>
          </VStack>
        </Box>

        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </>
    </ClientOnly>
  );
}

