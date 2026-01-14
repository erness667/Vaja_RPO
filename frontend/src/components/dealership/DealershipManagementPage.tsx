'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Spinner,
  Badge,
  Card,
  CardBody,
  Input,
  IconButton,
  Portal,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  SimpleGrid,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import {
  LuBuilding2,
  LuUserPlus,
  LuUsers,
  LuUser,
  LuShield,
  LuX,
  LuCheck,
  LuMail,
  LuMapPin,
  LuPhone,
  LuGlobe,
  LuFileText,
  LuSearch,
  LuEllipsisVertical,
  LuLogOut,
  LuArrowRightLeft,
  LuPencil,
  LuTrash2,
  LuTrendingUp,
} from "react-icons/lu";
import { useUserDealership } from "@/lib/hooks/useUserDealership";
import { useDealershipWorkers, type DealershipWorker } from "@/lib/hooks/useDealershipWorkers";
import { useSearchUsers } from "@/lib/hooks/useSearchUsers";
import { useDeleteDealership } from "@/lib/hooks/useDeleteDealership";
import { getStoredUser } from "@/lib/utils/auth-storage";
import type { UserInfo } from "@/lib/types/friend";
import { DealershipMap } from "./DealershipMap";
import { DealershipManageMenu } from "./DealershipManageMenu";

