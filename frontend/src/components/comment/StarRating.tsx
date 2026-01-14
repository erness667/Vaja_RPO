"use client";

import { useState } from "react";
import { HStack, Icon, Box } from "@chakra-ui/react";
import { LuStar } from "react-icons/lu";

interface StarRatingProps {
  rating: number | null | undefined; // Current rating (0-5)
  averageRating: number | null | undefined; // Average rating for display
  ratingCount?: number; // Number of ratings
  interactive?: boolean; // Whether the user can interact with the stars
  onRate?: (rating: number) => void; // Callback when user rates
  size?: "sm" | "md" | "lg";
  showCount?: boolean; // Show rating count
  disabled?: boolean;
}

export function StarRating({
  rating,
  averageRating,
  ratingCount = 0,
  interactive = false,
  onRate,
  size = "md",
  showCount = true,
  disabled = false,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Use hovered rating if hovering, otherwise use provided rating or average rating
  const displayRating = hoveredRating ?? rating ?? averageRating ?? 0;
  const effectiveRating = Math.round(displayRating); // Round to nearest integer

  const iconSize = size === "sm" ? 8 : size === "lg" ? 12 : 10;
  const gap = size === "sm" ? 0.5 : size === "lg" ? 1.5 : 1;

  const handleStarClick = (starValue: number) => {
    if (!interactive || disabled || !onRate) return;
    onRate(starValue);
  };

  const handleStarHover = (starValue: number) => {
    if (!interactive || disabled) return;
    setHoveredRating(starValue);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoveredRating(null);
  };

  return (
    <HStack gap={gap} align="center" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= effectiveRating;
        const isHovered = hoveredRating !== null && starValue <= hoveredRating;

        return (
          <Box
            key={starValue}
            as="button"
            type="button"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            cursor={interactive && !disabled ? "pointer" : "default"}
            transition="all 0.2s"
            transform={isHovered && interactive && !disabled ? "scale(1.1)" : "scale(1)"}
            disabled={!interactive || disabled}
            aria-label={`Rate ${starValue} stars`}
            _disabled={{
              cursor: "not-allowed",
              opacity: 0.5,
            }}
          >
            <Icon
              as={LuStar}
              boxSize={iconSize}
              color={
                isFilled
                  ? { base: "yellow.400", _dark: "yellow.500" }
                  : { base: "gray.300", _dark: "gray.600" }
              }
              fill={
                isFilled
                  ? { base: "yellow.400", _dark: "yellow.500" }
                  : "transparent"
              }
              strokeWidth={isFilled ? 0 : 1.5}
            />
          </Box>
        );
      })}
      {showCount && (averageRating !== null && averageRating !== undefined || ratingCount > 0) && (
        <Box
          as="span"
          fontSize={size === "sm" ? "xs" : size === "lg" ? "sm" : "xs"}
          color={{ base: "gray.600", _dark: "gray.400" }}
          ml={1}
        >
          ({averageRating?.toFixed(1) ?? "0.0"}) {ratingCount > 0 && `(${ratingCount})`}
        </Box>
      )}
    </HStack>
  );
}
