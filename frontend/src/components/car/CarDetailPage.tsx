"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Badge,
  Icon,
  Spinner,
  Card,
  CardBody,
  Textarea,
  Portal,
} from "@chakra-ui/react";
import { Trans, t } from "@lingui/macro";
import {
  LuGauge,
  LuFuel,
  LuSettings2,
  LuPalette,
  LuCalendar,
  LuUsers,
  LuArrowLeft,
  LuPhone,
  LuUser,
  LuMessageSquare,
  LuSend,
  LuTrash2,
  LuPencil,
  LuX,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuHeart,
  LuEye,
} from "react-icons/lu";
import { PageShell } from "@/components/layout/PageShell";
import { useCar } from "@/lib/hooks/useCar";
import { useComments } from "@/lib/hooks/useComments";
import { useFavourite } from "@/lib/hooks/useFavourite";
import { useDeleteCar } from "@/lib/hooks/useDeleteCar";
import { getStoredUser, isAuthenticated } from "@/lib/utils/auth-storage";
import type { Comment } from "@/lib/types/car";

interface CarDetailPageProps {
  carId: number | null;
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const router = useRouter();
  const { car, isLoading, error } = useCar(carId);
  const {
    comments,
    isLoading: isLoadingComments,
    error: commentsError,
    isSubmitting,
    createComment,
    updateComment,
    deleteComment,
  } = useComments(carId);

  const {
    isFavourite,
    isLoading: isFavouriteLoading,
    toggleFavourite,
  } = useFavourite(carId);

  const {
    deleteCar,
    isLoading: isDeletingCar,
    error: deleteCarError,
  } = useDeleteCar();

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Use useMemo to avoid setting state in useEffect
  const currentUser = useMemo(() => getStoredUser(), []);
  const isLoggedIn = useMemo(() => isAuthenticated(), []);

  // Helper to check if user is admin
  const isAdmin = useMemo(() => {
    if (!currentUser || !isLoggedIn) return false;
    return currentUser.role === 1; // 1 = Admin
  }, [currentUser, isLoggedIn]);

  // Helper to check if user is the car owner
  const isCarOwner = useMemo(() => {
    if (!currentUser || !isLoggedIn || !car) return false;
    const userId = currentUser.id?.toLowerCase();
    return userId === car.sellerId?.toLowerCase();
  }, [currentUser, isLoggedIn, car]);

  // Helper to check if user can edit/delete a comment
  // Admins can edit/delete any comment, or if user is comment author or car seller
  const canModifyComment = useCallback((commentUserId: string) => {
    if (!currentUser || !isLoggedIn) return false;
    if (isAdmin) return true; // Admins can modify any comment
    const userId = currentUser.id?.toLowerCase();
    // User can modify if they are the comment author or the car seller
    return userId === commentUserId?.toLowerCase() || userId === car?.sellerId?.toLowerCase();
  }, [currentUser, isLoggedIn, isAdmin, car?.sellerId]);

