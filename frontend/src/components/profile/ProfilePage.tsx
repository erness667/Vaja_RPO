"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
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

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarImageUrl || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        surname: user.surname || "",
        phoneNumber: user.phoneNumber || "",
      });
      setAvatarUrl(user.avatarImageUrl || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  const handleAvatarUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    if (avatarError) setAvatarError(null);
  }, [avatarError, setAvatarError]);

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
    const result = await updateAvatar({ avatarImageUrl: avatarUrl });
    if (result.success) {
      await refetch();
    }
  }, [avatarUrl, updateAvatar, refetch]);

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
        <Text>Loading profile...</Text>
      </PageShell>
    );
  }

  if (userError && !user) {
    return (
      <PageShell maxWidthClass="max-w-4xl">
        <Text color="red.500">{userError}</Text>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2} color={{ base: "gray.800", _dark: "gray.100" }}>
            User Profile
          </Heading>
          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
            Manage your profile information and account settings.
          </Text>
        </Box>

        {/* Avatar Section */}
        <Box>
          <Heading size="md" mb={4} color={{ base: "gray.700", _dark: "gray.300" }}>
            Avatar
          </Heading>
          <HStack gap={4} mb={4}>
            {user?.avatarImageUrl ? (
              <Box
                as="span"
                display="inline-block"
                width="64px"
                height="64px"
                borderRadius="full"
                overflow="hidden"
                borderWidth="2px"
                borderColor={{ base: "gray.200", _dark: "gray.600" }}
              >
                <Image
                  src={user.avatarImageUrl}
                  alt={getUserInitials()}
                  width={64}
                  height={64}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ) : (
              <Box
                as="span"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                width="64px"
                height="64px"
                borderRadius="full"
                bg={{ base: "blue.500", _dark: "blue.400" }}
                color="white"
                fontSize="lg"
                fontWeight="medium"
              >
                {getUserInitials()}
              </Box>
            )}
            <VStack align="start" gap={2} flex={1}>
              <form onSubmit={handleAvatarSubmit}>
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                      Avatar Image URL
                    </Field.Label>
                    <Input
                      id="avatarUrl"
                      name="avatarUrl"
                      type="url"
                      value={avatarUrl}
                      onChange={handleAvatarUrlChange}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={isUpdatingAvatar}
                    />
                  </Field.Root>
                  {avatarError && (
                    <Box
                      p={3}
                      borderRadius="md"
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
                    size="sm"
                    loading={isUpdatingAvatar}
                    loadingText="Updating..."
                    disabled={isUpdatingAvatar}
                  >
                    Update Avatar
                  </Button>
                </Stack>
              </form>
            </VStack>
          </HStack>
        </Box>

        <Box
          height="1px"
          bg={{ base: "gray.200", _dark: "gray.700" }}
          my={4}
        />

        {/* Profile Information Section */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="md" color={{ base: "gray.700", _dark: "gray.300" }}>
              Profile Information
            </Heading>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditingProfile) {
                  handleProfileCancel();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              disabled={isUpdatingProfile}
            >
              {isEditingProfile ? "Cancel" : "Edit"}
            </Button>
          </HStack>
          <form onSubmit={handleProfileSubmit}>
            <Stack gap={6}>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Email
                </Field.Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  bg={{ base: "gray.50", _dark: "gray.700" }}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                />
                <Field.HelperText color={{ base: "gray.500", _dark: "gray.400" }}>
                  Email cannot be changed
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Username
                </Field.Label>
                <Input
                  id="username"
                  type="text"
                  value={user?.username || ""}
                  disabled
                  bg={{ base: "gray.50", _dark: "gray.700" }}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                />
                <Field.HelperText color={{ base: "gray.500", _dark: "gray.400" }}>
                  Username cannot be changed
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Name
                </Field.Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your name"
                  disabled={!isEditingProfile || isUpdatingProfile}
                  bg={!isEditingProfile ? { base: "gray.50", _dark: "gray.700" } : undefined}
                  color={!isEditingProfile ? { base: "gray.500", _dark: "gray.400" } : undefined}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Surname
                </Field.Label>
                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  value={profileData.surname}
                  onChange={handleProfileChange}
                  placeholder="Enter your surname"
                  disabled={!isEditingProfile || isUpdatingProfile}
                  bg={!isEditingProfile ? { base: "gray.50", _dark: "gray.700" } : undefined}
                  color={!isEditingProfile ? { base: "gray.500", _dark: "gray.400" } : undefined}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Phone Number
                </Field.Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                  disabled={!isEditingProfile || isUpdatingProfile}
                  bg={!isEditingProfile ? { base: "gray.50", _dark: "gray.700" } : undefined}
                  color={!isEditingProfile ? { base: "gray.500", _dark: "gray.400" } : undefined}
                />
              </Field.Root>

              {profileError && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={{ base: "red.50", _dark: "red.900" }}
                  borderWidth="1px"
                  borderColor={{ base: "red.200", _dark: "red.700" }}
                  color={{ base: "red.800", _dark: "red.200" }}
                  fontSize="sm"
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
                  loadingText="Updating..."
                  disabled={isUpdatingProfile}
                >
                  Update Profile
                </Button>
              )}
            </Stack>
          </form>
        </Box>

        <Box
          height="1px"
          bg={{ base: "gray.200", _dark: "gray.700" }}
          my={4}
        />

        {/* Change Password Section */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="md" color={{ base: "gray.700", _dark: "gray.300" }}>
              Change Password
            </Heading>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditingPassword) {
                  handlePasswordCancel();
                } else {
                  setIsEditingPassword(true);
                }
              }}
              disabled={isChangingPassword}
            >
              {isEditingPassword ? "Cancel" : "Edit"}
            </Button>
          </HStack>
          <form onSubmit={handlePasswordSubmit}>
            <Stack gap={6}>
              <Field.Root required>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Current Password
                </Field.Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  disabled={!isEditingPassword || isChangingPassword}
                  bg={!isEditingPassword ? { base: "gray.50", _dark: "gray.700" } : undefined}
                  color={!isEditingPassword ? { base: "gray.500", _dark: "gray.400" } : undefined}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  New Password
                </Field.Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  disabled={!isEditingPassword || isChangingPassword}
                  bg={!isEditingPassword ? { base: "gray.50", _dark: "gray.700" } : undefined}
                  color={!isEditingPassword ? { base: "gray.500", _dark: "gray.400" } : undefined}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label fontSize="sm" fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  Confirm New Password
                </Field.Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  disabled={!isEditingPassword || isChangingPassword}
                  bg={!isEditingPassword ? { base: "gray.50", _dark: "gray.700" } : undefined}
                  color={!isEditingPassword ? { base: "gray.500", _dark: "gray.400" } : undefined}
                />
              </Field.Root>

              {passwordError && (
                <Box
                  p={4}
                  borderRadius="md"
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
                  loadingText="Changing..."
                  disabled={isChangingPassword}
                >
                  Change Password
                </Button>
              )}
            </Stack>
          </form>
        </Box>
      </VStack>
    </PageShell>
  );
}

