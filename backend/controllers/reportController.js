// backend/controllers/reportController.js
import db from '../db/db.js';
import PDFDocument from 'pdfkit';
import { getHPIClassification, getHEIClassification } from '../utils/classification.js';

export default function generateReport(req, res) {
    const { userId } = req.user;
    const doc = new PDFDocument({
        // Set document default to dark theme friendly (white text on dark background)
        bufferPages: true,
        font: 'Helvetica',
        size: 'A4',
        margin: 50 // Added uniform margin
    });
    const filename = `groundwater_report_${new Date().toISOString()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- Define Dark Theme Colors (Based on tailwind.config.js) ---
    const COLORS = {
        PRIMARY_DARK: '#0f172a',
        SECONDARY_DARK: '#1e293b',
        ACCENT_BLUE: '#38bdf8',
        TEXT_LIGHT: '#f1f5f9',
        TEXT_MUTED: '#94a3b8',
        SUCCESS: '#10b981',
        WARNING: '#f59e0b',
        DANGER: '#ef4444',
    };
    
    // Set background to primary dark color for the entire page
    doc.on('pageAdded', () => {
        doc.fillColor(COLORS.PRIMARY_DARK).rect(0, 0, doc.page.width, doc.page.height).fill();
    });
    doc.fillColor(COLORS.PRIMARY_DARK).rect(0, 0, doc.page.width, doc.page.height).fill();


    db.query(`
        SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
        FROM pollution_indices pi
        JOIN samples s ON pi.sample_id = s.sample_id
        JOIN locations l ON s.location_id = l.location_id
        WHERE s.user_id = $1
    `, [userId])
    .then(result => {
        const rows = result.rows;

        // --- 1. HEADER SECTION ---
        doc.fillColor(COLORS.SECONDARY_DARK)
           .rect(0, 0, doc.page.width, 100) // Dark strip for header
           .fill();

        doc.fillColor(COLORS.ACCENT_BLUE)
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('GROUNDWATER INSIGHTS REPORT', 50, 40, { align: 'left' });

        doc.fillColor(COLORS.TEXT_MUTED)
           .fontSize(10)
           .font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleDateString('en-US')} | User Data Analysis`, 50, 75, { align: 'left' });
        
        // Horizontal Line Separator
        doc.fillColor(COLORS.ACCENT_BLUE).rect(50, 95, doc.page.width - 100, 1).fill(); 

        let currentY = 120; // Starting point for content

        // --- 2. DATA PROCESSING ---
        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.location]) acc[row.location] = { hpi: 0, hei: 0, pli: 0, mpi: 0, count: 0 };
            acc[row.location].hpi += row.hpi;
            acc[row.location].hei += row.hei;
            acc[row.location].pli += row.pli;
            acc[row.location].mpi += row.mpi;
            acc[row.location].count += 1;
            return acc;
        }, {});
        
        const contentStartX = 50;
        const contentWidth = doc.page.width - contentStartX * 2;
        const locationBlockHeight = 110; 
        const gutter = 20;

        // --- 3. LOCATION BLOCKS ---
        Object.entries(grouped).forEach(([location, vals]) => {
            const hpi = (vals.hpi / vals.count).toFixed(2);
            const hei = (vals.hei / vals.count).toFixed(2);
            const pli = (vals.pli / vals.count).toFixed(2);
            const mpi = (vals.mpi / vals.count).toFixed(2);
            
            const heiClassification = getHEIClassification(hei);
            
            let classificationColor;
            if (heiClassification === 'Safe') classificationColor = COLORS.SUCCESS;
            else if (heiClassification === 'Polluted') classificationColor = COLORS.WARNING;
            else classificationColor = COLORS.DANGER; // Highly Polluted

            // Check if a new page is needed
            if (currentY + locationBlockHeight > doc.page.height - 50) {
                doc.addPage();
                currentY = 50; // Restart below the top margin
            }

            // --- LOCATION BLOCK START ---
            
            // Draw Block Background (Secondary Dark)
            doc.fillColor(COLORS.SECONDARY_DARK)
               .roundedRect(contentStartX, currentY, contentWidth, locationBlockHeight, 8)
               .fill();
               
            // Left Column (Location Title and Samples Count)
            const leftX = contentStartX + 15;
            doc.fillColor(COLORS.TEXT_LIGHT)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text(location, leftX, currentY + 15);
            
            doc.fillColor(COLORS.TEXT_MUTED)
               .fontSize(10)
               .font('Helvetica')
               .text(`Samples Analyzed: ${vals.count}`, leftX, currentY + 38);

            // Right Column (Classification)
            const rightX = contentStartX + contentWidth - 175;
            const badgeY = currentY + 15;
            
            // Classification Title
            doc.fillColor(COLORS.TEXT_MUTED)
               .fontSize(9)
               .text('POLLUTION CLASSIFICATION (HEI)', rightX, badgeY);

            // Classification Value/Badge
            doc.fillColor(classificationColor)
               .roundedRect(rightX, badgeY + 12, 160, 20, 4)
               .fill();

            doc.fillColor(COLORS.PRIMARY_DARK) 
               .fontSize(11)
               .font('Helvetica-Bold')
               .text(heiClassification.toUpperCase(), rightX, badgeY + 18, {
                    width: 160,
                    align: 'center'
                });

            // --- INDEX METRICS TABLE (2x2 Grid) ---
            const indices = [
                { label: 'HPI', value: hpi, color: COLORS.TEXT_LIGHT },
                { label: 'PLI', value: pli, color: COLORS.TEXT_LIGHT },
                { label: 'HEI', value: hei, color: classificationColor },
                { label: 'MPI', value: mpi, color: COLORS.TEXT_LIGHT },
            ];

            const cellWidth = (contentWidth - 2 * gutter) / 4;
            let indexY = currentY + 68;

            indices.forEach((index, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = leftX + col * (cellWidth + gutter) - (col === 1 ? 5 : 0);
                const y = indexY + row * 20;

                doc.fillColor(COLORS.TEXT_MUTED)
                   .fontSize(9)
                   .text(index.label, x, y);

                doc.fillColor(index.color)
                   .fontSize(12)
                   .font('Helvetica-Bold')
                   .text(index.value, x, y + 10);
            });
            
            // --- LOCATION BLOCK END ---
            currentY += locationBlockHeight + gutter;
        });

        // --- 4. FOOTER ---
        doc.fillColor(COLORS.TEXT_MUTED)
           .fontSize(8)
           .font('Helvetica')
           .text('A Smart India Hackathon Initiative | Disclaimer: Report based on user data. Consult certified lab results for regulatory use.', contentStartX, doc.page.height - 40, {
               width: contentWidth,
               align: 'center'
           });

        doc.end();
    })
    .catch(err => {
        console.error('❌ DB query failed:', err.message);
        res.status(500).json({ error: 'Failed to generate report' });
        doc.end();
    });
}