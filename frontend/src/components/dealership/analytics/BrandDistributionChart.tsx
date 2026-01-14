"use client";

import { useMemo } from "react";
import { Box, VStack, Heading, Card, CardBody } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface BrandDistributionChartProps {
  brandDistribution: Array<{
    brand: string;
    count: number;
    totalValue: number;
    averagePrice: number;
  }>;
}

export function BrandDistributionChart({ brandDistribution }: BrandDistributionChartProps) {
  const brandChartData = useMemo(() => {
    if (!brandDistribution) return [];
    return brandDistribution.slice(0, 6).map(brand => ({
      name: brand.brand,
      value: brand.count,
    }));
  }, [brandDistribution]);

  return (
    <Card.Root>
      <CardBody>
        <VStack align="stretch" gap={4}>
          <Heading size="md">
            <Trans>Razporeditev po znamkah</Trans>
          </Heading>
          <Box width="100%" height="300px">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={brandChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brandChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
