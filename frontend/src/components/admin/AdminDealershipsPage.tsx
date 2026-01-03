'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Textarea,
  Icon,
  Spinner,
  Badge,
  Card,
  CardBody,
  IconButton,
  Portal,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import {
  LuCheck,
  LuX,
  LuBuilding2,
  LuUser,
  LuMapPin,
  LuPhone,
  LuMail,
  LuGlobe,
  LuFileText,
  LuClock,
} from "react-icons/lu";
import { useAdminDealerships, type Dealership } from "@/lib/hooks/useAdminDealerships";
import { getStoredUser, isAuthenticated } from "@/lib/utils/auth-storage";

function DealershipCard({
  dealership,
  onApprove,
  onDecline,
  isProcessing,
}: {
  dealership: Dealership;
  onApprove: (id: number, notes?: string) => void;
  onDecline: (id: number, notes?: string) => void;
  isProcessing: boolean;
}) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [notes, setNotes] = useState('');

  const handleActionClick = useCallback((type: 'approve' | 'decline') => {
    setNotes('');
    if (type === 'approve') {
      setShowApproveModal(true);
    } else {
      setShowDeclineModal(true);
    }
  }, []);

  const handleConfirm = useCallback((type: 'approve' | 'decline') => {
    if (type === 'approve') {
      onApprove(dealership.id, notes || undefined);
      setShowApproveModal(false);
    } else {
      onDecline(dealership.id, notes || undefined);
      setShowDeclineModal(false);
    }
    setNotes('');
  }, [dealership.id, notes, onApprove, onDecline]);

  const handleCancel = useCallback((type: 'approve' | 'decline') => {
    if (type === 'approve') {
      setShowApproveModal(false);
    } else {
      setShowDeclineModal(false);
    }
    setNotes('');
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sl-SI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card.Root>
        <CardBody p={6}>
          <VStack gap={4} align="stretch">
            {/* Header */}
            <HStack justify="space-between" align="flex-start">
              <VStack align="flex-start" gap={1}>
                <HStack gap={2}>
                  <Icon as={LuBuilding2} boxSize={5} color="blue.500" />
                  <Heading size="md" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {dealership.name}
                  </Heading>
                </HStack>
                <Badge colorPalette="blue" size="sm">
                  <Trans>V čakanju</Trans>
                </Badge>
              </VStack>
            </HStack>

            {/* Owner Info */}
            <Box
              p={3}
              bg={{ base: "gray.50", _dark: "gray.700" }}
              borderRadius="md"
            >
              <HStack gap={2} mb={2}>
                <Icon as={LuUser} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                <Text fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                  {dealership.ownerName} {dealership.ownerSurname}
                </Text>
              </HStack>
            </Box>

            {/* Description */}
            {dealership.description && (
              <Box>
                <HStack gap={2} mb={2}>
                  <Icon as={LuFileText} boxSize={4} color={{ base: "gray.600", _dark: "gray.400" }} />
                  <Text fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                    <Trans>Opis</Trans>
                  </Text>
                </HStack>
                <Text color={{ base: "gray.600", _dark: "gray.400" }} pl={6}>
                  {dealership.description}
                </Text>
              </Box>
            )}

            {/* Contact Details */}
            <VStack gap={2} align="stretch">
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
            </VStack>

            {/* Created Date */}
            <HStack gap={2}>
              <Icon as={LuClock} boxSize={4} color={{ base: "gray.500", _dark: "gray.500" }} />
              <Text fontSize="sm" color={{ base: "gray.500", _dark: "gray.500" }}>
                <Trans>Ustvarjeno:</Trans> {formatDate(dealership.createdAt)}
              </Text>
            </HStack>

            {/* Action Buttons */}
            <HStack gap={3} pt={2}>
              <Button
                colorPalette="green"
                onClick={() => handleActionClick('approve')}
                disabled={isProcessing}
                leftIcon={<Icon as={LuCheck} />}
                flex={1}
              >
                <Trans>Odobri</Trans>
              </Button>
              <Button
                colorPalette="red"
                onClick={() => handleActionClick('decline')}
                disabled={isProcessing}
                leftIcon={<Icon as={LuX} />}
                flex={1}
              >
                <Trans>Zavrni</Trans>
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card.Root>

      {/* Approve Modal */}
      {showApproveModal && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => handleCancel('approve')}
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
                      <Trans>Odobri prodajalnico</Trans>
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label="Zapri"
                      onClick={() => handleCancel('approve')}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>Ali ste prepričani, da želite odobriti to prodajalnico?</Trans>
                  </Text>
                  <Box>
                    <Text mb={2} fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                      <Trans>Opombe (neobvezno)</Trans>
                    </Text>
                    <Textarea
                      placeholder={t`Dodajte opombe...`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </Box>
                  <HStack gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={() => handleCancel('approve')}>
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button colorPalette="green" onClick={() => handleConfirm('approve')}>
                      <Trans>Odobri</Trans>
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={10000}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => handleCancel('decline')}
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
                      <Trans>Zavrni prodajalnico</Trans>
                    </Heading>
                    <IconButton
                      variant="ghost"
                      aria-label="Zapri"
                      onClick={() => handleCancel('decline')}
                    >
                      <Icon as={LuX} />
                    </IconButton>
                  </HStack>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>Ali ste prepričani, da želite zavrniti to prodajalnico?</Trans>
                  </Text>
                  <Box>
                    <Text mb={2} fontWeight="medium" color={{ base: "gray.700", _dark: "gray.300" }}>
                      <Trans>Razlog zavrnitve (priporočeno)</Trans>
                    </Text>
                    <Textarea
                      placeholder={t`Dodajte razlog zavrnitve...`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </Box>
                  <HStack gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={() => handleCancel('decline')}>
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button colorPalette="red" onClick={() => handleConfirm('decline')}>
                      <Trans>Zavrni</Trans>
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card.Root>
          </Box>
        </Portal>
      )}
    </>
  );
}

