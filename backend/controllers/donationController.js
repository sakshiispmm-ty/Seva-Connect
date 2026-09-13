const donationModel = require('../models/donationModel');
const campaignModel = require('../models/campaignModel');
const notificationModel = require('../models/notificationModel');
const { EMAIL_REGEX, PHONE_REGEX } = require('../utils/validationUtils');

/**
 * POST /api/donations
 * Public/Donor - Register intent to donate (No payment gateway)
 */
async function registerDonation(req, res) {
  try {
    const {
      donor_name,
      donor_email,
      donor_phone,
      campaign_id,
      donation_type,
      amount,
      item_description,
      item_quantity,
      notes
    } = req.body;

    // 1. Validate donor name and email
    if (!donor_name || typeof donor_name !== 'string' || donor_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Donor full name is required (at least 2 characters).'
      });
    }

    if (!donor_email || typeof donor_email !== 'string' || !EMAIL_REGEX.test(donor_email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (donor_phone && typeof donor_phone === 'string' && !PHONE_REGEX.test(donor_phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact phone number.'
      });
    }

    // 2. Validate donation type
    const normalizedType = donation_type === 'Items' ? 'Item' : donation_type;
    if (!normalizedType || !['Money', 'Item'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Donation type must be either "Money" or "Item".'
      });
    }

    // 3. Type-specific validation
    let numAmount = null;
    if (normalizedType === 'Money') {
      numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid donation amount greater than 0.'
        });
      }
    } else {
      if (!item_description || typeof item_description !== 'string' || item_description.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a description of the items being donated (at least 3 characters).'
        });
      }
    }

    // 4. Validate campaign if provided
    let verifiedCampaignId = null;
    if (campaign_id) {
      const camp = await campaignModel.getById(campaign_id);
      if (!camp) {
        return res.status(404).json({
          success: false,
          message: 'The selected campaign does not exist.'
        });
      }
      if (camp.status === 'Closed') {
        return res.status(400).json({
          success: false,
          message: 'This campaign is closed and no longer accepting donations.'
        });
      }
      verifiedCampaignId = camp.id;
    }

    // 5. Check if authenticated user ID is available
    const donorId = req.user ? req.user.id : null;

    const finalItemQuantity = item_quantity || (req.body.quantity ? `${req.body.quantity} ${req.body.unit || 'units'}` : null);

    // 6. Create donation registration
    const result = await donationModel.create({
      donor_id: donorId,
      donor_name: donor_name.trim(),
      donor_email: donor_email.trim().toLowerCase(),
      donor_phone: donor_phone ? donor_phone.trim() : '',
      campaign_id: verifiedCampaignId,
      donation_type: normalizedType,
      amount: numAmount,
      item_description: item_description ? item_description.trim() : null,
      item_quantity: finalItemQuantity ? String(finalItemQuantity).trim() : null,
      notes: notes ? notes.trim() : ''
    });

    const donation = await donationModel.getById(result.id);

    // Notify admins about new donation
    try {
      await notificationModel.notifyAdmins({
        type: 'NewDonation',
        title: 'New Donation Registered',
        message: `${donation.donor_name} registered a ${donation.donation_type} donation (${donation.token}).`,
        reference_id: donation.id,
        reference_type: 'Donation'
      });
    } catch (notifErr) {
      console.error('[Donation Controller] notifyAdmins error:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Donation registered successfully! Your tracking token has been generated.',
      token: result.token,
      donation,
      data: donation
    });
  } catch (error) {
    console.error('[Donation Controller] registerDonation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register donation. Please try again.'
    });
  }
}

/**
 * GET /api/donations/my
 * Authenticated Donor - Retrieve personal donation history
 */
async function getMyDonations(req, res) {
  try {
    const donorId = req.user.id;
    const donations = await donationModel.getByDonor(donorId);

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
      data: donations
    });
  } catch (error) {
    console.error('[Donation Controller] getMyDonations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal donation history.'
    });
  }
}