function WorkerCard({
  worker,
  isOwner,
  currentUserId,
  onPromote,
  onDemote,
  onRemove,
  onTransferOwnership,
  isProcessing,
}: {
  worker: DealershipWorker;
  isOwner: boolean;
  currentUserId: string;
  onPromote: (workerId: number) => void;
  onDemote: (workerId: number) => void;
  onRemove: (workerId: number) => void;
  onTransferOwnership: (workerId: number) => void;
  isProcessing: boolean;
}) {
  const isAdmin = worker.role === "Admin";
  const isPending = worker.status === "Pending";
  const isActive = worker.status === "Active";
  const canManage = isOwner && (isActive || isPending);
  const isCurrentUser = worker.userId === currentUserId;

  return (
    <Card.Root>
      <CardBody p={4}>
        <HStack justify="space-between" align="start">
          <HStack gap={3} flex={1}>
            {worker.userAvatarImageUrl ? (
              <Image
                src={worker.userAvatarImageUrl}
                alt={`${worker.userName} ${worker.userSurname}`}
                width={48}
                height={48}
                style={{ borderRadius: "50%", objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <Box
                width="48px"
                height="48px"
                borderRadius="full"
                bg="blue.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="lg"
                fontWeight="bold"
              >
                {worker.userName[0]}{worker.userSurname[0]}
              </Box>
            )}
            <VStack align="start" gap={1} flex={1}>
              <HStack gap={2}>
                <Text fontWeight="medium" color={{ base: "gray.900", _dark: "gray.100" }}>
                  {worker.userName} {worker.userSurname}
                </Text>
                {isAdmin && (
                  <Badge colorPalette="purple" size="sm">
                    <Trans>Admin</Trans>
                  </Badge>
                )}
                {isPending && (
                  <Badge colorPalette="yellow" size="sm">
                    <Trans>V čakanju</Trans>
                  </Badge>
                )}
                {!isActive && !isPending && (
                  <Badge colorPalette="gray" size="sm">
                    <Trans>Neaktiven</Trans>
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                {worker.userEmail}
              </Text>
            </VStack>
          </HStack>
        
          {canManage && (
            <MenuRoot>
              <MenuTrigger asChild>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={t`Actions`}
                  disabled={isProcessing}
                >
                  <Icon as={LuEllipsisVertical} />
                </IconButton>
              </MenuTrigger>
              <MenuPositioner>
                <MenuContent>
                  {!isAdmin && isActive && (
                    <MenuItem
                      value="promote"
                      onClick={() => onPromote(worker.id)}
                      disabled={isProcessing}
                    >
                      <HStack gap={2}>
                        <Icon as={LuShield} boxSize={4} />
                        <Trans>Promoviraj v admina</Trans>
                      </HStack>
                    </MenuItem>
                  )}
                  {isAdmin && isActive && (
                    <MenuItem
                      value="demote"
                      onClick={() => onDemote(worker.id)}
                      disabled={isProcessing}
                    >
                      <HStack gap={2}>
                        <Icon as={LuUser} boxSize={4} />
                        <Trans>Odstrani admin pravice</Trans>
                      </HStack>
                    </MenuItem>
                  )}
                  {isOwner && isActive && (
                    <MenuItem
                      value="transfer"
                      onClick={() => onTransferOwnership(worker.id)}
                      disabled={isProcessing}
                      colorPalette="orange"
                    >
                      <HStack gap={2}>
                        <Icon as={LuArrowRightLeft} boxSize={4} />
                        <Trans>Prenesi lastništvo</Trans>
                      </HStack>
                    </MenuItem>
                  )}
                  <MenuItem
                    value="remove"
                    onClick={() => onRemove(worker.id)}
                    disabled={isProcessing}
                    colorPalette="red"
                  >
                    <HStack gap={2}>
                      <Icon as={LuX} boxSize={4} />
                      <Trans>{isPending ? t`Prekliči povabilo` : t`Odstrani`}</Trans>
                    </HStack>
                  </MenuItem>
                </MenuContent>
              </MenuPositioner>
            </MenuRoot>
          )}
        </HStack>
      </CardBody>
    </Card.Root>
  );
}

export function DealershipManagementPage() {
  const router = useRouter();
  const currentUser = getStoredUser();
  const { dealership, isLoading: isLoadingDealership, fetchUserDealership } = useUserDealership();
  const {
    workers,
    isLoading: isLoadingWorkers,
    error,
    fetchWorkers,
    inviteWorker,
    updateWorkerRole,
    removeWorker,
    transferOwnership,
    setError,
  } = useDealershipWorkers(dealership?.id ?? null);
  const { users: searchResults, isLoading: isSearching, searchUsers, clearResults } = useSearchUsers();
  const { deleteDealership, isLoading: isDeletingDealership, error: deleteError, setError: setDeleteError } = useDeleteDealership();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [inviteRole, setInviteRole] = useState<"Worker" | "Admin">("Worker");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [workerToRemove, setWorkerToRemove] = useState<DealershipWorker | null>(null);
  const [workerToTransferTo, setWorkerToTransferTo] = useState<DealershipWorker | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Fetch workers when dealership is available
  useEffect(() => {
    if (dealership?.id) {
      fetchWorkers();
    }
  }, [dealership?.id, fetchWorkers]);

  // Handle search with debouncing
  useEffect(() => {
    // Don't search if user is already selected and input matches their username
    if (selectedUser && searchInput === selectedUser.username) {
      setShowSuggestions(false);
      return;
    }

    if (searchInput.trim().length >= 2) {
      const timer = setTimeout(() => {
        searchUsers(searchInput.trim());
        setShowSuggestions(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearResults();
      setShowSuggestions(false);
    }
  }, [searchInput, selectedUser, searchUsers, clearResults]);

  const handleSelectUser = (user: UserInfo) => {
    setSelectedUser(user);
    setSearchInput(user.username);
    setShowSuggestions(false);
    clearResults();
  };

  const handleInvite = useCallback(async () => {
    if (!selectedUser || !dealership) return;

    setProcessingId(-1); // Use -1 for invite action
    const result = await inviteWorker(selectedUser.id, inviteRole);
    setProcessingId(null);

    if (result) {
      setShowInviteModal(false);
      setSelectedUser(null);
      setSearchInput("");
      clearResults();
      await fetchWorkers();
    }
  }, [selectedUser, dealership, inviteRole, inviteWorker, fetchWorkers, clearResults]);

  const handlePromote = useCallback(async (workerId: number) => {
    setProcessingId(workerId);
    const result = await updateWorkerRole(workerId, "Admin");
    setProcessingId(null);

    if (result) {
      await fetchWorkers();
    }
  }, [updateWorkerRole, fetchWorkers]);

  const handleDemote = useCallback(async (workerId: number) => {
    setProcessingId(workerId);
    const result = await updateWorkerRole(workerId, "Worker");
    setProcessingId(null);

    if (result) {
      await fetchWorkers();
    }
  }, [updateWorkerRole, fetchWorkers]);

  const handleRemoveClick = useCallback((workerId: number) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setWorkerToRemove(worker);
    }
  }, [workers]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!workerToRemove) return;

    setProcessingId(workerToRemove.id);
    const result = await removeWorker(workerToRemove.id);
    setProcessingId(null);
    setWorkerToRemove(null);

    if (result) {
      await fetchWorkers();
      // If the current user left the dealership, refetch their dealership status
      if (workerToRemove.userId === currentUser?.id) {
        await fetchUserDealership();
        // Redirect to home if user no longer has a dealership
        if (!dealership) {
          router.push("/");
        }
      }
    }
  }, [workerToRemove, removeWorker, fetchWorkers, fetchUserDealership, currentUser?.id, dealership, router]);

  const handleTransferOwnershipClick = useCallback((workerId: number) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setWorkerToTransferTo(worker);
    }
  }, [workers]);

  const handleTransferOwnershipConfirm = useCallback(async () => {
    if (!dealership || !workerToTransferTo) return;

    setProcessingId(workerToTransferTo.id);
    const result = await transferOwnership(workerToTransferTo.userId);
    setProcessingId(null);
    setWorkerToTransferTo(null);

    if (result) {
      // Refetch workers and dealership data
      await fetchWorkers();
      await fetchUserDealership();
      // After transfer, the current user is no longer the owner, so they can leave if they want
      // The page will update to show them as a worker or allow them to leave
    }
  }, [dealership, workerToTransferTo, transferOwnership, fetchWorkers, fetchUserDealership]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!dealership) return;

    const result = await deleteDealership(dealership.id);
    if (result) {
      // Redirect to home after successful deletion
      router.push("/");
    }
  }, [dealership, deleteDealership, router]);

  const isOwner = dealership && currentUser?.id === dealership.ownerId;
  const activeWorkers = workers.filter(w => w.status === "Active");
  const pendingWorkers = workers.filter(w => w.status === "Pending");
  const isDealershipAdmin = useMemo(() => {
    if (!dealership || !currentUser) return false;
    const currentUserWorker = workers.find(
      w => w.userId === currentUser.id && w.status === "Active" && w.role === "Admin"
    );
    return !!currentUserWorker;
  }, [dealership, currentUser, workers]);
  const canEdit = isOwner || isDealershipAdmin;
  // Check if user is alone (only owner, no active workers)
  const isAlone = useMemo(() => {
    if (!isOwner) return false;
    return activeWorkers.length === 0;
  }, [isOwner, activeWorkers.length]);
  // Total count includes owner (1) + active workers
  const totalMembersCount = 1 + activeWorkers.length;

  if (isLoadingDealership) {
    return (
      <Box
        suppressHydrationWarning
        py={8}
        px={4}
        bgGradient={{ base: "linear(to-br, gray.50, gray.100, gray.50)", _dark: "linear(to-br, gray.900, gray.950, gray.900)" }}
        minH="calc(100vh - 5rem)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (!dealership) {
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
          maxW="72rem"
          mx="auto"
          rounded="2xl"
          bg={{ base: "white", _dark: "gray.800" }}
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          boxShadow="2xl"
          p={8}
        >
          <VStack gap={4} align="center">
            <Icon as={LuBuilding2} boxSize={16} color={{ base: "gray.400", _dark: "gray.500" }} />
            <Heading size="lg" color={{ base: "gray.700", _dark: "gray.300" }}>
              <Trans>Ni avtohiše</Trans>
            </Heading>
            <Text color={{ base: "gray.600", _dark: "gray.400" }} textAlign="center">
              <Trans>
                Nimate odobrene avtohiše. Prosimo, zahtevajte avtohišo in počakajte na odobritev.
              </Trans>
            </Text>
            <Button
              colorPalette="blue"
              onClick={() => router.push("/dealerships/create")}
            >
              <Trans>Zahtevaj avtohišo</Trans>
            </Button>
          </VStack>
        </Box>
      </Box>
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
        maxW="72rem"
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
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={2}>
                <HStack gap={3}>
                  <Icon as={LuBuilding2} boxSize={8} color="blue.500" />
                  <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {dealership.name}
                  </Heading>
                </HStack>
                <HStack gap={3}>
                  <Badge colorPalette="green" size="lg">
                    <Trans>Odobreno</Trans>
                  </Badge>
                  <DealershipManageMenu />
                </HStack>
              </VStack>
              <HStack gap={2}>
                {canEdit && (
                  <Button
                    variant="outline"
                    colorPalette="blue"
                    onClick={() => router.push("/dealerships/edit")}
                  >
                    <HStack gap={2}>
                      <Icon as={LuPencil} />
                      <Trans>Uredi avtohišo</Trans>
                    </HStack>
                  </Button>
                )}
                {isAlone && (
                  <Button
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeletingDealership}
                  >
                    <HStack gap={2}>
                      <Icon as={LuTrash2} />
                      <Trans>Izbriši avtohišo</Trans>
                    </HStack>
                  </Button>
                )}
                {!isOwner && currentUser && (() => {
                  const currentUserWorker = workers.find(w => w.userId === currentUser.id && w.status === "Active");
                  return currentUserWorker ? (
                    <Button
                      variant="outline"
                      colorPalette="red"
                      onClick={() => handleRemoveClick(currentUserWorker.id)}
                      disabled={processingId === currentUserWorker.id}
                    >
                      <HStack gap={2}>
                        <Icon as={LuLogOut} />
                        <Trans>Zapusti avtohišo</Trans>
                      </HStack>
                    </Button>
                  ) : null;
                })()}
                {canEdit && (
                  <Button
                    colorPalette="blue"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <HStack gap={2}>
                      <Icon as={LuUserPlus} />
                      <Trans>Dodaj delavca</Trans>
                    </HStack>
                  </Button>
                )}
              </HStack>
            </HStack>

            {/* Dealership Info */}
            <Card.Root>
              <CardBody p={4}>
                <VStack align="stretch" gap={3}>
                  <HStack gap={3} justify="space-between">
                    <HStack gap={3} flex={1}>
                      <Icon as={LuMapPin} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                      <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                        {dealership.address}, {dealership.city}
                      </Text>
                    </HStack>
                    <Text
                      as="button"
                      fontSize="sm"
                      color="blue.500"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => setShowMap(!showMap)}
                      cursor="pointer"
                    >
                      {showMap ? <Trans>Skrij zemljevid</Trans> : <Trans>Prikaži zemljevid</Trans>}
                    </Text>
                  </HStack>
                  <HStack gap={3}>
                    <Icon as={LuPhone} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                      {dealership.phoneNumber}
                    </Text>
                  </HStack>
                  {dealership.email && (
                    <HStack gap={3}>
                      <Icon as={LuMail} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                      <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                        {dealership.email}
                      </Text>
                    </HStack>
                  )}
                  {dealership.website && (
                    <HStack gap={3}>
                      <Icon as={LuGlobe} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                      <Text
                        as="a"
                        href={dealership.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="blue.500"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {dealership.website}
                      </Text>
                    </HStack>
                  )}
                  {dealership.taxNumber && (
                    <HStack gap={3}>
                      <Icon as={LuFileText} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                      <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                        <Trans>Davčna številka:</Trans> {dealership.taxNumber}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card.Root>

            {/* Map Section */}
            {showMap && (
              <VStack align="stretch" gap={3}>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={{ base: "gray.700", _dark: "gray.300" }}
                >
                  <Trans>Lokacija na zemljevidu</Trans>
                </Text>

                <DealershipMap
                  key={`${dealership.id}-${dealership.latitude}-${dealership.longitude}`}
                  latitude={dealership.latitude ?? null}
                  longitude={dealership.longitude ?? null}
                  address={dealership.address && dealership.city ? `${dealership.address}, ${dealership.city}` : dealership.address}
                />
              </VStack>
            )}
          </VStack>

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
              <Button
                mt={2}
                size="sm"
                variant="ghost"
                onClick={() => setError(null)}
              >
                <Trans>Zapri</Trans>
              </Button>
            </Box>
          )}

          {/* Delete Error Message */}
          {deleteError && (
            <Box
              p={4}
              borderRadius="lg"
              bg={{ base: "red.50", _dark: "red.900" }}
              borderWidth="1px"
              borderColor={{ base: "red.200", _dark: "red.700" }}
            >
              <Text color={{ base: "red.800", _dark: "red.200" }}>{deleteError}</Text>
              <Button
                mt={2}
                size="sm"
                variant="ghost"
                onClick={() => setDeleteError(null)}
              >
                <Trans>Zapri</Trans>
              </Button>
            </Box>
          )}

          {/* Workers Section */}
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack gap={2}>
                <Icon as={LuUsers} boxSize={5} color={{ base: "gray.700", _dark: "gray.300" }} />
                <Heading size="md" color={{ base: "gray.900", _dark: "gray.100" }}>
                  <Trans>Delavci</Trans>
                </Heading>
                <Badge colorPalette="blue" size="sm">
                  {totalMembersCount}
                </Badge>
              </HStack>
              
            </HStack>

            {isLoadingWorkers ? (
              <Box display="flex" justifyContent="center" py={8}>
                <Spinner size="lg" color="blue.500" />
              </Box>
            ) : (
              <VStack gap={3} align="stretch">
                {/* Owner Card */}
                <Card.Root>
                  <CardBody p={4}>
                    <HStack gap={3}>
                      <Box
                        width="48px"
                        height="48px"
                        borderRadius="full"
                        bg="blue.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontSize="lg"
                        fontWeight="bold"
                      >
                        {dealership.ownerName[0]}{dealership.ownerSurname[0]}
                      </Box>
                      <VStack align="start" gap={1} flex={1}>
                        <HStack gap={2}>
                          <Text fontWeight="medium" color={{ base: "gray.900", _dark: "gray.100" }}>
                            {dealership.ownerName} {dealership.ownerSurname}
                          </Text>
                          <Badge colorPalette="blue" size="sm">
                            <Trans>Lastnik</Trans>
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card.Root>

                {/* Workers List */}
                {workers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    isOwner={!!isOwner}
                    currentUserId={currentUser?.id || ""}
                    onPromote={handlePromote}
                    onDemote={handleDemote}
                    onRemove={handleRemoveClick}
                    onTransferOwnership={handleTransferOwnershipClick}
                    isProcessing={processingId === worker.id}
                  />
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Invite Modal */}
      {showInviteModal && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => {
              setShowInviteModal(false);
              setSelectedUser(null);
              setSearchInput("");
              clearResults();
            }}
          >
            <Card.Root
              maxW="md"
              w="full"
              mx={4}
              onClick={(e) => e.stopPropagation()}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" align="center">
                    <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                      <Trans>Dodaj delavca</Trans>
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label={t`Close`}
                      onClick={() => {
                        setShowInviteModal(false);
                        setSelectedUser(null);
                        setSearchInput("");
                        clearResults();
                      }}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>

                  <Box position="relative">
                    <Input
                      placeholder={t`Išči uporabnika po uporabniškem imenu...`}
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setSelectedUser(null);
                      }}
                      pl={10}
                    />
                    <Icon
                      as={LuSearch}
                      position="absolute"
                      left={3}
                      top="50%"
                      transform="translateY(-50%)"
                      color={{ base: "gray.400", _dark: "gray.500" }}
                      boxSize={4}
                      pointerEvents="none"
                    />
                    {showSuggestions && searchResults.length > 0 && (
                      <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        mt={1}
                        bg={{ base: "white", _dark: "gray.800" }}
                        borderWidth="1px"
                        borderColor={{ base: "gray.200", _dark: "gray.700" }}
                        borderRadius="md"
                        boxShadow="lg"
                        maxH="200px"
                        overflowY="auto"
                        zIndex={10001}
                      >
                        {searchResults.map((user) => (
                          <Box
                            key={user.id}
                            p={3}
                            _hover={{ bg: { base: "gray.50", _dark: "gray.700" } }}
                            cursor="pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <Text fontWeight="medium">{user.username}</Text>
                            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                              {user.name} {user.surname}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {selectedUser && (
                    <Box
                      p={3}
                      bg={{ base: "gray.50", _dark: "gray.700" }}
                      borderRadius="md"
                    >
                      <HStack gap={3}>
                        {selectedUser.avatarImageUrl ? (
                          <Image
                            src={selectedUser.avatarImageUrl}
                            alt={selectedUser.username}
                            width={40}
                            height={40}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <Box
                            width="40px"
                            height="40px"
                            borderRadius="full"
                            bg="blue.500"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontSize="sm"
                            fontWeight="bold"
                          >
                            {selectedUser.name?.[0] || selectedUser.username[0]}
                            {selectedUser.surname?.[0] || selectedUser.username[1]}
                          </Box>
                        )}
                        <VStack align="start" gap={0} flex={1}>
                          <Text fontWeight="medium">{selectedUser.username}</Text>
                          <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                            {selectedUser.name} {selectedUser.surname}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}

                  <Box>
                    <Text mb={2} fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                      <Trans>Vloga</Trans>
                    </Text>
                    <HStack gap={2}>
                      <Button
                        flex={1}
                        variant={inviteRole === "Worker" ? "solid" : "outline"}
                        colorPalette={inviteRole === "Worker" ? "blue" : "gray"}
                        onClick={() => setInviteRole("Worker")}
                      >
                        <Trans>Delavec</Trans>
                      </Button>
                      <Button
                        flex={1}
                        variant={inviteRole === "Admin" ? "solid" : "outline"}
                        colorPalette={inviteRole === "Admin" ? "purple" : "gray"}
                        onClick={() => setInviteRole("Admin")}
                      >
                        <Trans>Admin</Trans>
                      </Button>
                    </HStack>
                  </Box>

                  <HStack gap={3} justify="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowInviteModal(false);
                        setSelectedUser(null);
                        setSearchInput("");
                        clearResults();
                      }}
                    >
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button
                      colorPalette="blue"
                      onClick={handleInvite}
                      disabled={!selectedUser || processingId === -1}
                      loading={processingId === -1}
                    >
                      <Trans>Pošlji povabilo</Trans>
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}

      {/* Remove Worker Confirmation Modal */}
      {workerToRemove && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setWorkerToRemove(null)}
          >
            <Card.Root
              maxW="md"
              w="full"
              mx={4}
              onClick={(e) => e.stopPropagation()}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" align="center">
                    <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                      {workerToRemove.status === "Pending" 
                        ? <Trans>Prekliči povabilo</Trans>
                        : workerToRemove.userId === currentUser?.id
                        ? <Trans>Zapusti avtohišo</Trans>
                        : <Trans>Odstrani delavca</Trans>}
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label={t`Close`}
                      onClick={() => setWorkerToRemove(null)}
                      disabled={processingId === workerToRemove.id}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    {workerToRemove.status === "Pending" ? (
                      <Trans>Ali ste prepričani, da želite preklicati povabilo za {workerToRemove.userName} {workerToRemove.userSurname}?</Trans>
                    ) : workerToRemove.userId === currentUser?.id ? (
                      <Trans>Ali ste prepričani, da želite zapustiti to avtohišo?</Trans>
                    ) : (
                      <Trans>Ali ste prepričani, da želite odstraniti tega delavca?</Trans>
                    )}
                  </Text>
                  <HStack gap={3} justify="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => setWorkerToRemove(null)}
                      disabled={processingId === workerToRemove.id}
                    >
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={handleRemoveConfirm}
                      disabled={processingId === workerToRemove.id}
                      loading={processingId === workerToRemove.id}
                    >
                      {workerToRemove.status === "Pending" 
                        ? <Trans>Prekliči povabilo</Trans>
                        : workerToRemove.userId === currentUser?.id
                        ? <Trans>Zapusti</Trans>
                        : <Trans>Odstrani</Trans>}
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}

      {/* Transfer Ownership Confirmation Modal */}
      {workerToTransferTo && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setWorkerToTransferTo(null)}
          >
            <Card.Root
              maxW="md"
              w="full"
              mx={4}
              onClick={(e) => e.stopPropagation()}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" align="center">
                    <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                      <Trans>Prenesi lastništvo</Trans>
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label={t`Close`}
                      onClick={() => setWorkerToTransferTo(null)}
                      disabled={processingId === workerToTransferTo.id}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>Ali ste prepričani, da želite prenesti lastništvo avtohiše na {workerToTransferTo.userName} {workerToTransferTo.userSurname}? Po prenosu ne boste več lastnik in boste lahko zapustili avtohišo.</Trans>
                  </Text>
                  <HStack gap={3} justify="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => setWorkerToTransferTo(null)}
                      disabled={processingId === workerToTransferTo.id}
                    >
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button
                      colorPalette="orange"
                      onClick={handleTransferOwnershipConfirm}
                      disabled={processingId === workerToTransferTo.id}
                      loading={processingId === workerToTransferTo.id}
                    >
                      <Trans>Prenesi lastništvo</Trans>
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <Card.Root
              maxW="md"
              w="full"
              mx={4}
              onClick={(e) => e.stopPropagation()}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" align="center">
                    <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                      <Trans>Izbriši avtohišo</Trans>
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label={t`Close`}
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeletingDealership}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>
                      Ali ste prepričani, da želite izbrisati to avtohišo? Ta akcija bo izbrisala vse objavljene avtomobile avtohiše in ne more biti razveljavljena.
                    </Trans>
                  </Text>
                  <HStack gap={3} justify="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeletingDealership}
                    >
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={handleDeleteConfirm}
                      disabled={isDeletingDealership}
                      loading={isDeletingDealership}
                    >
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
  );
}

