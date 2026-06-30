import fs from 'fs';
import { uploadQueue } from '../queues/uploadQueue.js';
import { logger } from '../config/logger.js';

export default async function handleUpload(req, res, next) {
  const userId = req.user?.userId ?? null;
  const userRole = req.user?.role ?? null;
  const isGeneralUser = userRole === 'general' || userRole === 'guest';
  const { date: historicalDate } = req.body;
  const filePath = req.file?.path;
  const isHistoricalRoute = req.path.includes('/historical');
  const shouldPersist = !isHistoricalRoute && !isGeneralUser;

  if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

  const returnValidationError = (status, errorMsg) => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        logger.error('Failed to delete temp file on validation error:', err);
      }
    }
    return res.status(status).json({ error: errorMsg });
  };

  // Route validation parameters preserved
  if (isHistoricalRoute) {
    if (!historicalDate) {
      return returnValidationError(400, 'Date is required for historical uploads.');
    }
    const selectedDate = new Date(historicalDate);
    if (Number.isNaN(selectedDate.getTime())) {
      return returnValidationError(400, 'Invalid historical date.');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate >= today) {
      return returnValidationError(400, 'Historical data can only be uploaded for past dates.');
    }
  }

  try {
    logger.info(`Enqueuing background processing task for file: ${filePath}`);

    // 🚀 Instantly dispatch to Redis job queue and respond to the client
    const job = await uploadQueue.add('process-csv', {
      filePath,
      historicalDate,
      userId,
      userRole,
      isHistoricalRoute,
      shouldPersist,
      isGeneralUser,
      socketId: req.headers['x-socket-id'] || null // Capture client tab ID for targeted live alerts
    });

    return res.status(202).json({
      success: true,
      message: 'File uploaded successfully. Heavy analysis is running in the background.',
      jobId: job.id
    });
  } catch (err) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(err);
  }
} 
