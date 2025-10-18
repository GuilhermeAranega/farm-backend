import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { subDays } from "date-fns";
import { authenticate } from "../hooks/authenticate";

export async function getEnergyMetricsByDevice(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/energymetrics/:deviceId",
    {
      schema: {
        params: z.object({
          deviceId: z.coerce.number(),
        }),
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
      preHandler: [authenticate],
    },
    async (req, res) => {
      const { deviceId } = req.params;
      const sevenDaysAgo = subDays(new Date(), 7);

      const energyMetrics = await prisma.energyMetric.findMany({
        where: { timestamp: { gte: sevenDaysAgo }, deviceId: deviceId },
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
