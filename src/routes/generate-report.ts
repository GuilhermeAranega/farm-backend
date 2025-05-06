import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ReportStatus } from "@prisma/client";
import { sendToQueue } from "../services/rabbitmq";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function generateReport(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/reports",
    {
      schema: {
        body: z.object({
          filterType: z.enum(["last_7_days", "all"]),
        }),
        response: {
          201: z.object({
            message: z.string(),
            status: z.boolean(),
            reportId: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { filterType } = req.body;

      const report = await prisma.report.create({
        data: { status: ReportStatus.PENDENTE },
      });

      await sendToQueue("report_requests", { reportId: report.id, filterType });

      return res.status(201).send({
        message: "Report generation started",
        status: true,
        reportId: report.id,
      });
    }
  );
}
