"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { HiCamera, HiX } from "react-icons/hi";
import { LuUser, LuLock, LuMail, LuPhone, LuPencil } from "react-icons/lu";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Field,
  Stack,
  HStack,
  IconButton,
  Icon,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { PageShell } from "@/components/layout/PageShell";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useUpdateProfile } from "@/lib/hooks/useUpdateProfile";
import { useChangePassword } from "@/lib/hooks/useChangePassword";
import { useUpdateAvatar } from "@/lib/hooks/useUpdateAvatar";
import "@/lib/api-client";

export function ProfilePage() {
  const { user, isLoading: isLoadingUser, error: userError, refetch } = useUserProfile();
  const { updateProfile, isLoading: isUpdatingProfile, error: profileError, setError: setProfileError } = useUpdateProfile();
  const { changePassword, isLoading: isChangingPassword, error: passwordError, setError: setPasswordError } = useChangePassword();
  const { updateAvatar, isLoading: isUpdatingAvatar, error: avatarError, setError: setAvatarError } = useUpdateAvatar();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        surname: user.surname || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileError) setProfileError(null);
  }, [profileError, setProfileError]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError(null);
  }, [passwordError, setPasswordError]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (avatarError) setAvatarError(null);
    }
  }, [avatarError, setAvatarError]);

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleProfileSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await updateProfile(profileData);
    if (result.success) {
      await refetch();
      setIsEditingProfile(false);
    }
  }, [profileData, updateProfile, refetch]);

  const handleProfileCancel = useCallback(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        surname: user.surname || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    setIsEditingProfile(false);
    setProfileError(null);
  }, [user, setProfileError]);

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditingPassword(false);
    }
  }, [passwordData, changePassword, setPasswordError]);

  const handlePasswordCancel = useCallback(() => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
    setPasswordError(null);
  }, [setPasswordError]);

  const handleAvatarSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setAvatarError("Please select a file.");
      return;
    }
    const result = await updateAvatar({ file: selectedFile });
    if (result.success) {
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await refetch();
    }
  }, [selectedFile, previewUrl, updateAvatar, refetch, setAvatarError]);

  const getUserInitials = () => {
    if (user?.name && user?.surname) {
      return `${user.name[0]}${user.surname[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (isLoadingUser) {
    return (
      <PageShell maxWidthClass="max-w-4xl">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>Loading profile...</Text>
          </VStack>
        </Box>
      </PageShell>
    );
  }

  if (userError && !user) {
    return (
      <PageShell maxWidthClass="max-w-4xl">
        <Box
          p={6}
          borderRadius="xl"
          bg={{ base: "red.50", _dark: "red.900" }}
          borderWidth="1px"
          borderColor={{ base: "red.200", _dark: "red.700" }}
        >
          <Text color={{ base: "red.800", _dark: "red.200" }} fontWeight="medium">
            {userError}
          </Text>
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2} color={{ base: "gray.800", _dark: "gray.100" }}>
            Moj profil
          </Heading>
          <Text fontSize="md" color={{ base: "gray.600", _dark: "gray.400" }}>
            Upravljajte svoje profilne informacije in nastavitve računa
          </Text>
        </Box>

        {/* Avatar Section */}
        <Card.Root
          borderRadius="xl"
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          bg={{ base: "white", _dark: "gray.800" }}
          boxShadow="sm"
        >
          <CardBody p={8}>
            <VStack gap={8} align="stretch">
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <Icon as={LuUser} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                  <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                    Profilna slika
                  </Heading>
                </HStack>
              </HStack>

              <VStack gap={6} align="center">
                {/* Avatar Display - Centered */}
                <Box position="relative" role="button" onClick={handleFileButtonClick} cursor="pointer">
                  {previewUrl ? (
                    <Box
                      width="160px"
                      height="160px"
                      borderRadius="full"
                      overflow="hidden"
                      borderWidth="4px"
                      borderColor={{ base: "blue.400", _dark: "blue.500" }}
                      position="relative"
                      boxShadow="xl"
                      transition="all 0.3s"
                      _hover={{
                        transform: "scale(1.05)",
                        borderColor: { base: "blue.500", _dark: "blue.400" },
                        boxShadow: "2xl",
                      }}
                    >
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={160}
                        height={160}
                        unoptimized
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Overlay on hover */}
                      <Box
                        position="absolute"
                        inset={0}
                        bg="blackAlpha.400"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        opacity={0}
                        _hover={{ opacity: 1 }}
                        transition="opacity 0.2s"
                        borderRadius="full"
                      >
                        <Box
                          bg="whiteAlpha.900"
                          borderRadius="full"
                          p={3}
                          boxShadow="lg"
                        >
                          <HiCamera style={{ width: "24px", height: "24px", color: "#2563eb" }} />
                        </Box>
                      </Box>
                    </Box>
                  ) : user?.avatarImageUrl ? (
                    <Box
                      width="160px"
                      height="160px"
                      borderRadius="full"
                      overflow="hidden"
                      borderWidth="4px"
                      borderColor={{ base: "blue.400", _dark: "blue.500" }}
                      position="relative"
                      boxShadow="xl"
                      transition="all 0.3s"
                      _hover={{
                        transform: "scale(1.05)",
                        borderColor: { base: "blue.500", _dark: "blue.400" },
                        boxShadow: "2xl",
                      }}
                    >
                      <Image
                        src={user.avatarImageUrl}
                        alt={getUserInitials()}
                        width={160}
                        height={160}
                        unoptimized
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={() => {
                          // Image will fallback to initials if it fails
                        }}
                      />
                      {/* Overlay on hover */}
                      <Box
                        position="absolute"
                        inset={0}
                        bg="blackAlpha.400"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        opacity={0}
                        _hover={{ opacity: 1 }}
                        transition="opacity 0.2s"
                        borderRadius="full"
                      >
                        <Box
                          bg="whiteAlpha.900"
                          borderRadius="full"
                          p={3}
                          boxShadow="lg"
                        >
                          <HiCamera style={{ width: "24px", height: "24px", color: "#2563eb" }} />
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      width="160px"
                      height="160px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bgGradient={{ base: "linear(to-br, blue.500, blue.600)", _dark: "linear(to-br, blue.400, blue.500)" }}
                      color="white"
                      fontSize="4xl"
                      fontWeight="bold"
                      boxShadow="xl"
                      borderWidth="4px"
                      borderColor={{ base: "blue.200", _dark: "blue.600" }}
                      transition="all 0.3s"
                      _hover={{
                        transform: "scale(1.05)",
                        borderColor: { base: "blue.400", _dark: "blue.500" },
                        boxShadow: "2xl",
                      }}
                    >
                      {getUserInitials()}
                    </Box>
                  )}
                </Box>

                {/* Upload Form - Centered below avatar */}
                {selectedFile && (
                  <VStack align="stretch" gap={4} maxW="400px" width="100%">
                    <form onSubmit={handleAvatarSubmit} style={{ width: "100%" }}>
                      <VStack gap={4} align="stretch">
                        <Input
                          ref={fileInputRef}
                          id="avatarFile"
                          name="avatarFile"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileChange}
                          disabled={isUpdatingAvatar}
                          display="none"
                        />
                        <Box p={4} borderRadius="lg" bg={{ base: "blue.50", _dark: "blue.900" }} borderWidth="1px" borderColor={{ base: "blue.200", _dark: "blue.700" }}>
                          <HStack justify="space-between" align="center">
                            <VStack align="start" gap={1} flex={1}>
                              <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }} noOfLines={1}>
                                {selectedFile.name}
                              </Text>
                              <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </Text>
                            </VStack>
                            <IconButton
                              type="button"
                              onClick={handleClearFile}
                              aria-label="Clear selected file"
                              size="sm"
                              borderRadius="full"
                              colorPalette="red"
                              variant="ghost"
                            >
                              <HiX style={{ width: "16px", height: "16px" }} />
                            </IconButton>
                          </HStack>
                        </Box>
                        {avatarError && (
                          <Box
                            p={4}
                            borderRadius="lg"
                            bg={{ base: "red.50", _dark: "red.900" }}
                            borderWidth="1px"
                            borderColor={{ base: "red.200", _dark: "red.700" }}
                            color={{ base: "red.800", _dark: "red.200" }}
                            fontSize="sm"
                          >
                            {avatarError}
                          </Box>
                        )}
                        <Button
                          type="submit"
                          colorPalette="blue"
                          size="lg"
                          width="full"
                          loading={isUpdatingAvatar}
                          loadingText="Posodabljanje..."
                          disabled={isUpdatingAvatar}
                          fontWeight="semibold"
                        >
                          Shrani profilno sliko
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                )}
                {!selectedFile && (
                  <Input
                    ref={fileInputRef}
                    id="avatarFile"
                    name="avatarFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    disabled={isUpdatingAvatar}
                    display="none"
                  />
                )}
                {avatarError && !selectedFile && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    bg={{ base: "red.50", _dark: "red.900" }}
                    borderWidth="1px"
                    borderColor={{ base: "red.200", _dark: "red.700" }}
                    color={{ base: "red.800", _dark: "red.200" }}
                    fontSize="sm"
                    maxW="400px"
                    width="100%"
                  >
                    {avatarError}
                  </Box>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card.Root>

        {/* Profile Information Section */}
        <Card.Root
          borderRadius="xl"
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          bg={{ base: "white", _dark: "gray.800" }}
          boxShadow="sm"
        >
          <CardBody p={6}>
            <VStack gap={6} align="stretch">
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <Icon as={LuPencil} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                  <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                    Profilne informacije
                  </Heading>
                </HStack>
                <Button
                  type="button"
                  variant={isEditingProfile ? "outline" : "solid"}
                  colorPalette="blue"
                  size="sm"
                  leftIcon={<LuPencil />}
                  onClick={() => {
                    if (isEditingProfile) {
                      handleProfileCancel();
                    } else {
                      setIsEditingProfile(true);
                    }
                  }}
                  disabled={isUpdatingProfile}
                >
                  {isEditingProfile ? "Prekliči" : "Uredi"}
                </Button>
              </HStack>
              <form onSubmit={handleProfileSubmit}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                  <Field.Root>
                    <HStack gap={2} mb={1}>
                      <Icon as={LuMail} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                      <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                        E-pošta
                      </Field.Label>
                    </HStack>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      bg={{ base: "gray.50", _dark: "gray.700" }}
                      color={{ base: "gray.500", _dark: "gray.400" }}
                    />
                    <Field.HelperText color={{ base: "gray.500", _dark: "gray.400" }}>
                      E-pošte ni mogoče spremeniti
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root>
                    <HStack gap={2} mb={1}>
                      <Icon as={LuUser} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                      <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                        Uporabniško ime
                      </Field.Label>
                    </HStack>
                    <Input
                      id="username"
                      type="text"
                      value={user?.username || ""}
                      disabled
                      bg={{ base: "gray.50", _dark: "gray.700" }}
                      color={{ base: "gray.500", _dark: "gray.400" }}
                    />
                    <Field.HelperText color={{ base: "gray.500", _dark: "gray.400" }}>
                      Uporabniškega imena ni mogoče spremeniti
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                      Ime
                    </Field.Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Vnesite vaše ime"
                      disabled={!isEditingProfile || isUpdatingProfile}
                      bg={!isEditingProfile ? { base: "gray.50", _dark: "gray.700" } : undefined}
                      color={!isEditingProfile ? { base: "gray.500", _dark: "gray.400" } : undefined}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                      Priimek
                    </Field.Label>
                    <Input
                      id="surname"
                      name="surname"
                      type="text"
                      value={profileData.surname}
                      onChange={handleProfileChange}
                      placeholder="Vnesite vaš priimek"
                      disabled={!isEditingProfile || isUpdatingProfile}
                      bg={!isEditingProfile ? { base: "gray.50", _dark: "gray.700" } : undefined}
                      color={!isEditingProfile ? { base: "gray.500", _dark: "gray.400" } : undefined}
                    />
                  </Field.Root>

                  <Field.Root gridColumn={{ base: "span 1", md: "span 2" }}>
                    <HStack gap={2} mb={1}>
                      <Icon as={LuPhone} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                      <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                        Telefonska številka
                      </Field.Label>
                    </HStack>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      placeholder="Vnesite vašo telefonsko številko"
                      disabled={!isEditingProfile || isUpdatingProfile}
                      bg={!isEditingProfile ? { base: "gray.50", _dark: "gray.700" } : undefined}
                      color={!isEditingProfile ? { base: "gray.500", _dark: "gray.400" } : undefined}
                    />
                  </Field.Root>

                  {profileError && (
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={{ base: "red.50", _dark: "red.900" }}
                      borderWidth="1px"
                      borderColor={{ base: "red.200", _dark: "red.700" }}
                      color={{ base: "red.800", _dark: "red.200" }}
                      fontSize="sm"
                      gridColumn={{ base: "span 1", md: "span 2" }}
                    >
                      {profileError}
                    </Box>
                  )}

                  {isEditingProfile && (
                    <Button
                      type="submit"
                      colorPalette="blue"
                      size="md"
                      width="full"
                      loading={isUpdatingProfile}
                      loadingText="Posodabljanje..."
                      disabled={isUpdatingProfile}
                      fontWeight="semibold"
                      gridColumn={{ base: "span 1", md: "span 2" }}
                    >
                      Shrani spremembe
                    </Button>
                  )}
                </SimpleGrid>
              </form>
            </VStack>
          </CardBody>
          </Card.Root>

        {/* Change Password Section */}
        <Card.Root
          borderRadius="xl"
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          bg={{ base: "white", _dark: "gray.800" }}
          boxShadow="sm"
        >
          <CardBody p={6}>
            <VStack gap={6} align="stretch">
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <Icon as={LuLock} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                  <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                    Sprememba gesla
                  </Heading>
                </HStack>
                <Button
                  type="button"
                  variant={isEditingPassword ? "outline" : "solid"}
                  colorPalette="blue"
                  size="sm"
                  leftIcon={<LuPencil />}
                  onClick={() => {
                    if (isEditingPassword) {
                      handlePasswordCancel();
                    } else {
                      setIsEditingPassword(true);
                    }
                  }}
                  disabled={isChangingPassword}
                >
                  {isEditingPassword ? "Prekliči" : "Uredi"}
                </Button>
              </HStack>
              <form onSubmit={handlePasswordSubmit}>
                <VStack gap={5} align="stretch">
                  <Field.Root required>
                    <HStack gap={2} mb={1}>
                      <Icon as={LuLock} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                      <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                        Trenutno geslo
                      </Field.Label>
                    </HStack>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Vnesite vaše trenutno geslo"
                      disabled={!isEditingPassword || isChangingPassword}
                      bg={!isEditingPassword ? { base: "gray.50", _dark: "gray.700" } : undefined}
                      color={!isEditingPassword ? { base: "gray.500", _dark: "gray.400" } : undefined}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <HStack gap={2} mb={1}>
                      <Icon as={LuLock} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                      <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                        Novo geslo
                      </Field.Label>
                    </HStack>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Vnesite vaše novo geslo"
                      disabled={!isEditingPassword || isChangingPassword}
                      bg={!isEditingPassword ? { base: "gray.50", _dark: "gray.700" } : undefined}
                      color={!isEditingPassword ? { base: "gray.500", _dark: "gray.400" } : undefined}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <HStack gap={2} mb={1}>
                      <Icon as={LuLock} boxSize={4} color={{ base: "gray.500", _dark: "gray.400" }} />
                      <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                        Potrdite novo geslo
                      </Field.Label>
                    </HStack>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Potrdite vaše novo geslo"
                      disabled={!isEditingPassword || isChangingPassword}
                      bg={!isEditingPassword ? { base: "gray.50", _dark: "gray.700" } : undefined}
                      color={!isEditingPassword ? { base: "gray.500", _dark: "gray.400" } : undefined}
                    />
                  </Field.Root>

                  {passwordError && (
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg={{ base: "red.50", _dark: "red.900" }}
                      borderWidth="1px"
                      borderColor={{ base: "red.200", _dark: "red.700" }}
                      color={{ base: "red.800", _dark: "red.200" }}
                      fontSize="sm"
                    >
                      {passwordError}
                    </Box>
                  )}

                  {isEditingPassword && (
                    <Button
                      type="submit"
                      colorPalette="blue"
                      size="md"
                      width="full"
                      loading={isChangingPassword}
                      loadingText="Spreminjanje..."
                      disabled={isChangingPassword}
                      fontWeight="semibold"
                    >
                      Spremeni geslo
                    </Button>
                  )}
                </VStack>
              </form>
            </VStack>
          </CardBody>
          </Card.Root>
      </VStack>
    </PageShell>
  );
}

