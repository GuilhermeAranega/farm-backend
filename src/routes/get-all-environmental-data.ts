import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function getAllEnvironmentalData(app: FastifyInstance) {
  app.get(
    "/environmental-data",
    {
      schema: {
        response: {
          201: z.object({
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
      const averageEnvironmentalData = await prisma.environmentalData.findMany({
        select: {
          avgAirHumidity: true,
          avgAirTemp: true,
          avgLightIntensity: true,
          avgSoilMoisture: true,
          totalEntries: true,
        },
      });
      return res.status(201).send({
        message: "Found environmental data",
        status: true,
        averageEnvironmentalData,
      });
    }
  );
}
