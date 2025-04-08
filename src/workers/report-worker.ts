import { ReportStatus, PrismaClient } from "@prisma/client";
import { sendNotification } from "../services/notifications";
import { generatePDF } from "../services/pdfGenerator";
import { connectRabbitMQ } from "../services/rabbitmq";

const prisma = new PrismaClient();

async function startReportWorker() {
  console.log("🚀 report worker started");

  const channel = await connectRabbitMQ();
  await channel.assertQueue("report_requests", { durable: true });

  await channel.consume(
    "report_requests",
    async (msg: { content: { toString: () => string } }) => {
      if (!msg) return;

      const { reportId, filterType } = JSON.parse(msg.content.toString());
      console.log(
        `📊 generating report for reportId: ${reportId}, filter: ${filterType}`
      );

      try {
        let data;

        if (filterType == "last_7_days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          data = await prisma.environmentalData.findMany({
            where: { timestamp: { gte: sevenDaysAgo } },
          });
        } else {
          data = await prisma.environmentalData.findMany();
        }

        const pdfPath = `./reports/report_${reportId}.pdf`;
        await generatePDF(data, pdfPath);
        console.log(`📄 report generated at: ${pdfPath}`);

        await prisma.report.update({
          where: { id: reportId },
          data: { status: ReportStatus.COMPLETO, filePath: pdfPath },
        });

        sendNotification(
          "INFO",
          "📄 Seu relatório está pronto para download!",
          "new-notification"
        );

        channel.ack(msg);
      } catch (error) {
        console.error("❌ erro ao gerar o relatório:", error);

        await prisma.report.update({
          where: { id: reportId },
          data: { status: ReportStatus.ERRO },
        });

        sendNotification(
          "ERRO",
          "❌ Erro ao gerar o relatório",
          "report-error"
        );
        channel.ack(msg);
      }
    }
  );
}

startReportWorker();
