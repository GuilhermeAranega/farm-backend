import PDFDocument from "pdfkit";
import fs from "fs";

export async function generatePDF(data: any[], filePath: string) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text("Relatório de Dados Ambientais", { align: "center" });
    doc.moveDown();

    data.forEach((entry) => {
      doc.fontSize(12).text(`Data: ${entry.timestamp}`);
      doc.text(`Umidade do Solo: ${entry.soilMoisture}%`);
      doc.text(`Temperatura do Ar: ${entry.airTemperature}°C`);
      doc.text(`Intensidade da Luz: ${entry.lightIntensity} lx`);
      doc.moveDown();
    });

    doc.end();
    stream.on("finish", () => resolve(1));
  });
}
