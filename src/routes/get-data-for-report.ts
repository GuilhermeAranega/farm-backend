import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function getReportData(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/reports/get-data",
    {
      schema: {
        querystring: z.object({
          start: z.coerce.date(),
          end: z.coerce.date(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            environmentalData: z.any(),
            energyMetrics: z.any(),
            waterPumpLogs: z.any(),
            notifications: z.any(),
            stats: z.any(),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const { start, end } = req.query;

      const [environmentalData, energyMetrics, waterPumpLogs, notifications] =
        await Promise.all([
          prisma.environmentalData.findMany({
            where: { timestamp: { gte: start, lte: end } },
            orderBy: { timestamp: "asc" },
          }),
          prisma.energyMetric.findMany({
            where: { timestamp: { gte: start, lte: end } },
            orderBy: { timestamp: "asc" },
          }),
          prisma.waterPumpLog.findMany({
            where: { timestamp: { gte: start, lte: end } },
            orderBy: { timestamp: "asc" },
          }),
          prisma.notification.findMany({
            where: { timestamp: { gte: start, lte: end } },
            orderBy: { timestamp: "asc" },
          }),
        ]);

      const totalPumpActivations = waterPumpLogs.length;
      const alertCount = notifications.filter((n) => n.type === "ALERT").length;

      const avg = await prisma.environmentalData.aggregate({
        _avg: { soilMoisture: true },
        where: { timestamp: { gte: start, lte: end } },
      });

      const stats = {
        totalPumpActivations,
        alertCount,
        averageSoilMoisture: avg._avg.soilMoisture,
      };

      return res.status(200).send({
        message: "Report data fetched",
        status: true,
        environmentalData,
        energyMetrics,
        waterPumpLogs,
        notifications,
        stats,
      });
    }
  );
}
