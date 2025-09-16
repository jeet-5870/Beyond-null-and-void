import db from '../db/db.js';
import PDFDocument from 'pdfkit';

export default function generateReport(req, res) {
    const doc = new PDFDocument();
    const filename = `groundwater_report_${new Date().toISOString()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    db.all(`
        SELECT l.name AS location, pi.hpi, pi.hei
        FROM pollution_indices pi
        JOIN samples s ON pi.sample_id = s.sample_id
        JOIN locations l ON s.location_id = l.location_id
    `, (err, rows) => {
        if (err) {
            console.error('❌ DB query failed:', err.message);
            return res.status(500).json({ error: 'Failed to generate report' });
        }

        doc.fontSize(25).text('Groundwater Pollution Report', { align: 'center' });
        doc.moveDown();

        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.location]) acc[row.location] = { hpi: 0, hei: 0, count: 0 };
            acc[row.location].hpi += row.hpi;
            acc[row.location].hei += row.hei;
            acc[row.location].count += 1;
            return acc;
        }, {});

        Object.entries(grouped).forEach(([location, vals]) => {
            const hpi = (vals.hpi / vals.count).toFixed(2);
            const hei = (vals.hei / vals.count).toFixed(2);
            doc.fontSize(16).text(`Location: ${location}`);
            doc.fontSize(12).text(`Heavy Metal Pollution Index (HPI): ${hpi}`);
            doc.text(`Heavy Metal Evaluation Index (HEI): ${hei}`);
            doc.moveDown();
        });

        doc.end();
    });
}