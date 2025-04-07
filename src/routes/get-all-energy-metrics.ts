import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { subDays } from "date-fns";

export async function getAllEnergyMetrics(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/energymetrics",
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),

            energyMetrics: z.array(
              z.object({
                solarPower: z.number(),
                batteryVoltage: z.number(),
                batteryCharge: z.number(),

                avgSolarPower: z.number().nullable(),
                avgBatteryVoltage: z.number().nullable(),
                avgBatteryCharge: z.number().nullable(),
                totalEntries: z.number().nullable(),

                timestamp: z.date(),
              })
            ),
          }),
        },
      },
    },
    async (req, res) => {
      const sevenDaysAgo = subDays(new Date(), 7);

      const energyMetrics = await prisma.energyMetric.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        orderBy: { timestamp: "desc" },
      });

      return res.status(200).send({
        message: "Found energy data",
        status: true,
        energyMetrics,
      });
    }
  );
}