export function AdminDealershipsPage() {
  const {
    dealerships,
    isLoading,
    error,
    fetchPendingDealerships,
    approveDealership,
    setError,
  } = useAdminDealerships();

  const [processingId, setProcessingId] = useState<number | null>(null);

  const currentUser = useMemo(() => getStoredUser(), []);
  const isLoggedIn = useMemo(() => isAuthenticated(), []);
  const isAdmin = useMemo(() => {
    if (!currentUser || !isLoggedIn) return false;
    return currentUser.role === 1; // 1 = Admin
  }, [currentUser, isLoggedIn]);

  // Fetch pending dealerships when component mounts
  useEffect(() => {
    if (isAdmin) {
      fetchPendingDealerships();
    }
  }, [isAdmin, fetchPendingDealerships]);

  // Redirect if not admin (client-side check)
  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      window.location.href = '/';
    }
  }, [isLoggedIn, isAdmin]);

  const handleApprove = useCallback(async (id: number, notes?: string) => {
    setProcessingId(id);
    setError(null);
    
    const result = await approveDealership(id, true, notes);
    
    if (result) {
      // Refresh the list
      await fetchPendingDealerships();
    }
    
    setProcessingId(null);
  }, [approveDealership, fetchPendingDealerships, setError]);

  const handleDecline = useCallback(async (id: number, notes?: string) => {
    setProcessingId(id);
    setError(null);
    
    const result = await approveDealership(id, false, notes);
    
    if (result) {
      // Refresh the list
      await fetchPendingDealerships();
    }
    
    setProcessingId(null);
  }, [approveDealership, fetchPendingDealerships, setError]);

  if (!isAdmin) {
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
          <VStack gap={4} align="center" justify="center" minH="50vh">
            <Heading size="lg" color={{ base: "red.600", _dark: "red.400" }}>
              <Trans>Dostop zavrnjen</Trans>
            </Heading>
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              <Trans>Nimate pravic za dostop do te strani.</Trans>
            </Text>
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
              <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                <Trans>Upravljanje zahtev za prodajalnice</Trans>
              </Heading>
              <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                <Trans>Preglejte in odobrite ali zavrnite zahteve za registracijo prodajalnic.</Trans>
              </Text>
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
              </Box>
            )}

            {/* Dealerships List */}
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <Spinner size="xl" color="blue.500" />
              </Box>
            ) : dealerships.length === 0 ? (
              <Card.Root>
                <CardBody p={8}>
                  <VStack gap={4}>
                    <Icon as={LuBuilding2} boxSize={12} color={{ base: "gray.400", _dark: "gray.500" }} />
                    <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                      <Trans>Ni zahtev za pregled.</Trans>
                    </Text>
                  </VStack>
                </CardBody>
              </Card.Root>
            ) : (
              <VStack gap={4} align="stretch">
                {dealerships.map((dealership) => (
                  <DealershipCard
                    key={dealership.id}
                    dealership={dealership}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    isProcessing={processingId === dealership.id}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </Box>
      </Box>
  );
}

