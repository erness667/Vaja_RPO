'use client';

import { useState, useCallback, useEffect } from "react";
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
} from "react-icons/lu";
import { useUserDealership } from "@/lib/hooks/useUserDealership";
import { useDealershipWorkers, type DealershipWorker } from "@/lib/hooks/useDealershipWorkers";
import { useSearchUsers } from "@/lib/hooks/useSearchUsers";
import { getStoredUser } from "@/lib/utils/auth-storage";
import type { UserInfo } from "@/lib/types/friend";

function WorkerCard({
  worker,
  isOwner,
  currentUserId,
  onPromote,
  onRemove,
  isProcessing,
}: {
  worker: DealershipWorker;
  isOwner: boolean;
  currentUserId: string;
  onPromote: (workerId: number) => void;
  onRemove: (workerId: number) => void;
  isProcessing: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isAdmin = worker.role === "Admin";
  const isPending = worker.status === "Pending";
  const isActive = worker.status === "Active";
  const canManage = isOwner && isActive;

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
                  {!isAdmin && (
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
                  <MenuItem
                    value="remove"
                    onClick={() => onRemove(worker.id)}
                    disabled={isProcessing}
                    colorPalette="red"
                  >
                    <HStack gap={2}>
                      <Icon as={LuX} boxSize={4} />
                      <Trans>Odstrani</Trans>
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
    setError,
  } = useDealershipWorkers(dealership?.id ?? null);
  const { users: searchResults, isLoading: isSearching, searchUsers, clearResults } = useSearchUsers();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [inviteRole, setInviteRole] = useState<"Worker" | "Admin">("Worker");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch workers when dealership is available
  useEffect(() => {
    if (dealership?.id) {
      fetchWorkers();
    }
  }, [dealership?.id, fetchWorkers]);

  // Handle search with debouncing
  useEffect(() => {
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
  }, [searchInput, searchUsers, clearResults]);

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

  const handleRemove = useCallback(async (workerId: number) => {
    if (!confirm(t`Ali ste prepričani, da želite odstraniti tega delavca?`)) {
      return;
    }

    setProcessingId(workerId);
    const result = await removeWorker(workerId);
    setProcessingId(null);

    if (result) {
      await fetchWorkers();
    }
  }, [removeWorker, fetchWorkers]);

  const isOwner = dealership && currentUser?.id === dealership.ownerId;

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
              <Trans>Ni prodajalnice</Trans>
            </Heading>
            <Text color={{ base: "gray.600", _dark: "gray.400" }} textAlign="center">
              <Trans>
                Nimate odobrene prodajalnice. Prosimo, zahtevajte prodajalnico in počakajte na odobritev.
              </Trans>
            </Text>
            <Button
              colorPalette="blue"
              onClick={() => router.push("/dealerships/create")}
            >
              <Trans>Zahtevaj prodajalnico</Trans>
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  const activeWorkers = workers.filter(w => w.status === "Active");
  const pendingWorkers = workers.filter(w => w.status === "Pending");

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
                <Badge colorPalette="green" size="lg">
                  <Trans>Odobreno</Trans>
                </Badge>
              </VStack>
              {isOwner && (
                <Button
                  colorPalette="blue"
                  leftIcon={<Icon as={LuUserPlus} />}
                  onClick={() => setShowInviteModal(true)}
                >
                  <Trans>Dodaj delavca</Trans>
                </Button>
              )}
            </HStack>

            {/* Dealership Info */}
            <Card.Root>
              <CardBody p={4}>
                <VStack align="stretch" gap={3}>
                  <HStack gap={3}>
                    <Icon as={LuMapPin} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                      {dealership.address}, {dealership.city}
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

          {/* Workers Section */}
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack gap={2}>
                <Icon as={LuUsers} boxSize={5} color={{ base: "gray.700", _dark: "gray.300" }} />
                <Heading size="md" color={{ base: "gray.900", _dark: "gray.100" }}>
                  <Trans>Delavci</Trans>
                </Heading>
                <Badge colorPalette="blue" size="sm">
                  {activeWorkers.length}
                </Badge>
              </HStack>
            </HStack>

            {isLoadingWorkers ? (
              <Box display="flex" justifyContent="center" py={8}>
                <Spinner size="lg" color="blue.500" />
              </Box>
            ) : workers.length === 0 ? (
              <Card.Root>
                <CardBody p={8}>
                  <VStack gap={4}>
                    <Icon as={LuUsers} boxSize={12} color={{ base: "gray.400", _dark: "gray.500" }} />
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                      <Trans>Ni delavcev</Trans>
                    </Text>
                  </VStack>
                </CardBody>
              </Card.Root>
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
                    isOwner={isOwner}
                    currentUserId={currentUser?.id || ""}
                    onPromote={handlePromote}
                    onRemove={handleRemove}
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
    </Box>
  );
}