/**
 * GET /api/donations/token/:token
 * Public/Authenticated - Lookup donation details by token
 */
async function getDonationByToken(req, res) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Donation token is required.'
      });
    }

    const donation = await donationModel.getByToken(token);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: `No donation found matching token "${token}".`
      });
    }

    return res.status(200).json({
      success: true,
      donation,
      data: donation
    });
  } catch (error) {
    console.error('[Donation Controller] getDonationByToken error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to look up donation by token.'
    });
  }
}

/**
 * GET /api/donations
 * Admin only - List all donations with filters & token search
 */
async function getDonations(req, res) {
  try {
    const { status, campaign_id, campaign, donation_type, type, search, searchToken } = req.query;
    const donations = await donationModel.getAll({
      status,
      campaign_id,
      campaign,
      donation_type,
      type,
      search,
      searchToken
    });

    const stats = await donationModel.getStats();

    return res.status(200).json({
      success: true,
      count: donations.length,
      stats,
      donations,
      data: donations
    });
  } catch (error) {
    console.error('[Donation Controller] getDonations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donations list.'
    });
  }
}

/**
 * PUT /api/donations/:id/verify
 * Admin only - Move status from 'Pending Verification' to 'Verified'
 */
async function verifyDonation(req, res) {
  try {
    const { id } = req.params;
    const donation = await donationModel.getById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.'
      });
    }

    if (donation.status === 'Completed') {
      return res.status(200).json({
        success: true,
        message: `Donation ${donation.token} is already completed.`,
        donation,
        data: donation
      });
    }

    if (donation.status === 'Verified') {
      return res.status(200).json({
        success: true,
        message: `Donation ${donation.token} is already verified.`,
        donation,
        data: donation
      });
    }

    if (donation.status !== 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: `Cannot verify donation: current status is "${donation.status}".`
      });
    }

    await donationModel.updateStatus(id, 'Verified', req.user.id);
    const updated = await donationModel.getById(id);

    // Notify donor if registered
    if (updated.donor_id) {
      try {
        await notificationModel.create({
          user_id: updated.donor_id,
          type: 'DonationVerified',
          title: 'Donation Verified',
          message: `Your donation (${updated.token}) has been verified. Thank you for your support!`,
          reference_id: updated.id,
          reference_type: 'Donation'
        });
      } catch (err) {
        console.error('[Donation Controller] verify notification error:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Donation ${updated.token} has been verified successfully.`,
      donation: updated,
      data: updated
    });
  } catch (error) {
    console.error('[Donation Controller] verifyDonation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify donation.'
    });
  }
}

/**
 * PUT /api/donations/:id/reject
 * Admin only - Move status from 'Pending Verification' to 'Rejected'
 */
async function rejectDonation(req, res) {
  try {
    const { id } = req.params;
    const donation = await donationModel.getById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.'
      });
    }

    if (donation.status !== 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject donation: current status is "${donation.status}". Only "Pending Verification" donations can be rejected.`
      });
    }

    await donationModel.updateStatus(id, 'Rejected', req.user.id);
    const updated = await donationModel.getById(id);

    // Notify donor if registered
    if (updated.donor_id) {
      try {
        await notificationModel.create({
          user_id: updated.donor_id,
          type: 'DonationRejected',
          title: 'Donation Update',
          message: `Your donation (${updated.token}) could not be verified and was rejected. Please contact support.`,
          reference_id: updated.id,
          reference_type: 'Donation'
        });
      } catch (err) {
        console.error('[Donation Controller] reject notification error:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Donation ${updated.token} has been marked as rejected.`,
      donation: updated,
      data: updated
    });
  } catch (error) {
    console.error('[Donation Controller] rejectDonation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject donation.'
    });
  }
}

/**
 * PUT /api/donations/:id/complete
 * Admin only - Move status from 'Verified' to 'Completed'
 * Only 'Completed' donations count toward campaign amount_collected
 */
