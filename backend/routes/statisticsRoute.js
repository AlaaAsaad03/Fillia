import express from 'express';
import {
    casesHelpedByUser,
    casesDeliveredPerDay,
    revenuePerDay,
    caseAcceptanceStatus,
    countRegisteredUsers,
    dailyCaseCreation,
    totalRevenue,
    mostOrderedItems,
    countHelpedCases,
    getAdminStatistics
} from '../controllers/statisticsController.js';
import { authMiddleware } from '../middleware/auth.js';
const statisticsRouter = express.Router();

statisticsRouter.get('/cases-helped', casesHelpedByUser);
statisticsRouter.get('/cases-delivered', casesDeliveredPerDay);
statisticsRouter.get('/revenue-per-day', revenuePerDay);
statisticsRouter.get('/case-acceptance-status', caseAcceptanceStatus);
statisticsRouter.get('/registered-users', countRegisteredUsers);
statisticsRouter.get('/daily-case-creation', dailyCaseCreation);
statisticsRouter.get('/total-revenue', totalRevenue);
statisticsRouter.get('/most-ordered-items', mostOrderedItems);
statisticsRouter.get('/cases/helped/count', countHelpedCases);
statisticsRouter.get("/Admin-stat", authMiddleware, getAdminStatistics);


export default statisticsRouter;