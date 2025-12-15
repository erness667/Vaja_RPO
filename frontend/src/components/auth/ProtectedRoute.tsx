'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/utils/auth-storage";
import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { PageShell } from "@/components/layout/PageShell";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication on client side only
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsAuth(auth);
      setIsChecking(false);
      
      if (!auth) {
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <PageShell>
        <VStack gap={4} align="center" justify="center" minH="50vh">
          <Text color={{ base: "gray.600", _dark: "gray.400" }}>
            Preverjanje dostopa...
          </Text>
        </VStack>
      </PageShell>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuth) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}

