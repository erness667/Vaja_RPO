"use client";

import { useMemo } from "react";
import { Box, VStack, Heading, Card, CardBody } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface WorkerActivityChartProps {
  workerActivity: Array<{
    userId: string;
    userName: string;
    userSurname: string;
    role: string;
    carsPosted: number;
    totalValuePosted: number;
  }>;
}

export function WorkerActivityChart({ workerActivity }: WorkerActivityChartProps) {
  // Get top 5 workers by cars posted
  const top5Workers = useMemo(() => {
    if (!workerActivity || workerActivity.length === 0) return [];
    return [...workerActivity]
      .sort((a, b) => b.carsPosted - a.carsPosted)
      .slice(0, 5);
  }, [workerActivity]);

  return (
    <Card.Root>
      <CardBody>
        <VStack align="stretch" gap={4}>
          <Heading size="md">
            <Trans>Aktivnost delavcev</Trans>
          </Heading>
          {top5Workers.length > 0 ? (
            <Box width="100%" height="300px">
              <ResponsiveContainer>
                <BarChart data={top5Workers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="carsPosted" fill="#8884d8" name="Objavljeni avtomobili" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box width="100%" height="300px" display="flex" alignItems="center" justifyContent="center">
              <Trans>Ni podatkov o delavcih</Trans>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
