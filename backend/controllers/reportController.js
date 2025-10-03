import db from '../db/db.js';
import PDFDocument from 'pdfkit';
import { getHEIClassification } from '../utils/classification.js';

// Convert degrees to radians
const toRadians = angle => (angle * Math.PI) / 180;

// --- Helper function to draw a pie chart ---
function drawPieChart(doc, data, x, y, radius) {
    doc.fontSize(14).font('Helvetica-Bold').text('Site Classification Overview', x, y - radius - 40);

    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) {
        doc.fontSize(10).font('Helvetica').text('No data available for chart.', x, y);
        return;
    }

    let startAngle = 0;
    const legendX = x + radius + 40;
    let legendY = y - radius;

    data.forEach(item => {
        const sliceAngle = (item.count / total) * 360;
        const endAngle = startAngle + sliceAngle;

        doc.save()
           .moveTo(x, y)
           .arc(x, y, radius, toRadians(startAngle), toRadians(endAngle), false)
           .lineTo(x, y)
           .fill(item.color);
        doc.restore();

        doc.rect(legendX, legendY, 10, 10).fill(item.color);
        doc.fontSize(10).font('Helvetica').fillColor('#000')
           .text(`${item.label} (${item.count})`, legendX + 20, legendY);
        legendY += 20;

        startAngle = endAngle;
    });
}

// --- Helper function to draw a bar chart ---
function drawBarChart(doc, data, x, y, width, height) {
    doc.fontSize(14).font('Helvetica-Bold').text('Top 5 Polluted Locations (by HEI)', x, y - 40);

    if (data.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No data available for chart.', x, y);
        return;
    }

    const barSpacing = 20;
    const barWidth = (width - (barSpacing * (data.length - 1))) / data.length;
    const maxVal = Math.max(...data.map(item => item.value), 0);

    doc.fontSize(8).fillColor('#555');

    data.forEach((item, i) => {
        const barHeight = maxVal > 0 ? (item.value / maxVal) * height : 0;
        const barX = x + i * (barWidth + barSpacing);

        doc.rect(barX, y + height - barHeight, barWidth, barHeight).fill(item.color);
        doc.fillColor('#000').text(item.value.toFixed(2), barX, y + height - barHeight - 12, { width: barWidth, align: 'center' });
        doc.text(item.label, barX - 10, y + height + 5, { width: barWidth + 20, align: 'center' });
    });
}

// --- Classification color helper ---
function getColorByClassification(classification, COLORS) {
    if (classification === 'Safe') return COLORS.SUCCESS;
    if (classification === 'Polluted') return COLORS.WARNING;
    return COLORS.DANGER;
}