async function completeDonation(req, res) {
  try {
    const { id } = req.params;
    const donation = await donationModel.getById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.'
      });
    }

    if (donation.status === 'Completed') {
      return res.status(200).json({
        success: true,
        message: `Donation ${donation.token} is already marked as Completed.`,
        donation,
        data: donation
      });
    }

    if (donation.status !== 'Verified' && donation.status !== 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete donation: current status is "${donation.status}".`
      });
    }

    await donationModel.updateStatus(id, 'Completed', req.user.id);
    const updated = await donationModel.getById(id);

    return res.status(200).json({
      success: true,
      message: `Donation ${updated.token} marked as Completed. Funds are now reflected in campaign totals.`,
      donation: updated,
      data: updated
    });
  } catch (error) {
    console.error('[Donation Controller] completeDonation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete donation.'
    });
  }
}

/**
 * GET /api/donations/:id/receipt
 * Authenticated - Generate/retrieve digital receipt
 * Only available for 'Verified' or 'Completed' donations
 */
async function getReceipt(req, res) {
  try {
    const { id } = req.params;
    const donation = isNaN(id) ? await donationModel.getByToken(id) : await donationModel.getById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found.'
      });
    }

    // Access control: User must be admin or the original donor
    const isAdmin = req.user.role === 'Admin';
    const isDonor = donation.donor_id === req.user.id || donation.donor_email === req.user.email;

    if (!isAdmin && !isDonor) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this donation receipt.'
      });
    }

    // Receipt available only once Verified or Completed
    if (donation.status === 'Pending Verification') {
      return res.status(400).json({
        success: false,
        message: 'Receipt is not yet available. This donation is pending administrative verification.'
      });
    }

    if (donation.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'No receipt available for rejected donations.'
      });
    }

    const receiptNumber = `REC-${donation.token.replace('SC-DON-', '')}`;

    const receipt = {
      receiptNumber,
      receipt_number: receiptNumber,
      token: donation.token,
      status: donation.status,
      dateIssued: donation.verified_at || donation.updated_at,
      verified_at: donation.verified_at || donation.updated_at,
      created_at: donation.created_at,
      donor_name: donation.donor_name,
      donor_email: donation.donor_email,
      donor_phone: donation.donor_phone || 'N/A',
      donor_pan: donation.donor_pan || null,
      campaign_title: donation.campaign_title || 'General Community Relief Fund',
      campaign_category: donation.campaign_category || 'Relief',
      donation_type: donation.donation_type,
      amount: donation.amount,
      item_description: donation.item_description,
      quantity: donation.item_quantity,
      unit: 'units',
      notes: donation.notes,
      donor: {
        name: donation.donor_name,
        email: donation.donor_email,
        phone: donation.donor_phone || 'N/A'
      },
      donation: {
        type: donation.donation_type,
        amount: donation.donation_type === 'Money' ? `₹${parseFloat(donation.amount).toLocaleString('en-IN')}` : null,
        numericAmount: donation.amount,
        itemDescription: donation.donation_type === 'Item' ? donation.item_description : null,
        itemQuantity: donation.donation_type === 'Item' ? donation.item_quantity : null,
        notes: donation.notes || 'None'
      },
      campaign: donation.campaign_title ? {
        id: donation.campaign_id,
        title: donation.campaign_title,
        category: donation.campaign_category
      } : null,
      verification: {
        verifiedBy: donation.verifier_name || 'Authorized NGO Officer',
        verifiedAt: donation.verified_at
      },
      organization: {
        name: 'SevaConnect NGO Network',
        tagline: 'Connecting NGOs, Donors & Communities',
        taxStatus: 'Eligible for 80G Tax Exemption'
      }
    };

    return res.status(200).json({
      success: true,
      receipt,
      data: receipt
    });
  } catch (error) {
    console.error('[Donation Controller] getReceipt error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate digital receipt.'
    });
  }
}

module.exports = {
  registerDonation,
  getMyDonations,
  getDonationByToken,
  getDonations,
  verifyDonation,
  rejectDonation,
  completeDonation,
  getReceipt
};
