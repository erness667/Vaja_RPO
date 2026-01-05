'use client';

import { useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  Badge,
  Spinner,
  Image,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import {
  LuBuilding2,
  LuCheck,
  LuX,
  LuUser,
  LuShield,
} from "react-icons/lu";
import { usePendingDealershipInvitations } from "@/lib/hooks/usePendingDealershipInvitations";
import type { DealershipWorker } from "@/lib/hooks/useDealershipWorkers";

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  isProcessing,
}: {
  invitation: DealershipWorker;
  onAccept: (workerId: number) => void;
  onDecline: (workerId: number) => void;
  isProcessing: boolean;
}) {
  const isAdmin = invitation.role === "Admin";

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
    <Card.Root>
      <CardBody p={4}>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="start">
            <HStack gap={3} flex={1}>
              <Icon as={LuBuilding2} boxSize={6} color="blue.500" />
              <VStack align="start" gap={1} flex={1}>
                <HStack gap={2}>
                  <Heading size="sm" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {invitation.dealershipName}
                  </Heading>
                  {isAdmin && (
                    <Badge colorPalette="purple" size="sm">
                      <Trans>Admin</Trans>
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.400" }}>
                  <Trans>Povabil vam je {invitation.invitedByName}</Trans>
                </Text>
                <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.500" }}>
                  {formatDate(invitation.createdAt)}
                </Text>
              </VStack>
            </HStack>
          </HStack>

          <HStack gap={2} justify="flex-end" pt={2}>
            <Button
              variant="outline"
              colorPalette="red"
              onClick={() => onDecline(invitation.id)}
              disabled={isProcessing}
              size="sm"
            >
              <HStack gap={2}>
                <Icon as={LuX} />
                <Trans>Zavrni</Trans>
              </HStack>
            </Button>
            <Button
              colorPalette="green"
              onClick={() => onAccept(invitation.id)}
              disabled={isProcessing}
              size="sm"
            >
              <HStack gap={2}>
                <Icon as={LuCheck} />
                <Trans>Sprejmi</Trans>
              </HStack>
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}

export function DealershipInvitationsList() {
  const {
    invitations,
    isLoading,
    error,
    fetchInvitations,
    respondToInvitation,
    setError,
  } = usePendingDealershipInvitations();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleAccept = useCallback(async (workerId: number) => {
    setProcessingId(workerId);
    setError(null);
    
    const result = await respondToInvitation(workerId, true);
    
    if (result) {
      // Invitation is automatically removed from list by the hook
    }
    
    setProcessingId(null);
  }, [respondToInvitation, setError]);

  const handleDecline = useCallback(async (workerId: number) => {
    setProcessingId(workerId);
    setError(null);
    
    const result = await respondToInvitation(workerId, false);
    
    if (result) {
      // Invitation is automatically removed from list by the hook
    }
    
    setProcessingId(null);
  }, [respondToInvitation, setError]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Spinner size="lg" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
        <Text color="red.600">{error}</Text>
      </Box>
    );
  }

  if (invitations.length === 0) {
    return (
      <Box
        p={6}
        bg={{ base: "gray.50", _dark: "gray.800" }}
        borderRadius="md"
        borderWidth="1px"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        textAlign="center"
      >
        <Icon as={LuBuilding2} boxSize={8} color={{ base: "gray.400", _dark: "gray.500" }} mb={2} />
        <Text color={{ base: "gray.600", _dark: "gray.400" }}>
          <Trans>Nimate čakajočih povabil za prodajalnice.</Trans>
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
        <Trans>Povabila za prodajalnice</Trans>
      </Heading>
      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          onAccept={handleAccept}
          onDecline={handleDecline}
          isProcessing={processingId === invitation.id}
        />
      ))}
    </VStack>
  );
}

