import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { subDays } from "date-fns";
import { authenticate } from "../hooks/authenticate";

export async function getEnvironmentalMetricsByDevice(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/environmentalmetrics/:deviceId",
    {
      schema: {
        params: z.object({
          deviceId: z.coerce.number(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),

            environmentalData: z.array(
              z.object({
                soilMoisture: z.number(),
                airTemperature: z.number(),
                airHumidity: z.number(),
                lightIntensity: z.number(),

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

      const environmentalData = await prisma.environmentalData.findMany({
        where: { timestamp: { gte: sevenDaysAgo }, deviceId: deviceId },
        orderBy: { timestamp: "desc" },
      });

      return res.status(200).send({
        message: "Found environmental data",
        status: true,
        environmentalData,
      });
    }
  );
}
