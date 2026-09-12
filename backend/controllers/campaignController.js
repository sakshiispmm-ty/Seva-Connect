const campaignModel = require('../models/campaignModel');

/**
 * GET /api/campaigns
 * Public - List all campaigns with optional status and category filter
 */
async function getCampaigns(req, res) {
  try {
    const { status, category } = req.query;
    const campaignsRaw = await campaignModel.getAll({ status, category });

    const campaigns = campaignsRaw.map(c => ({
      ...c,
      target_amount: c.target_amount !== undefined ? c.target_amount : c.goal_amount,
      goal_amount: c.goal_amount !== undefined ? c.goal_amount : c.target_amount,
      start_date: c.start_date || c.created_at,
      end_date: c.end_date || c.deadline,
      deadline: c.deadline || c.end_date
    }));

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
      data: campaigns
    });
  } catch (error) {
    console.error('[Campaign Controller] getCampaigns error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns list.'
    });
  }
}

/**
 * GET /api/campaigns/:id
 * Public - Retrieve single campaign details with progress & stats
 */
async function getCampaign(req, res) {
  try {
    const { id } = req.params;
    const campaign = await campaignModel.getById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }

    const goal = parseFloat(campaign.goal_amount || campaign.target_amount) || 0;
    const collected = parseFloat(campaign.amount_collected) || 0;
    const progressPercentage = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;

    const enriched = {
      ...campaign,
      target_amount: campaign.target_amount !== undefined ? campaign.target_amount : campaign.goal_amount,
      goal_amount: campaign.goal_amount !== undefined ? campaign.goal_amount : campaign.target_amount,
      start_date: campaign.start_date || campaign.created_at,
      end_date: campaign.end_date || campaign.deadline,
      deadline: campaign.deadline || campaign.end_date,
      progressPercentage
    };

    return res.status(200).json({
      success: true,
      campaign: enriched,
      data: enriched
    });
  } catch (error) {
    console.error('[Campaign Controller] getCampaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign details.'
    });
  }
}

/**
 * POST /api/campaigns
 * Admin only - Create a new campaign
 */
async function createCampaign(req, res) {
  try {
    const { title, description, category, status } = req.body;
    const goal_amount = req.body.goal_amount !== undefined ? req.body.goal_amount : req.body.target_amount;
    const start_date = req.body.start_date;
    const deadline = req.body.deadline !== undefined ? req.body.deadline : req.body.end_date;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Campaign title is required (at least 3 characters).'
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Campaign description is required (at least 10 characters).'
      });
    }

    const goal = parseFloat(goal_amount);
    if (isNaN(goal) || goal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Goal amount must be a positive number greater than 0.'
      });
    }

    const validStatuses = ['Active', 'Completed', 'Closed'];
    const campaignStatus = status && validStatuses.includes(status) ? status : 'Active';

    const newCampaignId = await campaignModel.create({
      title,
      description,
      goal_amount: goal,
      start_date: start_date || null,
      deadline: deadline || null,
      category: category || 'General',
      status: campaignStatus,
      created_by: req.user.id
    });

    const createdCampaign = await campaignModel.getById(newCampaignId);
    const enriched = {
      ...createdCampaign,
      target_amount: createdCampaign.target_amount !== undefined ? createdCampaign.target_amount : createdCampaign.goal_amount,
      goal_amount: createdCampaign.goal_amount !== undefined ? createdCampaign.goal_amount : createdCampaign.target_amount,
      start_date: createdCampaign.start_date || createdCampaign.created_at,
      end_date: createdCampaign.end_date || createdCampaign.deadline,
      deadline: createdCampaign.deadline || createdCampaign.end_date
    };

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully.',
      campaign: enriched,
      data: enriched
    });
  } catch (error) {
    console.error('[Campaign Controller] createCampaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create campaign.'
    });
  }
}

/**
 * PUT /api/campaigns/:id
 * Admin only - Update campaign details or status
 */
async function updateCampaign(req, res) {
  try {
    const { id } = req.params;
    const existing = await campaignModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }

    const { title, description, category, status } = req.body;
    const goal_amount = req.body.goal_amount !== undefined ? req.body.goal_amount : req.body.target_amount;
    const start_date = req.body.start_date;
    const deadline = req.body.deadline !== undefined ? req.body.deadline : req.body.end_date;

    if (status && !['Active', 'Completed', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be Active, Completed, or Closed.'
      });
    }

    if (goal_amount !== undefined && (isNaN(parseFloat(goal_amount)) || parseFloat(goal_amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Goal amount must be a positive number.'
      });
    }

    await campaignModel.update(id, {
      title,
      description,
      goal_amount: goal_amount !== undefined ? parseFloat(goal_amount) : undefined,
      start_date,
      deadline,
      category,
      status
    });

    const updated = await campaignModel.getById(id);
    const enriched = {
      ...updated,
      target_amount: updated.target_amount !== undefined ? updated.target_amount : updated.goal_amount,
      goal_amount: updated.goal_amount !== undefined ? updated.goal_amount : updated.target_amount,
      start_date: updated.start_date || updated.created_at,
      end_date: updated.end_date || updated.deadline,
      deadline: updated.deadline || updated.end_date
    };

    return res.status(200).json({
      success: true,
      message: 'Campaign updated successfully.',
      campaign: enriched,
      data: enriched
    });
  } catch (error) {
    console.error('[Campaign Controller] updateCampaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update campaign.'
    });
  }
}

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign
};
