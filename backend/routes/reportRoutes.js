const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getDonationSummary,
  getDonationsByPeriod,
  getDonationsByCampaign,
  getCampaignsSummary,
  getCampaignPerformance,
  getVolunteersSummary,
  getVolunteerActivity,
  getBeneficiariesSummary,
  getBeneficiariesByCategory,
  getInventorySummary,
  getLowStockReport,
  getItemHistory,
  getDashboardPayload,
  getIntelligentInsights
} = require('../controllers/reportController');

// All report routes are strictly read-only and Admin-only
router.use(verifyToken);
router.use(requireRole('Admin'));

// 0. Version 3.1: Intelligent Analytics Insights (/api/reports/insights)
router.get('/insights', getIntelligentInsights);

// 1. Donation Reports (/api/reports/donations/*)
router.get('/donations/summary', getDonationSummary);
router.get('/donations/by-period', getDonationsByPeriod);
router.get('/donations/by-campaign', getDonationsByCampaign);

// 2. Campaign Analytics (/api/reports/campaigns/*)
router.get('/campaigns/summary', getCampaignsSummary);
router.get('/campaigns/:id/performance', getCampaignPerformance);

// 3. Volunteer Reports (/api/reports/volunteers/*)
router.get('/volunteers/summary', getVolunteersSummary);
router.get('/volunteers/:id', getVolunteerActivity);

// 4. Beneficiary Reports (/api/reports/beneficiaries/*)
router.get('/beneficiaries/summary', getBeneficiariesSummary);
router.get('/beneficiaries/by-category', getBeneficiariesByCategory);

// 5. Inventory Reports (/api/reports/inventory/*)
router.get('/inventory/summary', getInventorySummary);
router.get('/inventory/low-stock', getLowStockReport);
router.get('/inventory/:id/history', getItemHistory);

// 6. Executive Dashboard Combined Endpoint (/api/reports/dashboard)
router.get('/dashboard', getDashboardPayload);

module.exports = router;
