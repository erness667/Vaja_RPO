"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  VStack,
  IconButton,
  Icon,
  ClientOnly,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { t, Trans } from "@lingui/macro";
import {
  LuMenu,
  LuX,
  LuHeart,
  LuGitCompare,
  LuLanguages,
} from "react-icons/lu";
import { HiSun, HiMoon, HiPlus } from "react-icons/hi";
import { useColorMode } from "@/components/ui/color-mode";
import { isAuthenticated } from "@/lib/utils/auth-storage";
import { useAppLocale } from "@/components/i18n/LinguiProvider";
import Image from "next/image";

const LanguageFlag = ({ variant }: { variant: "sl" | "en" }) => {
  const countryCode = variant === "sl" ? "SI" : "GB";
  return (
    <Image
      src={`https://flagsapi.com/${countryCode}/flat/24.png`}
      alt={variant === "sl" ? "Slovenian flag" : "English flag"}
      width={22}
      height={20}
      unoptimized
      style={{ borderRadius: "2px" }}
    />
  );
};

export function FloatingSettingsMenu() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { locale, setLocale } = useAppLocale();
  const [isOpen, setIsOpen] = useState(false);
  
  // Check authentication state
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(() => {
    if (typeof window === "undefined") return false;
    return isAuthenticated();
  });

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticatedState(isAuthenticated());
    };
    
    window.addEventListener("authStateChanged", handleAuthChange);
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  const handleThemeToggle = () => {
    toggleColorMode();
    setIsOpen(false);
  };

  const handleFavourites = () => {
    router.push("/favourites");
    setIsOpen(false);
  };

  const handleCompare = () => {
    router.push("/compare");
    setIsOpen(false);
  };

  const handleCreatePost = () => {
    router.push("/create");
    setIsOpen(false);
  };

  const handleLanguageChange = (newLocale: "sl" | "en") => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const menuItems = [
    ...(isAuthenticatedState
      ? [
          {
            icon: HiPlus,
            onClick: handleCreatePost,
            label: t`Objavi oglas`,
            colorPalette: "blue",
            isMenu: false,
          },
        ]
      : []),
    {
      icon: isDark ? HiSun : HiMoon,
      onClick: handleThemeToggle,
      label: isDark ? t`Svetel način` : t`Temen način`,
      colorPalette: "purple",
      isMenu: false,
    },
    {
      icon: LuLanguages,
      colorPalette: "teal",
      label: t`Jezik`,
      isMenu: true,
    },
    ...(isAuthenticatedState
      ? [
          {
            icon: LuHeart,
            onClick: handleFavourites,
            label: t`Priljubljene`,
            colorPalette: "pink",
            isMenu: false,
          },
        ]
      : []),
    {
      icon: LuGitCompare,
      onClick: handleCompare,
      label: t`Primerjava`,
      colorPalette: "orange",
      isMenu: false,
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
                  {item.isMenu ? (
                    <MenuRoot
                      positioning={{ placement: "left-start", offset: { mainAxis: 12 } }}
                    >
                      <MenuTrigger asChild>
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
                            e.stopPropagation();
                          }}
                          _hover={{
                            bg: { base: `${item.colorPalette}.600`, _dark: `${item.colorPalette}.700` },
                            transform: "scale(1.1)",
                          }}
                          transition="all 0.2s"
                        >
                          <Icon as={item.icon} boxSize={6} />
                        </IconButton>
                      </MenuTrigger>
                      <MenuPositioner zIndex={1001}>
                        <MenuContent
                          bg={{ base: "white", _dark: "gray.800" }}
                          borderWidth="1px"
                          borderColor={{ base: "gray.200", _dark: "gray.700" }}
                          boxShadow="xl"
                          borderRadius="lg"
                          minW="180px"
                          py={1}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuItem
                            value="sl"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLanguageChange("sl");
                            }}
                            color={{ base: "gray.700", _dark: "gray.300" }}
                            _hover={{
                              bg: { base: "gray.50", _dark: "gray.700" },
                            }}
                          >
                            <HStack gap={2} w="full">
                              <LanguageFlag variant="sl" />
                              <Text fontWeight={locale === "sl" ? "semibold" : "normal"}>
                                <Trans>Slovenščina</Trans>
                              </Text>
                            </HStack>
                          </MenuItem>
                          <MenuItem
                            value="en"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLanguageChange("en");
                            }}
                            color={{ base: "gray.700", _dark: "gray.300" }}
                            _hover={{
                              bg: { base: "gray.50", _dark: "gray.700" },
                            }}
                          >
                            <HStack gap={2} w="full">
                              <LanguageFlag variant="en" />
                              <Text fontWeight={locale === "en" ? "semibold" : "normal"}>
                                <Trans>English</Trans>
                              </Text>
                            </HStack>
                          </MenuItem>
                        </MenuContent>
                      </MenuPositioner>
                    </MenuRoot>
                  ) : (
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
                  )}
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
                as={isOpen ? LuX : LuMenu}
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