  // Helper to check if user can edit/delete a car
  // Admins can edit/delete any car, or if user is the car owner
  const canModifyCar = useMemo(() => {
    if (!currentUser || !isLoggedIn || !car) return false;
    if (isAdmin) return true; // Admins can modify any car
    return isCarOwner; // Otherwise, only car owner can modify
  }, [currentUser, isLoggedIn, isAdmin, isCarOwner, car]);

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;
    const result = await createComment({ content: newComment.trim() });
    if (result) {
      setNewComment("");
    }
  }, [newComment, createComment]);

  const handleStartEdit = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditContent("");
  }, []);

  const handleSaveEdit = useCallback(async (commentId: number) => {
    if (!editContent.trim()) return;
    const result = await updateComment(commentId, { content: editContent.trim() });
    if (result) {
      setEditingCommentId(null);
      setEditContent("");
    }
  }, [editContent, updateComment]);

  const handleDeleteComment = useCallback(async (commentId: number) => {
    await deleteComment(commentId);
  }, [deleteComment]);

  const handleDeleteCar = useCallback(async () => {
    if (!carId) return;
    const success = await deleteCar(carId);
    if (success) {
      router.push('/');
    }
  }, [carId, deleteCar, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sl-SI", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lightbox handlers
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToNextImage = useCallback((totalImages: number) => {
    setLightboxIndex((prev) => (prev < totalImages - 1 ? prev + 1 : prev));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        goToPrevImage();
      } else if (e.key === "ArrowRight") {
        // We need to know total images here, so we'll handle this in the component
        const allImagesCount = car?.mainImageUrl
          ? 1 + (car.imageUrls?.filter(url => url !== car.mainImageUrl)?.length || 0)
          : car?.imageUrls?.length || 0;
        goToNextImage(allImagesCount);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, goToPrevImage, goToNextImage, car]);

  if (isLoading) {
    return (
      <PageShell maxWidthClass="max-w-6xl">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              <Trans>Nalaganje podrobnosti vozila...</Trans>
            </Text>
          </VStack>
        </Box>
      </PageShell>
    );
  }

  if (error || !car) {
    return (
      <PageShell maxWidthClass="max-w-6xl">
        <VStack gap={4} align="stretch">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            alignSelf="flex-start"
          >
            <Icon as={LuArrowLeft} mr={2} />
            <Trans>Nazaj</Trans>
          </Button>
          <Box
            p={6}
            borderRadius="xl"
            bg={{ base: "red.50", _dark: "red.900" }}
            borderWidth="1px"
            borderColor={{ base: "red.200", _dark: "red.700" }}
          >
            <Text color={{ base: "red.800", _dark: "red.200" }} fontWeight="medium">
              {error || <Trans>Vozilo ni bilo najdeno.</Trans>}
            </Text>
          </Box>
        </VStack>
      </PageShell>
    );
  }

  const title = `${car.brand} ${car.model}`.trim();
  const price = `${car.price.toLocaleString("sl-SI")} €`;
  const mileageText = `${car.mileage.toLocaleString("sl-SI")} km`;
  const powerText = `${car.enginePower} kW`;
  const registrationDate = new Date(car.firstRegistrationDate).toLocaleDateString("sl-SI");

  // Get all images - main image first, then others
  const allImages = car.mainImageUrl
    ? [car.mainImageUrl, ...(car.imageUrls?.filter(url => url !== car.mainImageUrl) || [])]
    : car.imageUrls || [];

  return (
    <PageShell maxWidthClass="max-w-6xl">
      <VStack gap={6} align="stretch">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          alignSelf="flex-start"
          color={{ base: "gray.600", _dark: "gray.400" }}
          _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
        >
          <Icon as={LuArrowLeft} mr={2} />
          <Trans>Nazaj</Trans>
        </Button>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
          {/* Images Section */}
          <VStack gap={4} align="stretch">
            {/* Main Image */}
            {allImages.length > 0 && (
              <Box
                position="relative"
                width="100%"
                aspectRatio="4/3"
                borderRadius="xl"
                overflow="hidden"
                bg={{ base: "gray.100", _dark: "gray.800" }}
                boxShadow="lg"
                cursor="pointer"
                onClick={() => openLightbox(0)}
                _hover={{
                  transform: "scale(1.01)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
              >
                <Image
                  src={allImages[0]}
                  alt={title}
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                  unoptimized
                  priority
                />
                {/* Hover overlay */}
                <Box
                  position="absolute"
                  inset={0}
                  bg="blackAlpha.300"
                  opacity={0}
                  _hover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="semibold" fontSize="lg">
                    <Trans>Klikni za povečavo</Trans>
                  </Text>
                </Box>
              </Box>
            )}

            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <SimpleGrid columns={4} gap={3}>
                {allImages.slice(1, 5).map((imageUrl, index) => (
                  <Box
                    key={index}
                    position="relative"
                    aspectRatio="1"
                    borderRadius="lg"
                    overflow="hidden"
                    bg={{ base: "gray.100", _dark: "gray.800" }}
                    cursor="pointer"
                    onClick={() => openLightbox(index + 1)}
                    _hover={{
                      transform: "scale(1.05)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${title} - Slika ${index + 2}`}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                      unoptimized
                    />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </VStack>

          {/* Details Section */}
          <VStack gap={6} align="stretch">
            {/* Title and Price */}
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between" align="flex-start" gap={4}>
                <VStack align="start" gap={2} flex={1}>
                  <Heading size="xl" color={{ base: "gray.900", _dark: "gray.100" }}>
                    {title}
                  </Heading>
                  <Badge
                    colorPalette="blue"
                    variant="solid"
                    fontSize="md"
                    fontWeight="bold"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {car.year}
                  </Badge>
                </VStack>
                <HStack gap={2}>
                  {/* Edit Button - Visible to owner or admin */}
                  {canModifyCar && carId && (
                    <>
                      <Button
                        variant="outline"
                        colorPalette="blue"
                        size="lg"
                        borderRadius="full"
                        onClick={() => router.push(`/cars/${carId}/edit`)}
                        aria-label={t`Uredi oglas`}
                        _hover={{
                          bg: { base: "blue.50", _dark: "blue.900" },
                        }}
                      >
                        <Icon as={LuPencil} mr={2} />
                        <Trans>Uredi</Trans>
                      </Button>
                      <Button
                        variant="outline"
                        colorPalette="red"
                        size="lg"
                        borderRadius="full"
                        onClick={() => setShowDeleteConfirm(true)}
                        aria-label={t`Izbriši oglas`}
                        loading={isDeletingCar}
                        _hover={{
                          bg: { base: "red.50", _dark: "red.900" },
                        }}
                      >
                        <Icon as={LuTrash2} mr={2} />
                        <Trans>Izbriši</Trans>
                      </Button>
                    </>
                  )}
                  {/* Favourite Button */}
                  {isLoggedIn && (
                    <Button
                      variant="ghost"
                      size="lg"
                      borderRadius="full"
                      p={2}
                      onClick={toggleFavourite}
                      loading={isFavouriteLoading}
                      aria-label={
                        isFavourite
                          ? t`Odstrani iz priljubljenih`
                          : t`Dodaj med priljubljene`
                      }
                      aria-pressed={isFavourite}
                      _hover={{
                        bg: isFavourite
                          ? { base: "red.100", _dark: "red.900" }
                          : { base: "gray.100", _dark: "gray.700" },
                      }}
                    >
                      <Icon
                        as={LuHeart}
                        boxSize={7}
                        color={isFavourite ? "red.500" : { base: "gray.400", _dark: "gray.500" }}
                        transition="all 0.2s"
                        style={{ fill: isFavourite ? "currentColor" : "none" }}
                        _hover={{
                          transform: "scale(1.1)",
                        }}
                      />
                    </Button>
                  )}
                </HStack>
              </HStack>
              <VStack align="start" gap={1}>
                {car.originalPrice && car.originalPrice > car.price ? (
                  <HStack gap={3} align="baseline" flexWrap="wrap">
                    <Text
                      fontSize="2xl"
                      fontWeight="medium"
                      color={{ base: "gray.500", _dark: "gray.400" }}
                      textDecoration="line-through"
                    >
                      {car.originalPrice.toLocaleString("sl-SI")} €
                    </Text>
                    <Text
                      fontSize="3xl"
                      fontWeight="bold"
                      color={{ base: "blue.600", _dark: "blue.400" }}
                    >
                      {price}
                    </Text>
                    <Badge
                      colorPalette="red"
                      variant="solid"
                      fontSize="sm"
                      fontWeight="bold"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      -{Math.round(((car.originalPrice - car.price) / car.originalPrice) * 100)}%
                    </Badge>
                  </HStack>
                ) : (
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    color={{ base: "blue.600", _dark: "blue.400" }}
                  >
                    {price}
                  </Text>
                )}
              </VStack>
              <HStack gap={2} color={{ base: "gray.600", _dark: "gray.400" }} fontSize="sm">
                <Icon as={LuEye} boxSize={4} />
                <Text>
                  {(car.viewCount ?? 0).toLocaleString("sl-SI")} <Trans>ogledov</Trans>
                </Text>
              </HStack>
            </VStack>

            {/* Seller Info */}
            {car.seller && (
              <Card.Root
                borderRadius="xl"
                borderWidth="1px"
                borderColor={{ base: "blue.200", _dark: "blue.700" }}
                bg={{ base: "blue.50", _dark: "gray.800" }}
              >
                <CardBody p={6}>
                  <VStack align="stretch" gap={4}>
                    <Heading size="sm" color={{ base: "gray.800", _dark: "gray.100" }}>
                      <Trans>Prodajalec</Trans>
                    </Heading>
                    <HStack gap={4} align="center">
                      {/* Seller Avatar */}
                      {car.seller.avatarImageUrl ? (
                        <Box
                          width="64px"
                          height="64px"
                          borderRadius="full"
                          overflow="hidden"
                          borderWidth="3px"
                          borderColor={{ base: "blue.300", _dark: "blue.600" }}
                          boxShadow="md"
                          flexShrink={0}
                        >
                          <Image
                            src={car.seller.avatarImageUrl}
                            alt={`${car.seller.name} ${car.seller.surname}`}
                            width={64}
                            height={64}
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
                          width="64px"
                          height="64px"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bgGradient={{ base: "linear(to-br, blue.500, blue.600)", _dark: "linear(to-br, blue.400, blue.500)" }}
                          color="white"
                          fontSize="xl"
                          fontWeight="bold"
                          boxShadow="md"
                          borderWidth="3px"
                          borderColor={{ base: "blue.300", _dark: "blue.600" }}
                          flexShrink={0}
                        >
                          {car.seller.name[0]}{car.seller.surname[0]}
                        </Box>
                      )}
                      
                      {/* Seller Details */}
                      <VStack align="start" gap={2} flex={1}>
                        <HStack gap={2}>
                          <Icon as={LuUser} boxSize={4} color={{ base: "blue.500", _dark: "blue.400" }} />
                          <Text fontWeight="semibold" color={{ base: "gray.800", _dark: "gray.100" }}>
                            {car.seller.name} {car.seller.surname}
                          </Text>
                        </HStack>
                        <HStack gap={2}>
                          <Icon as={LuPhone} boxSize={4} color={{ base: "blue.500", _dark: "blue.400" }} />
                          <Text
                            fontSize="sm"
                            color={{ base: "blue.600", _dark: "blue.400" }}
                            fontWeight="medium"
                          >
                            <a href={`tel:${car.seller.phoneNumber}`}>
                              {car.seller.phoneNumber}
                            </a>
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    {/* Contact Button */}
                    <Button
                      colorPalette="blue"
                      size="lg"
                      width="full"
                      fontWeight="semibold"
                      onClick={() => window.location.href = `tel:${car.seller?.phoneNumber}`}
                    >
                      <Icon as={LuPhone} mr={2} />
                    <Trans>Pokliči prodajalca</Trans>
                    </Button>
                  </VStack>
                </CardBody>
              </Card.Root>
            )}

            <Box
              height="1px"
              bg={{ base: "gray.200", _dark: "gray.700" }}
              my={2}
            />

            {/* Specifications */}
            <Card.Root
              borderRadius="xl"
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              bg={{ base: "white", _dark: "gray.800" }}
            >
              <CardBody p={6}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" color={{ base: "gray.800", _dark: "gray.100" }} mb={2}>
                    <Trans>Specifikacije</Trans>
                  </Heading>
                  
                  <SimpleGrid columns={2} gap={4}>
                    <HStack gap={3}>
                      <Icon as={LuGauge} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Prevoženih km</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {mileageText}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuFuel} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Gorivo</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.fuelType}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuSettings2} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Moč motorja</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {powerText}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuSettings2} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Menjalnik</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.transmission}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuPalette} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Barva</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.color}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuCalendar} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Prva registracija</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {registrationDate}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={3}>
                      <Icon as={LuUsers} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                          <Trans>Predhodnih lastnikov</Trans>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={{ base: "gray.700", _dark: "gray.300" }}>
                          {car.previousOwners}
                        </Text>
                      </VStack>
                    </HStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card.Root>

            {/* Equipment and Details */}
            {car.equipmentAndDetails && (
              <Card.Root
                borderRadius="xl"
                borderWidth="1px"
                borderColor={{ base: "gray.200", _dark: "gray.700" }}
                bg={{ base: "white", _dark: "gray.800" }}
              >
                <CardBody p={6}>
                  <VStack align="stretch" gap={3}>
                    <Heading size="sm" color={{ base: "gray.800", _dark: "gray.100" }}>
                      <Trans>Oprema in dodatni podatki</Trans>
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={{ base: "gray.700", _dark: "gray.300" }}
                      whiteSpace="pre-wrap"
                      lineHeight="1.6"
                    >
                      {car.equipmentAndDetails}
                    </Text>
                  </VStack>
                </CardBody>
              </Card.Root>
            )}

          </VStack>
        </SimpleGrid>

        {/* Comments Section */}
        <Card.Root
          borderRadius="xl"
          borderWidth="1px"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          bg={{ base: "white", _dark: "gray.800" }}
          mt={4}
        >
          <CardBody p={6}>
            <VStack align="stretch" gap={6}>
              <HStack gap={3}>
                <Icon as={LuMessageSquare} boxSize={5} color={{ base: "blue.500", _dark: "blue.400" }} />
                <Heading size="sm" color={{ base: "gray.800", _dark: "gray.100" }}>
                  <Trans>Komentarji</Trans> ({comments.length})
                </Heading>
              </HStack>

              {/* Add Comment Form */}
              {isLoggedIn ? (
                <Box>
                  <VStack align="stretch" gap={3}>
                    <Textarea
                      placeholder={t`Napišite komentar...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      bg={{ base: "gray.50", _dark: "gray.700" }}
                      borderColor={{ base: "gray.200", _dark: "gray.600" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                      }}
                      resize="vertical"
                      minH="100px"
                    />
                    <Button
                      colorPalette="blue"
                      alignSelf="flex-end"
                      onClick={handleSubmitComment}
                      loading={isSubmitting}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      <Icon as={LuSend} mr={2} />
                      <Trans>Objavi komentar</Trans>
                    </Button>
                  </VStack>
                </Box>
              ) : (
                <Box
                  p={4}
                  borderRadius="lg"
                  bg={{ base: "gray.50", _dark: "gray.700" }}
                  textAlign="center"
                >
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>Za komentiranje se morate </Trans>
                    <Text
                      as="span"
                      color={{ base: "blue.600", _dark: "blue.400" }}
                      fontWeight="semibold"
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => router.push("/login")}
                    >
                      <Trans>prijaviti</Trans>
                    </Text>
                    <Trans>.</Trans>
                  </Text>
                </Box>
              )}

              {commentsError && (
                <Box
                  p={3}
                  borderRadius="lg"
                  bg={{ base: "red.50", _dark: "red.900" }}
                  borderWidth="1px"
                  borderColor={{ base: "red.200", _dark: "red.700" }}
                >
                  <Text color={{ base: "red.800", _dark: "red.200" }} fontSize="sm">
                    {commentsError}
                  </Text>
                </Box>
              )}

              {/* Comments List */}
              {isLoadingComments ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <Spinner size="md" color="blue.500" />
                </Box>
              ) : comments.length === 0 ? (
                <Box
                  p={6}
                  borderRadius="lg"
                  bg={{ base: "gray.50", _dark: "gray.700" }}
                  textAlign="center"
                >
                  <Text color={{ base: "gray.500", _dark: "gray.400" }}>
                    <Trans>Še ni komentarjev. Bodite prvi, ki komentirate!</Trans>
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={4}>
                  {comments.map((comment) => (
                    <Box
                      key={comment.id}
                      p={4}
                      borderRadius="lg"
                      bg={{ base: "gray.50", _dark: "gray.700" }}
                      borderWidth="1px"
                      borderColor={{ base: "gray.200", _dark: "gray.600" }}
                    >
                      <VStack align="stretch" gap={3}>
                        {/* Comment Header */}
                        <HStack justify="space-between" align="flex-start">
                          <HStack gap={3}>
                            {/* Author Avatar */}
                            {comment.author?.avatarImageUrl ? (
                              <Box
                                width="40px"
                                height="40px"
                                borderRadius="full"
                                overflow="hidden"
                                flexShrink={0}
                              >
                                <Image
                                  src={comment.author.avatarImageUrl}
                                  alt={`${comment.author.name} ${comment.author.surname}`}
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
                                {comment.author?.name?.[0] || "U"}{comment.author?.surname?.[0] || ""}
                              </Box>
                            )}
                            <VStack align="start" gap={0}>
                              <Text fontWeight="semibold" fontSize="sm" color={{ base: "gray.800", _dark: "gray.100" }}>
                                {comment.author?.name} {comment.author?.surname}
                              </Text>
                              <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }}>
                                {formatDate(comment.createdAt)}
                                {comment.updatedAt && (
                                  <Text as="span" fontStyle="italic">
                                    {" "}
                                    <Trans>urejeno</Trans>
                                  </Text>
                                )}
                              </Text>
                            </VStack>
                          </HStack>

                          {/* Edit/Delete buttons - visible only for comment owner or car seller */}
                          {canModifyComment(comment.userId) && editingCommentId !== comment.id && (
                            <HStack gap={1}>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorPalette="blue"
                                onClick={() => handleStartEdit(comment)}
                              >
                                <Icon as={LuPencil} boxSize={4} />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Icon as={LuTrash2} boxSize={4} />
                              </Button>
                            </HStack>
                          )}
                        </HStack>

                        {/* Comment Content */}
                        {editingCommentId === comment.id ? (
                          <VStack align="stretch" gap={2}>
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              bg={{ base: "white", _dark: "gray.600" }}
                              borderColor={{ base: "gray.300", _dark: "gray.500" }}
                              resize="vertical"
                              minH="80px"
                            />
                            <HStack justify="flex-end" gap={2}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <Icon as={LuX} mr={2} />
                                <Trans>Prekliči</Trans>
                              </Button>
                              <Button
                                size="sm"
                                colorPalette="blue"
                                onClick={() => handleSaveEdit(comment.id)}
                                loading={isSubmitting}
                                disabled={!editContent.trim() || isSubmitting}
                              >
                                <Icon as={LuCheck} mr={2} />
                                <Trans>Shrani</Trans>
                              </Button>
                            </HStack>
                          </VStack>
                        ) : (
                          <Text
                            fontSize="sm"
                            color={{ base: "gray.700", _dark: "gray.300" }}
                            whiteSpace="pre-wrap"
                            lineHeight="1.6"
                          >
                            {comment.content}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card.Root>
      </VStack>

      {/* Image Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={9999}
            bg="blackAlpha.900"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <Button
              position="absolute"
              top={4}
              right={4}
              variant="ghost"
              colorPalette="whiteAlpha"
              onClick={closeLightbox}
              zIndex={10001}
              size="lg"
              borderRadius="full"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Icon as={LuX} boxSize={6} color="white" />
            </Button>

            {/* Image counter */}
            <Box
              position="absolute"
              top={4}
              left={4}
              px={4}
              py={2}
              bg="blackAlpha.600"
              borderRadius="full"
              zIndex={10001}
            >
              <Text color="white" fontWeight="medium" fontSize="sm">
                {lightboxIndex + 1} / {allImages.length}
              </Text>
            </Box>

            {/* Previous button */}
            {lightboxIndex > 0 && (
              <Button
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
                colorPalette="whiteAlpha"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                zIndex={10001}
                size="lg"
                borderRadius="full"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                <Icon as={LuChevronLeft} boxSize={8} color="white" />
              </Button>
            )}

            {/* Next button */}
            {lightboxIndex < allImages.length - 1 && (
              <Button
                position="absolute"
                right={4}
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
                colorPalette="whiteAlpha"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage(allImages.length);
                }}
                zIndex={10001}
                size="lg"
                borderRadius="full"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                <Icon as={LuChevronRight} boxSize={8} color="white" />
              </Button>
            )}

            {/* Main image */}
            <Box
              position="relative"
              maxW="90vw"
              maxH="90vh"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[lightboxIndex]}
                alt={`${title} - Slika ${lightboxIndex + 1}`}
                width={1200}
                height={900}
                unoptimized
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <HStack
                position="absolute"
                bottom={4}
                left="50%"
                transform="translateX(-50%)"
                gap={2}
                p={2}
                bg="blackAlpha.600"
                borderRadius="lg"
                maxW="90vw"
                overflowX="auto"
                onClick={(e) => e.stopPropagation()}
              >
                {allImages.map((imageUrl, index) => (
                  <Box
                    key={index}
                    position="relative"
                    width="60px"
                    height="60px"
                    borderRadius="md"
                    overflow="hidden"
                    cursor="pointer"
                    borderWidth={2}
                    borderColor={lightboxIndex === index ? "blue.400" : "transparent"}
                    opacity={lightboxIndex === index ? 1 : 0.6}
                    _hover={{ opacity: 1 }}
                    transition="all 0.2s"
                    flexShrink={0}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Predogled ${index + 1}`}
                      width={60}
                      height={60}
                      unoptimized
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </HStack>
            )}
          </Box>
        </Portal>
      )}

      {/* Delete Confirmation Dialog */}
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
                  <Heading size="md" color={{ base: "gray.800", _dark: "gray.100" }}>
                    <Trans>Potrditev brisanja</Trans>
                  </Heading>
                  <Text color={{ base: "gray.600", _dark: "gray.400" }}>
                    <Trans>Ali ste prepričani, da želite izbrisati ta oglas? To dejanje ni mogoče razveljaviti.</Trans>
                  </Text>
                  {deleteCarError && (
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={{ base: "red.50", _dark: "red.900" }}
                      borderWidth="1px"
                      borderColor={{ base: "red.200", _dark: "red.700" }}
                    >
                      <Text color={{ base: "red.800", _dark: "red.200" }} fontSize="sm">
                        {deleteCarError}
                      </Text>
                    </Box>
                  )}
                  <HStack justify="flex-end" gap={3}>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeletingCar}
                    >
                      <Trans>Prekliči</Trans>
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={handleDeleteCar}
                      loading={isDeletingCar}
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
    </PageShell>
  );
}