export default function generateReport(req, res) {
    const { userId, role } = req.user;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="groundwater_report_${new Date().toISOString()}.pdf"`);
    doc.pipe(res);

    const COLORS = {
        PRIMARY: '#FFFFFF',
        SECONDARY: '#F3F4F6',
        ACCENT: '#38BDF8',
        TEXT_DARK: '#1F2937',
        TEXT_MUTED: '#6B7280',
        SUCCESS: '#10B981',
        WARNING: '#F59E0B',
        DANGER: '#EF4444',
    };

    const query = role === 'ngo' || role === 'researcher' || role === 'guest'
        ? `SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
           FROM pollution_indices pi
           JOIN samples s ON pi.sample_id = s.sample_id
           JOIN locations l ON s.location_id = l.location_id`
        : `SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
           FROM pollution_indices pi
           JOIN samples s ON pi.sample_id = s.sample_id
           JOIN locations l ON s.location_id = l.location_id
           WHERE s.user_id = $1`;

    const params = role === 'ngo' || role === 'researcher' || role === 'guest' ? [] : [userId];

    db.query(query, params)
    .then(result => {
        const rows = result.rows;

        // --- HEADER ---
        doc.rect(0, 0, doc.page.width, 100).fill(COLORS.SECONDARY);
        doc.fillColor(COLORS.ACCENT).fontSize(28).font('Helvetica-Bold').text('Groundwater Insights Report', 50, 40);
        doc.fillColor(COLORS.TEXT_MUTED).fontSize(10).font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, 50, 75);
        doc.moveTo(50, 95).lineTo(doc.page.width - 50, 95).stroke(COLORS.ACCENT);

        let currentY = 140;

        // --- DATA PROCESSING ---
        const grouped = {};
        rows.forEach(row => {
            if (!grouped[row.location]) grouped[row.location] = { hpi: 0, hei: 0, pli: 0, mpi: 0, count: 0 };
            grouped[row.location].hpi += row.hpi;
            grouped[row.location].hei += row.hei;
            grouped[row.location].pli += row.pli;
            grouped[row.location].mpi += row.mpi;
            grouped[row.location].count += 1;
        });

        const locationsData = Object.entries(grouped).map(([location, vals]) => {
            const avgHei = vals.hei / vals.count;
            return {
                location,
                hpi: (vals.hpi / vals.count).toFixed(2),
                hei: avgHei.toFixed(2),
                pli: (vals.pli / vals.count).toFixed(2),
                mpi: (vals.mpi / vals.count).toFixed(2),
                count: vals.count,
                classification: getHEIClassification(avgHei),
            };
        });

        const safeCount = locationsData.filter(loc => loc.classification === 'Safe').length;
        const pollutedCount = locationsData.filter(loc => loc.classification === 'Polluted').length;        const highlyPollutedCount = locationsData.filter(loc => loc.classification === 'Highly Polluted').length;

        // --- SUMMARY PAGE ---
        doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Report Summary', 50, currentY);
        currentY += 30;
        doc.fontSize(12).font('Helvetica').text(`Total Locations Analyzed: ${locationsData.length}`, 50, currentY);
        currentY += 80;

        drawPieChart(doc, [
            { label: 'Safe', count: safeCount, color: COLORS.SUCCESS },
            { label: 'Polluted', count: pollutedCount, color: COLORS.WARNING },
            { label: 'Highly Polluted', count: highlyPollutedCount, color: COLORS.DANGER },
        ], 120, currentY, 60);

        const topPolluted = [...locationsData].sort((a, b) => b.hei - a.hei).slice(0, 5);
        drawBarChart(doc, topPolluted.map(loc => ({
            label: loc.location,
            value: parseFloat(loc.hei),
            color: COLORS.DANGER
        })), 300, currentY, 250, 120);

        currentY += 160;

        // --- DETAILED BREAKDOWN ---
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Detailed Location Analysis', 50, 50);
        currentY = 100;

        locationsData.forEach(loc => {
            if (currentY + 120 > doc.page.height - 50) {
                doc.addPage();
                doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK)
                   .text('Detailed Location Analysis (continued)', 50, 50);
                currentY = 100;
            }

            const classificationColor = getColorByClassification(loc.classification, COLORS);

            doc.roundedRect(50, currentY, doc.page.width - 100, 100, 5).fill(COLORS.SECONDARY);
            doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text(loc.location, 65, currentY + 15);
            doc.fontSize(10).font('Helvetica').fillColor(COLORS.TEXT_MUTED).text(`Samples Analyzed: ${loc.count}`, 65, currentY + 38);

            doc.fillColor(classificationColor).roundedRect(doc.page.width - 225, currentY + 15, 160, 25, 5).fill();
            doc.fillColor('#FFF').fontSize(11).font('Helvetica-Bold')
               .text(loc.classification.toUpperCase(), doc.page.width - 225, currentY + 22, { width: 160, align: 'center' });

            const indices = [
                { label: 'HPI', value: loc.hpi },
                { label: 'HEI', value: loc.hei },
                { label: 'PLI', value: loc.pli },
                { label: 'MPI', value: loc.mpi },
            ];

            indices.forEach((index, i) => {
                const x = 70 + i * 120;
                doc.fontSize(10).fillColor(COLORS.TEXT_MUTED).text(index.label, x, currentY + 60);
                doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text(index.value, x, currentY + 75);
            });

            currentY += 120;
        });

        // --- FOOTER ---
        doc.fontSize(8).fillColor(COLORS.TEXT_MUTED)
           .text(`Page ${doc.page.number}`, doc.page.width - 100, doc.page.height - 40);

        doc.end();
    })
    .catch(err => {
        console.error('❌ DB query failed:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate report' });
        }
        doc.end();
    });
}
