import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function getEnvironmentalMetricByDate(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/environmental-data/:timestamp",
    {
      schema: {
        params: z.object({
          timestamp: z.string().datetime(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            environmentalData: z.object({
              id: z.string(),
              timestamp: z.date(),
              airHumidity: z.number(),
              airTemperature: z.number(),
              lightIntensity: z.number(),
              soilMoisture: z.number(),
            }),
          }),
        },
      },
    },
    async (req, res) => {
      const { timestamp } = req.params;

      const environmentalData = await prisma.environmentalData.findUnique({
        where: {
          timestamp: new Date(timestamp),
        },
      });

      if (!environmentalData) {
        throw new Error("Environmental data not found");
      }

      return res.status(200).send({
        message: "Found environmental data",
        status: true,
        environmentalData,
      });
    }
  );
}
