import db from '../db/db.js';
import PDFDocument from 'pdfkit';
import { getHPIClassification, getHEIClassification } from '../utils/classification.js';

export default function generateReport(req, res) {
    const { userId } = req.user; // 🔑 Get userId from the authenticated request
    const doc = new PDFDocument();
    const filename = `groundwater_report_${new Date().toISOString()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    db.query(`
        SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
        FROM pollution_indices pi
        JOIN samples s ON pi.sample_id = s.sample_id
        JOIN locations l ON s.location_id = l.location_id
        WHERE s.user_id = $1  -- 🕵️ Filter by user ID
    `, [userId])
    .then(result => {
        const rows = result.rows;

        doc.fontSize(25).text('Groundwater Pollution Report', { align: 'center' });
        doc.moveDown();

        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.location]) acc[row.location] = { hpi: 0, hei: 0, pli: 0, mpi: 0, count: 0 };
            acc[row.location].hpi += row.hpi;
            acc[row.location].hei += row.hei;
            acc[row.location].pli += row.pli;
            acc[row.location].mpi += row.mpi;
            acc[row.location].count += 1;
            return acc;
        }, {});

        Object.entries(grouped).forEach(([location, vals]) => {
            const hpi = (vals.hpi / vals.count).toFixed(2);
            const hei = (vals.hei / vals.count).toFixed(2);
            const pli = (vals.pli / vals.count).toFixed(2);
            const mpi = (vals.mpi / vals.count).toFixed(2);

            doc.fontSize(16).text(`Location: ${location}`);
            doc.fontSize(12).text(`Heavy Metal Pollution Index (HPI): ${hpi}  (Classification: ${getHPIClassification(hpi)})`);
            doc.text(`Heavy Metal Evaluation Index (HEI): ${hei}  (Classification: ${getHEIClassification(hei)})`);
            doc.text(`Pollution Load Index (PLI): ${pli}`);
            doc.text(`Metal Pollution Index (MPI): ${mpi}`);
            doc.moveDown();
        });

        doc.end();
    })
    .catch(err => {
        console.error('❌ DB query failed:', err.message);
        res.status(500).json({ error: 'Failed to generate report' });
        doc.end();
    });
}