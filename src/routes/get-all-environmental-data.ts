import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { subDays } from "date-fns";

export async function getAllEnvironmentalData(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/environmentalmetrics",
    {
      schema: {
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

                avgAirHumidity: z.number().nullable(),
                avgAirTemp: z.number().nullable(),
                avgLightIntensity: z.number().nullable(),
                avgSoilMoisture: z.number().nullable(),
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
      const environmentalData = await prisma.environmentalData.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
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
