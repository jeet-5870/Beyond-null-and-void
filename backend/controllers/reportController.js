import db from '../db/db.js';
import PDFDocument from 'pdfkit';
import { getHEIClassification } from '../utils/classification.js';

// =============================================================================
// --- Helper Functions ---
// =============================================================================

/**
 * Converts an angle from degrees to radians.
 * @param {number} angle - The angle in degrees.
 * @returns {number} The angle in radians.
 */
const toRadians = (angle) => (angle * Math.PI) / 180;

/**
 * Adds a standard footer with the current page number to the document.
 * @param {PDFDocument} doc - The PDF document instance.
 * @param {object} COLORS - The application's color palette.
 */
const addFooter = (doc, COLORS) => {
    doc.fontSize(8).fillColor(COLORS.TEXT_MUTED)
        .text(`Page ${doc.page.number}`, 50, doc.page.height - 40, {
            align: 'right',
            width: doc.page.width - 100
        });
};

/**
 * Draws a pie chart with a legend on the PDF document.
 * @param {PDFDocument} doc - The PDF document instance.
 * @param {Array<object>} data - The data for the chart.
 * @param {number} x - The center x-coordinate of the pie chart.
 * @param {number} y - The center y-coordinate of the pie chart.
 * @param {number} radius - The radius of the pie chart.
 */
function drawPieChart(doc, data, x, y, radius) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text('Site Classification Overview', x - radius, y - radius - 40, { width: radius * 2, align: 'center' });

    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) {
        doc.fontSize(10).font('Helvetica').text('No data available for chart.', x - radius, y, { width: radius * 2, align: 'center' });
        return;
    }

    let startAngle = 0;
    const legendX = x + radius + 60;
    let legendY = y - radius + 10;

    data.forEach(item => {
        const sliceAngle = (item.count / total) * 360;
        const endAngle = startAngle + sliceAngle;

        doc.save()
            .moveTo(x, y)
            .arc(x, y, radius, toRadians(startAngle), toRadians(endAngle), false)
            .lineTo(x, y)
            .fill(item.color)
            .restore();

        doc.rect(legendX, legendY, 10, 10).fill(item.color);
        doc.fontSize(10).font('Helvetica').fillColor('#000')
            .text(`${item.label} (${item.count})`, legendX + 20, legendY);
        legendY += 20;

        startAngle = endAngle;
    });
}

/**
 * Draws a bar chart on the PDF document.
 * @param {PDFDocument} doc - The PDF document instance.
 * @param {Array<object>} data - The data for the chart.
 * @param {number} x - The top-left x-coordinate of the chart area.
 * @param {number} y - The top-left y-coordinate of the chart area.
 * @param {number} width - The total width of the chart area.
 * @param {number} height - The total height of the chart area.
 */
function drawBarChart(doc, data, x, y, width, height) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text('Top 5 Polluted Locations (by HEI)', x, y - 40);

    if (data.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No data available for chart.', x, y);
        return;
    }

    const barSpacing = 20;
    const barWidth = (width - (barSpacing * (data.length - 1))) / data.length;
    const maxVal = Math.max(...data.map(item => item.value), 0);
    const scale = maxVal > 0 ? height / maxVal : 0;

    doc.fontSize(8).fillColor('#555');

    data.forEach((item, i) => {
        const barHeight = item.value * scale;
        const barX = x + i * (barWidth + barSpacing);
        const barY = y + height - barHeight;

        doc.rect(barX, barY, barWidth, barHeight).fill(item.color);
        doc.fillColor('#000').text(item.value.toFixed(2), barX, barY - 12, { width: barWidth, align: 'center' });
        doc.text(item.label, barX - 10, y + height + 5, { width: barWidth + 20, align: 'center' });
    });
}

/**
 * Returns a color based on the classification string.
 * @param {string} classification - The classification ('Safe', 'Polluted', etc.).
 * @param {object} COLORS - The color palette.
 * @returns {string} The hex color code.
 */
function getColorByClassification(classification, COLORS) {
    const colorMap = {
        'Safe': COLORS.SUCCESS,
        'Polluted': COLORS.WARNING,
        'Highly Polluted': COLORS.DANGER,
    };
    return colorMap[classification] || COLORS.DANGER; // Default to danger color
}

// =============================================================================
// --- Main Route Handler for Report Generation ---
// =============================================================================

