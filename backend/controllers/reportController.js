import db from '../db/db.js';
import PDFDocument from 'pdfkit';
import { getHEIClassification } from '../utils/classification.js';

// --- Helper function to draw a pie chart ---
function drawPieChart(doc, data, x, y, radius) {
    doc.fontSize(14).font('Helvetica-Bold').text('Site Classification Overview', x, y - radius - 40);

    let startAngle = 0;
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) {
        doc.fontSize(10).font('Helvetica').text('No data available for chart.', x, y);
        return;
    }

    const legendX = x + radius + 40;
    let legendY = y - radius / 2;

    data.forEach(item => {
        const sliceAngle = (item.count / total) * 360;
        const endAngle = startAngle + sliceAngle;

        doc.save()
           .moveTo(x, y)
           .arc(x, y, radius, startAngle, endAngle, false)
           .lineTo(x, y)
           .fill(item.color);
        doc.restore();
        
        // Draw Legend
        doc.rect(legendX, legendY, 10, 10).fill(item.color);
        doc.fontSize(10).font('Helvetica').fillColor('#000').text(`${item.label} (${item.count})`, legendX + 20, legendY);
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

export default function generateReport(req, res) {
    const { userId, role } = req.user;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="groundwater_report_${new Date().toISOString()}.pdf"`);
    doc.pipe(res);

    // --- Light Theme Colors ---
    const COLORS = {
        PRIMARY: '#FFFFFF',
        SECONDARY: '#F3F4F6', // Light Gray
        ACCENT: '#38BDF8',   // Sky Blue
        TEXT_DARK: '#1F2937', // Dark Gray
        TEXT_MUTED: '#6B7280', // Medium Gray
        SUCCESS: '#10B981',
        WARNING: '#F59E0B',
        DANGER: '#EF4444',
    };

    let query;
    let params;
    
    if (role === 'ngo' || role === 'researcher' || role === 'guest') {
        query = `
            SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
            FROM pollution_indices pi
            JOIN samples s ON pi.sample_id = s.sample_id
            JOIN locations l ON s.location_id = l.location_id
        `;
        params = [];
    } else {
         query = `
            SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
            FROM pollution_indices pi
            JOIN samples s ON pi.sample_id = s.sample_id
            JOIN locations l ON s.location_id = l.location_id
            WHERE s.user_id = $1
        `;
        params = [userId];
    }
    
    db.query(query, params)
    .then(result => {
        const rows = result.rows;

        // --- 1. HEADER SECTION ---
        doc.rect(0, 0, doc.page.width, 100).fill(COLORS.SECONDARY);
        doc.fillColor(COLORS.ACCENT)
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('Groundwater Insights Report', 50, 40);
        doc.fillColor(COLORS.TEXT_MUTED)
           .fontSize(10)
           .font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, 50, 75);
        doc.moveTo(50, 95).lineTo(doc.page.width - 50, 95).stroke(COLORS.ACCENT);

        let currentY = 140;

        // --- 2. DATA PROCESSING & SUMMARY ---
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

        let safeCount = 0, pollutedCount = 0, highlyPollutedCount = 0;
        locationsData.forEach(loc => {
            if (loc.classification === 'Safe') safeCount++;
            else if (loc.classification === 'Polluted') pollutedCount++;
            else highlyPollutedCount++;
        });

        // --- 3. SUMMARY PAGE (CHARTS) ---
        doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Report Summary', 50, currentY);
        currentY += 30;

        doc.fontSize(12).font('Helvetica').text(`Total Locations Analyzed: ${locationsData.length}`, 50, currentY);
        currentY += 80;

        const pieData = [
            { label: 'Safe', count: safeCount, color: COLORS.SUCCESS },
            { label: 'Polluted', count: pollutedCount, color: COLORS.WARNING },
            { label: 'Highly Polluted', count: highlyPollutedCount, color: COLORS.DANGER },
        ];
        drawPieChart(doc, pieData, 120, currentY, 60);

        const topPolluted = [...locationsData].sort((a, b) => b.hei - a.hei).slice(0, 5);
        const barData = topPolluted.map(loc => ({ label: loc.location, value: parseFloat(loc.hei), color: COLORS.DANGER }));
        drawBarChart(doc, barData, 300, currentY, 250, 120);
        
        // --- 4. DETAILED BREAKDOWN ---
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Detailed Location Analysis', 50, 50);
        currentY = 100;

        locationsData.forEach(loc => {
            let classificationColor;
            if (loc.classification === 'Safe') classificationColor = COLORS.SUCCESS;
            else if (loc.classification === 'Polluted') classificationColor = COLORS.WARNING;
            else classificationColor = COLORS.DANGER;

            if (currentY + 120 > doc.page.height - 50) {
                doc.addPage();
                doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Detailed Location Analysis (continued)', 50, 50);
                currentY = 100;
            }

            doc.roundedRect(50, currentY, doc.page.width - 100, 100, 5).fill(COLORS.SECONDARY);
            
            doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text(loc.location, 65, currentY + 15);
            doc.fontSize(10).font('Helvetica').fillColor(COLORS.TEXT_MUTED).text(`Samples Analyzed: ${loc.count}`, 65, currentY + 38);

            doc.fillColor(classificationColor).roundedRect(doc.page.width - 225, currentY + 15, 160, 25, 5).fill();
            doc.fillColor('#FFF').fontSize(11).font('Helvetica-Bold').text(loc.classification.toUpperCase(), doc.page.width - 225, currentY + 22, { width: 160, align: 'center' });

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

        doc.end();
    })
    .catch(err => {
        console.error('❌ DB query failed:', err.message);
        doc.end();
        res.status(500).json({ error: 'Failed to generate report' });
    });
}