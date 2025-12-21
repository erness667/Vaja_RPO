'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Icon,
  Spinner,
  Badge,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  Portal,
  Card,
  CardBody,
  Select,
  useListCollection,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import {
  LuSearch,
  LuSettings,
  LuPencil,
  LuTrash2,
  LuUser,
  LuX,
  LuCheck,
  LuShieldCheck,
  LuUpload,
  LuUserCheck,
} from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";
import { getStoredUser, isAuthenticated, storeAuthTokens, storeOriginalAdminTokens, getAccessToken, getRefreshToken } from "@/lib/utils/auth-storage";
import type { AdminUser } from "@/lib/hooks/useAdminUsers";
import { useRouter } from "next/navigation";

export function AdminUsersPage() {
  const router = useRouter();
  const {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    updateUserRole,
    updateUserProfile,
    updateUserAvatar,
    deleteUser,
    impersonateUser,
    setError,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    surname: string;
    phoneNumber: string;
    role: 0 | 1;
  } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Role options for Select
  const roleItems = [
    { value: "0", label: "Uporabnik" },
    { value: "1", label: "Admin" },
  ];
  const roleList = useListCollection({
    initialItems: roleItems,
    itemToString: (item) => item.label,
  });

  const currentUser = useMemo(() => getStoredUser(), []);
  const isLoggedIn = useMemo(() => isAuthenticated(), []);
  const isAdmin = useMemo(() => {
    if (!currentUser || !isLoggedIn) return false;
    return currentUser.role === 1; // 1 = Admin
  }, [currentUser, isLoggedIn]);

  // Redirect if not admin (client-side check)
  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      // Will be handled by ProtectedRoute, but this is a safety check
      window.location.href = '/';
    }
  }, [isLoggedIn, isAdmin]);

  // Fetch users when component mounts or page/search changes
  useEffect(() => {
    if (isAdmin) {
      fetchUsers({ page: currentPage, pageSize: 20, search: searchQuery || undefined });
    }
  }, [currentPage, searchQuery, isAdmin, fetchUsers]);

  // Cleanup avatar preview URL on unmount or when changing
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Neveljavna vrsta datoteke. Dovoljene vrste: JPG, JPEG, PNG, GIF, WEBP.");
      return;
    }

    // Validate file size (max 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      setError("Velikost datoteke presega omejitev 5MB.");
      return;
    }

    setAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
  }, [setError]);

  const handleStartEdit = useCallback((user: AdminUser) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      surname: user.surname,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingUserId(null);
    setEditFormData(null);
    setError(null);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  }, [setError]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingUserId || !editFormData) return;

    const user = users.find(u => u.id === editingUserId);
    if (!user) return;

    // Upload avatar if changed
    if (avatarFile) {
      await updateUserAvatar(editingUserId, avatarFile);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    }

    // Update role if changed
    if (editFormData.role !== user.role) {
      await updateUserRole(editingUserId, editFormData.role);
    }

    // Update profile if any field changed
    const profileChanged = 
      editFormData.name !== user.name ||
      editFormData.surname !== user.surname ||
      editFormData.phoneNumber !== user.phoneNumber;

    if (profileChanged) {
      await updateUserProfile(editingUserId, {
        name: editFormData.name,
        surname: editFormData.surname,
        phoneNumber: editFormData.phoneNumber,
      });
    }

    setEditingUserId(null);
    setEditFormData(null);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
    // Refresh users list
    fetchUsers({ page: currentPage, pageSize: 20, search: searchQuery || undefined });
  }, [editingUserId, editFormData, users, avatarFile, avatarPreview, updateUserAvatar, updateUserRole, updateUserProfile, currentPage, searchQuery, fetchUsers]);

  const handleDelete = useCallback(async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setDeletingUserId(null);
      // Refresh users list
      fetchUsers({ page: currentPage, pageSize: 20, search: searchQuery || undefined });
    }
  }, [deleteUser, currentPage, searchQuery, fetchUsers]);

  const handleImpersonate = useCallback(async (userId: string) => {
    // Store current admin tokens before impersonating
    const currentUser = getStoredUser();
    const currentAccessToken = getAccessToken();
    const currentRefreshToken = getRefreshToken();
    const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
    const refreshTokenExpiresAt = localStorage.getItem('refreshTokenExpiresAt');
    
    if (currentUser && currentAccessToken && currentRefreshToken && tokenExpiresAt && refreshTokenExpiresAt) {
      storeOriginalAdminTokens({
        accessToken: currentAccessToken,
        refreshToken: currentRefreshToken,
        expiresAt: tokenExpiresAt,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
        user: currentUser,
      });
    }
    
    const result = await impersonateUser(userId);
    if (result) {
      // Store the new auth tokens
      storeAuthTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
        refreshTokenExpiresAt: result.refreshTokenExpiresAt,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          name: result.user.name,
          surname: result.user.surname,
          phoneNumber: result.user.phoneNumber,
          avatarImageUrl: result.user.avatarImageUrl || undefined,
          role: result.user.role,
        },
      });
      // Redirect to home page
      router.push("/");
    }
  }, [impersonateUser, router]);


  if (!isAdmin) {
    return (
      <PageShell>
        <VStack gap={4} align="center" justify="center" minH="50vh">
          <Heading size="lg" color={{ base: "red.600", _dark: "red.400" }}>
            <Trans>Dostop zavrnjen</Trans>
          </Heading>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            <Trans>Nimate pravic za dostop do te strani.</Trans>
          </Text>
        </VStack>
      </PageShell>
    );
  }

  return (
    <Box
      suppressHydrationWarning
      py={8}
      px={4}
      bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
      minH="calc(100vh - 5rem)"
    >
      <Box
        suppressHydrationWarning
        maxW="95%"
        mx="auto"
        rounded="2xl"
        bg={{ base: "white", _dark: "gray.800" }}
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        boxShadow="2xl"
        p={8}
      >
        <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="stretch" gap={3}>
          <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
            <Trans>Upravljanje uporabnikov</Trans>
          </Heading>
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            <Trans>Upravljajte uporabnike sistema, spreminjajte vloge in podatke.</Trans>
          </Text>
        </VStack>

        {/* Search */}
        <Box>
          <HStack gap={3}>
            <Input
              placeholder={t`Išči uporabnike...`}
              value={searchQuery}
              onChange={handleSearch}
              bg={{ base: "white", _dark: "gray.800" }}
              borderColor={{ base: "gray.200", _dark: "gray.600" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
              maxW="400px"
            />
            <Icon as={LuSearch} boxSize={5} color={{ base: "gray.400", _dark: "gray.500" }} />
          </HStack>
        </Box>

        {/* Error Message */}
        {error && (
          <Box
            p={4}
            borderRadius="lg"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
          </Box>
        )}

        {/* Users Table */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : users.length === 0 ? (
          <Card.Root>
            <CardBody p={8}>
              <VStack gap={4}>
                <Icon as={LuUser} boxSize={12} color={{ base: "gray.400", _dark: "gray.500" }} />
                <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                  <Trans>Ni najdenih uporabnikov.</Trans>
                </Text>
              </VStack>
            </CardBody>
          </Card.Root>
        ) : (
          <Box overflowX="auto" width="100%">
            <Table.Root width="100%">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader><Trans>Uporabnik</Trans></Table.ColumnHeader>
                  <Table.ColumnHeader><Trans>Email</Trans></Table.ColumnHeader>
                  <Table.ColumnHeader><Trans>Uporabniško ime</Trans></Table.ColumnHeader>
                  <Table.ColumnHeader><Trans>Telefon</Trans></Table.ColumnHeader>
                  <Table.ColumnHeader><Trans>Vloga</Trans></Table.ColumnHeader>
                  <Table.ColumnHeader width="80px"></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <HStack gap={3}>
                          {/* Avatar Preview/Upload */}
                          <VStack gap={1} align="center">
                            <Box position="relative">
                              {avatarPreview ? (
                                <Box
                                  width="50px"
                                  height="50px"
                                  borderRadius="full"
                                  overflow="hidden"
                                  borderWidth="2px"
                                  borderColor={{ base: "blue.500", _dark: "blue.400" }}
                                >
                                  <Image
                                    src={avatarPreview}
                                    alt="Preview"
                                    width={50}
                                    height={50}
                                    unoptimized
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </Box>
                              ) : user.avatarImageUrl ? (
                                <Box
                                  width="50px"
                                  height="50px"
                                  borderRadius="full"
                                  overflow="hidden"
                                  borderWidth="2px"
                                  borderColor={{ base: "gray.200", _dark: "gray.600" }}
                                >
                                  <Image
                                    src={user.avatarImageUrl}
                                    alt={`${user.name} ${user.surname}`}
                                    width={50}
                                    height={50}
                                    unoptimized
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Box
                                  width="50px"
                                  height="50px"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  bg={{ base: "blue.500", _dark: "blue.600" }}
                                  color="white"
                                  fontSize="sm"
                                  fontWeight="bold"
                                >
                                  {editFormData?.name?.[0] || "U"}{editFormData?.surname?.[0] || ""}
                                </Box>
                              )}
                            </Box>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => avatarInputRef.current?.click()}
                            >
                              <HStack gap={1}>
                                <Icon as={LuUpload} />
                                <Text fontSize="xs"><Trans>Spremeni</Trans></Text>
                              </HStack>
                            </Button>
                            <input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={handleAvatarChange}
                              style={{ display: 'none' }}
                            />
                          </VStack>
                          <VStack gap={2} align="start">
                            <Input
                              size="sm"
                              value={editFormData?.name || ""}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
                              placeholder={t`Ime`}
                              maxW="150px"
                            />
                            <Input
                              size="sm"
                              value={editFormData?.surname || ""}
                              onChange={(e) => setEditFormData(prev => prev ? { ...prev, surname: e.target.value } : null)}
                              placeholder={t`Priimek`}
                              maxW="150px"
                            />
                          </VStack>
                        </HStack>
                      ) : (
                        <HStack gap={3}>
                          {user.avatarImageUrl ? (
                            <Box
                              width="40px"
                              height="40px"
                              borderRadius="full"
                              overflow="hidden"
                              flexShrink={0}
                            >
                              <Image
                                src={user.avatarImageUrl}
                                alt={`${user.name} ${user.surname}`}
                                width={40}
                                height={40}
                                unoptimized
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              width="40px"
                              height="40px"
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              bg={{ base: "blue.500", _dark: "blue.600" }}
                              color="white"
                              fontSize="sm"
                              fontWeight="bold"
                              flexShrink={0}
                            >
                              {user.name?.[0] || "U"}{user.surname?.[0] || ""}
                            </Box>
                          )}
                          <VStack align="start" gap={0}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {user.name} {user.surname}
                            </Text>
                          </VStack>
                        </HStack>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                        {user.email}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                        {user.username}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <Input
                          size="sm"
                          value={editFormData?.phoneNumber || ""}
                          onChange={(e) => setEditFormData(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                          placeholder={t`Telefon`}
                          maxW="150px"
                        />
                      ) : (
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                          {user.phoneNumber}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <Select.Root
                          collection={roleList.collection}
                          value={editFormData?.role !== undefined ? [String(editFormData.role)] : []}
                          onValueChange={(details) => setEditFormData(prev => prev ? { ...prev, role: Number(details.value[0]) as 0 | 1 } : null)}
                          size="sm"
                          width="120px"
                        >
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText />
                            </Select.Trigger>
                          </Select.Control>
                          <Select.Positioner>
                            <Select.Content>
                              {roleList.collection.items.map((item) => (
                                <Select.Item key={item.value} item={item}>
                                  <Select.ItemText>
                                    {item.value === "0" ? <Trans>Uporabnik</Trans> : <Trans>Admin</Trans>}
                                  </Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Select.Root>
                      ) : (
                        <Badge
                          colorPalette={user.role === 1 ? "blue" : "gray"}
                          variant="solid"
                          fontSize="sm"
                        >
                          {user.role === 1 ? (
                            <>
                              <Icon as={LuShieldCheck} mr={1} />
                              <Trans>Admin</Trans>
                            </>
                          ) : (
                            <>
                              <Icon as={LuUser} mr={1} />
                              <Trans>Uporabnik</Trans>
                            </>
                          )}
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <HStack gap={1}>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="green"
                            onClick={handleSaveEdit}
                          >
                            <Icon as={LuCheck} />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={handleCancelEdit}
                          >
                            <Icon as={LuX} />
                          </Button>
                        </HStack>
                      ) : (
                        <MenuRoot positioning={{ placement: "bottom-end", offset: { mainAxis: 4 } }}>
                          <MenuTrigger asChild>
                            <Button
                              size="xs"
                              variant="ghost"
                              aria-label={t`Menu opcij`}
                            >
                              <Icon as={LuSettings} />
                            </Button>
                          </MenuTrigger>
                          <MenuPositioner>
                            <MenuContent>
                              <MenuItem value="edit" onClick={() => handleStartEdit(user)}>
                                <Icon as={LuPencil} mr={2} />
                                <Trans>Uredi</Trans>
                              </MenuItem>
                              {currentUser?.id !== user.id && (
                                <>
                                  <MenuItem
                                    value="impersonate"
                                    onClick={() => handleImpersonate(user.id)}
                                  >
                                    <Icon as={LuUserCheck} mr={2} />
                                    <Trans>Impersoniraj</Trans>
                                  </MenuItem>
                                  <MenuItem
                                    value="delete"
                                    onClick={() => setDeletingUserId(user.id)}
                                    colorPalette="red"
                                  >
                                    <Icon as={LuTrash2} mr={2} />
                                    <Trans>Izbriši</Trans>
                                  </MenuItem>
                                </>
                              )}
                            </MenuContent>
                          </MenuPositioner>
                        </MenuRoot>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <HStack justify="center" gap={2}>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <Trans>Prejšnja</Trans>
            </Button>
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              <Trans>Stran {currentPage} od {pagination.totalPages}</Trans>
            </Text>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              <Trans>Naslednja</Trans>
            </Button>
          </HStack>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      {deletingUserId && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setDeletingUserId(null)}
          >
            <Card.Root
              maxW="md"
              w="full"
              mx={4}
              onClick={(e) => e.stopPropagation()}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                    <Trans>Potrditev brisanja</Trans>
                  </Heading>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>Ali ste prepričani, da želite izbrisati tega uporabnika? To dejanje ni mogoče razveljaviti.</Trans>
                  </Text>
                  <HStack justify="flex-end" gap={3}>
                    <Button
                      variant="outline"
                      onClick={() => setDeletingUserId(null)}
                    >
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={() => handleDelete(deletingUserId)}
                    >
                      <Icon as={LuTrash2} mr={2} />
                      <Trans>Izbriši</Trans>
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}
      </Box>
    </Box>
  );
}

