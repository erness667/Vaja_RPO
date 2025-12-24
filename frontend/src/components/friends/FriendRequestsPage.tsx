"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Spinner,
  Text,
  Button,
  Icon,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { LuArrowLeft, LuUserX, LuUserPlus, LuUserMinus, LuX } from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useFriendRequests } from "@/lib/hooks/useFriendRequests";
import { useAcceptFriendRequest } from "@/lib/hooks/useAcceptFriendRequest";
import { useRejectFriendRequest } from "@/lib/hooks/useRejectFriendRequest";
import { useCancelFriendRequest } from "@/lib/hooks/useCancelFriendRequest";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useFriendHub } from "@/lib/hooks/useFriendHub";
import type { FriendRequest, Friend } from "@/lib/types/friend";
import { Trans, t } from "@lingui/macro";

function FriendRequestCard({
  request,
  currentUserId,
  onAction,
}: {
  request: FriendRequest;
  currentUserId: string;
  onAction: () => void;
}) {
  const { acceptFriendRequest, isLoading: isAccepting } = useAcceptFriendRequest();
  const { rejectFriendRequest, isLoading: isRejecting } = useRejectFriendRequest();
  const { cancelFriendRequest, isLoading: isCanceling } = useCancelFriendRequest();
  const [isProcessing, setIsProcessing] = useState(false);

  const isReceived = request.addresseeId === currentUserId;
  const otherUser = isReceived ? request.requester : request.addressee;
  const fullName = otherUser ? `${otherUser.name} ${otherUser.surname}` : "Unknown User";
  const username = otherUser?.username || "unknown";

  const handleAccept = async () => {
    setIsProcessing(true);
    const success = await acceptFriendRequest(request.id);
    if (success) {
      onAction();
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    const success = await rejectFriendRequest(request.id);
    if (success) {
      onAction();
    }
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    const success = await cancelFriendRequest(request.id);
    if (success) {
      onAction();
    }
    setIsProcessing(false);
  };

  const isLoading = isProcessing || isAccepting || isRejecting || isCanceling;

  return (
    <Card.Root
      borderRadius="lg"
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      _hover={{
        boxShadow: "md",
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <HStack gap={4} align="start">
          {/* Avatar */}
          <Box
            width="64px"
            height="64px"
            borderRadius="full"
            overflow="hidden"
            bg={{ base: "gray.200", _dark: "gray.700" }}
            flexShrink={0}
            position="relative"
            borderWidth="2px"
            borderColor={{ base: "gray.300", _dark: "gray.600" }}
            boxShadow="sm"
          >
            {otherUser?.avatarImageUrl ? (
              <Image
                src={otherUser.avatarImageUrl}
                alt={fullName}
                width={64}
                height={64}
                unoptimized
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <Box
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={{ base: "gray.300", _dark: "gray.600" }}
              >
                <Icon as={LuUserX} boxSize={7} color={{ base: "gray.500", _dark: "gray.400" }} />
              </Box>
            )}
          </Box>

          {/* User Info */}
          <VStack align="start" gap={1} flex={1} minWidth={0}>
            <HStack gap={2} align="center">
              <Text
                fontWeight="semibold"
                fontSize="lg"
                color={{ base: "gray.800", _dark: "gray.100" }}
                lineClamp={1}
              >
                {fullName}
              </Text>
              <Badge
                colorPalette={isReceived ? "blue" : "gray"}
                size="sm"
              >
                {isReceived ? <Trans>Prejeto</Trans> : <Trans>Poslano</Trans>}
              </Badge>
            </HStack>
            <Text
              fontSize="sm"
              color={{ base: "gray.600", _dark: "gray.400" }}
              lineClamp={1}
            >
              @{username}
            </Text>
          </VStack>
        </HStack>

        {/* Actions */}
        <HStack gap={2} mt={4} justify="flex-end">
          {isReceived ? (
            <>
              <Button
                size="sm"
                colorPalette="blue"
                onClick={handleAccept}
                loading={isLoading}
                disabled={isLoading}
              >
                <HStack gap={2}>
                  <Icon as={LuUserPlus} />
                  <Text><Trans>Sprejmi</Trans></Text>
                </HStack>
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={handleReject}
                loading={isLoading}
                disabled={isLoading}
              >
                <HStack gap={2}>
                  <Icon as={LuX} />
                  <Text><Trans>Zavrni</Trans></Text>
                </HStack>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              onClick={handleCancel}
              loading={isLoading}
              disabled={isLoading}
            >
              <HStack gap={2}>
                <Icon as={LuUserMinus} />
                <Text><Trans>Prekliči</Trans></Text>
              </HStack>
            </Button>
          )}
        </HStack>
      </CardBody>
    </Card.Root>
  );
}

export function FriendRequestsPage() {
  const { user } = useUserProfile();
  const { requests, isLoading, error, refetch } = useFriendRequests();
  const [requestsList, setRequestsList] = useState<FriendRequest[]>(requests);

  // Set up real-time friend updates
  useFriendHub(
    // Friend request received
    (request: FriendRequest) => {
      refetch();
    },
    // Friend request accepted
    () => {
      refetch();
    },
    // Friend request rejected
    () => {
      refetch();
    },
    // Friend request cancelled
    () => {
      refetch();
    },
    // Friend removed (not relevant for requests page)
    undefined
  );

  useEffect(() => {
    setRequestsList(requests);
  }, [requests]);

  const handleAction = () => {
    setTimeout(() => refetch(), 500);
  };

  const receivedRequests = requestsList.filter(
    (r) => r.addresseeId === user?.id
  );
  const sentRequests = requestsList.filter(
    (r) => r.requesterId === user?.id
  );

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="start" gap={2}>
          <HStack gap={4} align="center">
            <Link href="/friends">
              <Button
                variant="ghost"
                color={{ base: "gray.600", _dark: "gray.400" }}
              >
                <HStack gap={2}>
                  <Icon as={LuArrowLeft} />
                  <Text><Trans>Nazaj</Trans></Text>
                </HStack>
              </Button>
            </Link>
          </HStack>
          <Heading size="xl" color={{ base: "gray.800", _dark: "gray.100" }}>
            <Trans>Zahteve za prijateljstvo</Trans>
          </Heading>
        </VStack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <Spinner size="lg" color="blue.500" />
          </Box>
        ) : error ? (
          <Box
            p={4}
            borderRadius="lg"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }}>{error}</Text>
          </Box>
        ) : requestsList.length === 0 ? (
          <Box
            p={6}
            borderRadius="lg"
            bg={{ base: "gray.50", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            textAlign="center"
          >
            <Icon as={LuUserPlus} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
            <Text color={{ base: "gray.600", _dark: "gray.400" }} mb={3}>
              <Trans>Trenutno nimate nobenih zahtev za prijateljstvo.</Trans>
            </Text>
          </Box>
        ) : (
          <VStack gap={6} align="stretch">
            {/* Received Requests */}
            {receivedRequests.length > 0 && (
              <Box>
                <Heading size="md" mb={4} color={{ base: "gray.700", _dark: "gray.300" }}>
                  <Trans>Prejete zahteve</Trans> ({receivedRequests.length})
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
                  {receivedRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      currentUserId={user?.id || ""}
                      onAction={handleAction}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <Box>
                <Heading size="md" mb={4} color={{ base: "gray.700", _dark: "gray.300" }}>
                  <Trans>Poslane zahteve</Trans> ({sentRequests.length})
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
                  {sentRequests.map((request) => (
                    <FriendRequestCard
                      key={request.id}
                      request={request}
                      currentUserId={user?.id || ""}
                      onAction={handleAction}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </PageShell>
  );
}