export default function generateReport(req, res) {
    const { userId, role } = req.user;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set HTTP headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="groundwater_report_${new Date().toISOString()}.pdf"`);

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    const COLORS = {
        PRIMARY: '#FFFFFF', SECONDARY: '#F3F4F6', ACCENT: '#38BDF8',
        TEXT_DARK: '#1F2937', TEXT_MUTED: '#6B7280', SUCCESS: '#10B981',
        WARNING: '#F59E0B', DANGER: '#EF4444',
    };

    // --- 1. Database Query ---
    let baseQuery = `
        SELECT l.name AS location, pi.hpi, pi.hei, pi.pli, pi.mpi
        FROM pollution_indices pi
        JOIN samples s ON pi.sample_id = s.sample_id
        JOIN locations l ON s.location_id = l.location_id`;
    const params = [];

    // Append a WHERE clause for non-privileged users to filter by their own data
    if (!['ngo', 'researcher', 'guest'].includes(role)) {
        baseQuery += ` WHERE s.user_id = $1`;
        params.push(userId);
    }

    db.query(baseQuery, params)
        .then(result => {
            try {
                // --- 2. Data Processing ---
                const rows = result.rows;

                const grouped = {};
                rows.forEach(row => {
                    if (!grouped[row.location]) {
                        grouped[row.location] = { hpi: 0, hei: 0, pli: 0, mpi: 0, count: 0 };
                    }
                    // Use parseFloat() and default to 0 to prevent NaN errors from null/bad data
                    grouped[row.location].hpi += parseFloat(row.hpi) || 0;
                    grouped[row.location].hei += parseFloat(row.hei) || 0;
                    grouped[row.location].pli += parseFloat(row.pli) || 0;
                    grouped[row.location].mpi += parseFloat(row.mpi) || 0;
                    grouped[row.location].count += 1;
                });

                const locationsData = Object.entries(grouped).map(([location, vals]) => {
                    const avgHei = vals.count > 0 ? vals.hei / vals.count : 0;
                    return {
                        location,
                        hpi: (vals.count > 0 ? vals.hpi / vals.count : 0).toFixed(2),
                        hei: avgHei.toFixed(2),
                        pli: (vals.count > 0 ? vals.pli / vals.count : 0).toFixed(2),
                        mpi: (vals.count > 0 ? vals.mpi / vals.count : 0).toFixed(2),
                        count: vals.count,
                        classification: getHEIClassification(avgHei),
                    };
                });

                // --- 3. PDF Generation: Page 1 (Header & Summary) ---
                doc.rect(0, 0, doc.page.width, 100).fill(COLORS.SECONDARY);
                doc.fillColor(COLORS.ACCENT).fontSize(28).font('Helvetica-Bold').text('Groundwater Insights Report', 50, 40);
                doc.fillColor(COLORS.TEXT_MUTED).fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 50, 75);
                doc.moveTo(50, 95).lineTo(doc.page.width - 50, 95).stroke(COLORS.ACCENT);

                let currentY = 140;
                doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Report Summary', 50, currentY);
                currentY += 30;
                doc.fontSize(12).font('Helvetica').text(`Total Unique Locations Analyzed: ${locationsData.length}`, 50, currentY);
                currentY += 80;

                const classificationCounts = {
                    Safe: locationsData.filter(loc => loc.classification === 'Safe').length,
                    Polluted: locationsData.filter(loc => loc.classification === 'Polluted').length,
                    'Highly Polluted': locationsData.filter(loc => loc.classification === 'Highly Polluted').length,
                };
                drawPieChart(doc, [
                    { label: 'Safe', count: classificationCounts.Safe, color: COLORS.SUCCESS },
                    { label: 'Polluted', count: classificationCounts.Polluted, color: COLORS.WARNING },
                    { label: 'Highly Polluted', count: classificationCounts['Highly Polluted'], color: COLORS.DANGER },
                ], 120, currentY, 60);

                const topPolluted = [...locationsData].sort((a, b) => b.hei - a.hei).slice(0, 5);
                drawBarChart(doc, topPolluted.map(loc => ({ label: loc.location, value: parseFloat(loc.hei), color: COLORS.DANGER })), 300, currentY, 250, 120);

                // --- 4. PDF Generation: Detailed Analysis Pages ---
                if (locationsData.length > 0) {
                    addFooter(doc, COLORS); // Add footer to the summary page
                    doc.addPage();
                    doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Detailed Location Analysis', 50, 50);
                    currentY = 100;

                    locationsData.forEach(loc => {
                        // Check if a new page is needed BEFORE drawing the content
                        if (currentY + 120 > doc.page.height - 50) {
                            addFooter(doc, COLORS); // Add footer to the completed page
                            doc.addPage();
                            doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text('Detailed Location Analysis (continued)', 50, 50);
                            currentY = 100;
                        }

                        // Draw the location details card
                        const cardColor = getColorByClassification(loc.classification, COLORS);
                        doc.roundedRect(50, currentY, doc.page.width - 100, 100, 5).fill(COLORS.SECONDARY);
                        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text(loc.location, 65, currentY + 15);
                        doc.fontSize(10).font('Helvetica').fillColor(COLORS.TEXT_MUTED).text(`Samples Analyzed: ${loc.count}`, 65, currentY + 38);
                        
                        // Draw classification badge
                        doc.fillColor(cardColor).roundedRect(doc.page.width - 225, currentY + 15, 160, 25, 5).fill();
                        doc.fillColor('#FFF').fontSize(11).font('Helvetica-Bold').text(loc.classification.toUpperCase(), doc.page.width - 225, currentY + 22, { width: 160, align: 'center' });
                        
                        // Draw pollution indices
                        [{ label: 'HPI', value: loc.hpi }, { label: 'HEI', value: loc.hei }, { label: 'PLI', value: loc.pli }, { label: 'MPI', value: loc.mpi }]
                            .forEach((index, i) => {
                                const x = 70 + i * 120;
                                doc.fontSize(10).fillColor(COLORS.TEXT_MUTED).text(index.label, x, currentY + 60);
                                doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.TEXT_DARK).text(index.value, x, currentY + 75);
                            });

                        currentY += 120;
                    });
                }
                
                // --- 5. Finalization ---
                addFooter(doc, COLORS); // Add footer to the very last page
                doc.end(); // Finalize the PDF and send it to the client

            } catch (err) {
                console.error('❌ PDF generation failed:', err);
                doc.end(); // Attempt to close the stream on error
            }
        })
        .catch(err => {
            console.error('❌ DB query failed:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate report' });
            }
            doc.end(); // Ensure the doc stream is closed on DB error
        });
}