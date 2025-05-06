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

                timestamp: z.date(),
              })
            ),
          }),
          400: z.object({
            message: z.string(),
            status: z.boolean(),
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

      if (energyMetrics.length == 0) {
        return res.status(400).send({
          message: "Energy data not found",
          status: false,
        });
      }

      return res.status(200).send({
        message: "Found energy data",
        status: true,
        energyMetrics,
      });
    }
  );
}
