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

            averageEnvironmentalData: z.array(
              z.object({
                avgAirHumidity: z.number().nullable(),
                avgAirTemp: z.number().nullable(),
                avgLightIntensity: z.number().nullable(),
                avgSoilMoisture: z.number().nullable(),
                totalEntries: z.number().nullable(),
              })
            ),
          }),
        },
      },
    },
    async (req, res) => {
      const sevenDaysAgo = subDays(new Date(), 7);
      const averageEnvironmentalData = await prisma.environmentalData.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        orderBy: { timestamp: "desc" },
      });
      return res.status(200).send({
        message: "Found environmental data",
        status: true,
        averageEnvironmentalData,
      });
    }
  );
}
