const reportModel = require('../models/reportModel');

/**
 * Controller for Version 2.2 — Reports + Analytics
 * All endpoints are Admin-only and read-only.
 */

// 1. Donation Reports: Summary
async function getDonationSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportModel.getDonationSummary({ startDate, endDate });
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Report Controller] getDonationSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate donation summary report.'
    });
  }
}

// 1. Donation Reports: Trend by Period
async function getDonationsByPeriod(req, res) {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const validGroupBy = ['day', 'week', 'month'].includes(groupBy) ? groupBy : 'day';
    const trend = await reportModel.getDonationsByPeriod({
      startDate,
      endDate,
      groupBy: validGroupBy
    });
    return res.status(200).json({
      success: true,
      groupBy: validGroupBy,
      data: trend
    });
  } catch (error) {
    console.error('[Report Controller] getDonationsByPeriod error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate donation trend report.'
    });
  }
}

// 1. Donation Reports: By Campaign
async function getDonationsByCampaign(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportModel.getDonationsByCampaign({ startDate, endDate });
    return res.status(200).json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    console.error('[Report Controller] getDonationsByCampaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate donations by campaign report.'
    });
  }
}

// 2. Campaign Analytics: Summary
async function getCampaignsSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportModel.getCampaignsSummary({ startDate, endDate });
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Report Controller] getCampaignsSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate campaign analytics summary.'
    });
  }
}

// 2. Campaign Analytics: Single Campaign Performance
async function getCampaignPerformance(req, res) {
  try {
    const { id } = req.params;
    const performance = await reportModel.getCampaignPerformance(id);
    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }
    return res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('[Report Controller] getCampaignPerformance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign performance metrics.'
    });
  }
}

// 3. Volunteer Reports: Summary
async function getVolunteersSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportModel.getVolunteersSummary({ startDate, endDate });
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Report Controller] getVolunteersSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate volunteer activity summary.'
    });
  }
}

// 3. Volunteer Reports: Single Volunteer Activity
async function getVolunteerActivity(req, res) {
  try {
    const { id } = req.params;
    const report = await reportModel.getVolunteerActivity(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer profile not found.'
      });
    }
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[Report Controller] getVolunteerActivity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer activity details.'
    });
  }
}

// 4. Beneficiary Reports: Summary
async function getBeneficiariesSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const summary = await reportModel.getBeneficiariesSummary({ startDate, endDate });
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Report Controller] getBeneficiariesSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate beneficiary assistance report.'
    });
  }
}

// 4. Beneficiary Reports: By Category
async function getBeneficiariesByCategory(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportModel.getBeneficiariesByCategory({ startDate, endDate });
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[Report Controller] getBeneficiariesByCategory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate beneficiary category breakdown.'
    });
  }
}

// 5. Inventory Reports: Summary
async function getInventorySummary(req, res) {
  try {
    const summary = await reportModel.getInventorySummary();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Report Controller] getInventorySummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate inventory resources report.'
    });
  }
}

// 5. Inventory Reports: Low Stock Alert List
async function getLowStockReport(req, res) {
  try {
    const list = await reportModel.getLowStockReport();
    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('[Report Controller] getLowStockReport error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock report.'
    });
  }
}

// 5. Inventory Reports: Item History
async function getItemHistory(req, res) {
  try {
    const { id } = req.params;
    const history = await reportModel.getItemHistory(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found.'
      });
    }
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('[Report Controller] getItemHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item history.'
    });
  }
}

// 6. Dashboard Combined Payload
async function getDashboardPayload(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const dashboardData = await reportModel.getDashboardPayload({ startDate, endDate });
    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('[Report Controller] getDashboardPayload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compile executive analytics dashboard data.'
    });
  }
}

module.exports = {
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
  getDashboardPayload
};
