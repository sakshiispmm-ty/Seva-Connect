const { query } = require('../config/db');

/**
 * GET /api/recommendations/campaigns
 * Access: Authenticated Donor (or Admin)
 * Heuristic:
 * 1. Identify categories of campaigns the donor has previously contributed to.
 * 2. Filter active campaigns, excluding any campaigns the donor already donated to.
 * 3. Rank:
 *    a. Campaigns in categories the donor previously supported (+100 points).
 *    b. Nearest deadline (earliest deadline first).
 *    c. Lowest funding progress percentage (underfunded appeals needing priority).
 */
async function getRecommendedCampaigns(req, res) {
  try {
    const donorId = req.user.id;
    const donorEmail = (req.user.email || '').toLowerCase();

    // 1. Fetch donor's past donations to discover supported categories and campaign IDs
    const [pastDonations] = await query(
      `SELECT d.campaign_id, c.category
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       WHERE (d.donor_id = ? OR LOWER(d.donor_email) = ?) AND d.campaign_id IS NOT NULL`,
      [donorId, donorEmail]
    );

    const supportedCampaignIds = new Set(
      pastDonations.map(p => p.campaign_id).filter(Boolean)
    );

    const preferredCategories = new Set(
      pastDonations.map(p => p.category).filter(Boolean)
    );

    // 2. Fetch all active campaigns
    const [activeCampaigns] = await query(
      `SELECT c.id, c.title, c.description, c.goal_amount, c.start_date, c.deadline, c.category, c.status, c.image_url,
              COALESCE(SUM(CASE WHEN d.status IN ('Verified', 'Completed') THEN d.amount ELSE 0 END), 0) as raised_amount,
              COUNT(DISTINCT d.id) as donation_count
       FROM campaigns c
       LEFT JOIN donations d ON c.id = d.campaign_id AND d.donation_type = 'Money'
       WHERE c.status = 'Active'
       GROUP BY c.id`
    );

    // 3. Exclude campaigns the donor already contributed to
    const eligibleCampaigns = activeCampaigns.filter(c => !supportedCampaignIds.has(c.id));

    // If donor has donated to all active campaigns, fall back to showing other active campaigns
    const candidateList = eligibleCampaigns.length > 0 ? eligibleCampaigns : activeCampaigns;

    const now = new Date();

    // 4. Score and rank candidates
    const scoredList = candidateList.map(campaign => {
      const goal = parseFloat(campaign.goal_amount) || 1;
      const raised = parseFloat(campaign.raised_amount) || 0;
      const progressPercent = Math.min(Math.round((raised / goal) * 100), 100);

      let score = 0;
      let reasons = [];

      // Reason 1: Category preference match
      if (preferredCategories.has(campaign.category)) {
        score += 50;
        reasons.push(`Matches your interest in ${campaign.category}`);
      }

      // Reason 2: Approaching deadline
      if (campaign.deadline) {
        const deadlineDate = new Date(campaign.deadline);
        const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 45) {
          score += 30;
          reasons.push(`Urgent: ${daysLeft} days remaining`);
        } else if (daysLeft > 0) {
          score += Math.max(10, 30 - Math.floor(daysLeft / 5));
        }
      }

      // Reason 3: Underfunded priority
      if (progressPercent < 40) {
        score += 20;
        reasons.push(`High funding need (${progressPercent}% achieved)`);
      } else if (progressPercent < 75) {
        score += 10;
        reasons.push(`${progressPercent}% funded`);
      }

      if (reasons.length === 0) {
        reasons.push('Community Relief Initiative');
      }

      return {
        ...campaign,
        raised_amount: raised,
        goal_amount: goal,
        progress_percent: progressPercent,
        score,
        match_reason: reasons[0],
        match_tags: reasons
      };
    });

    // Sort descending by score, then by progress percentage ascending (neediest first)
    scoredList.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.progress_percent - b.progress_percent;
    });

    const recommendations = scoredList.slice(0, 4);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
      heuristic: 'Category affinity + Deadline urgency + Goal progress prioritization'
    });
  } catch (error) {
    console.error('[Recommendation Controller] getRecommendedCampaigns error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate campaign recommendations.'
    });
  }
}

/**
 * GET /api/recommendations/tasks
 * Access: Authenticated Volunteer (or Admin)
 * Heuristic:
 * 1. Retrieve the volunteer's registered skills and interests from volunteer_profiles.
 * 2. Find open, unassigned assistance requests (assigned_volunteer_id IS NULL and status IN ('Approved', 'Resources Allocated', 'Submitted')).
 * 3. Match volunteer skills against request category and description keywords.
 * 4. Rank by skill match score, then urgency (High > Medium > Low), then deadline.
 */
async function getSuggestedTasks(req, res) {
  try {
    const userId = req.user.id;

    // 1. Fetch volunteer's profile
    const [profiles] = await query(
      'SELECT id, user_id, skills, availability, status FROM volunteer_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );

    const volunteerProfile = profiles && profiles[0] ? profiles[0] : null;
    const volunteerSkills = (volunteerProfile?.skills || '').toLowerCase();
    const skillTokens = volunteerSkills
      .split(/[,;\s/]+/)
      .map(s => s.trim())
      .filter(s => s.length > 2);

    // 2. Fetch unassigned assistance requests
    const [requests] = await query(
      `SELECT ar.id, ar.beneficiary_id, ar.category, ar.description, ar.quantity_needed,
              ar.urgency, ar.priority, ar.status, ar.deadline, ar.created_at,
              b.name as beneficiary_name, b.address as delivery_address, b.phone as beneficiary_phone
       FROM assistance_requests ar
       LEFT JOIN beneficiaries b ON ar.beneficiary_id = b.id
       WHERE ar.assigned_volunteer_id IS NULL
         AND ar.status IN ('Approved', 'Resources Allocated', 'Submitted')
       ORDER BY ar.id DESC`
    );

    const scoredTasks = requests.map(task => {
      const textToMatch = `${task.category || ''} ${task.description || ''}`.toLowerCase();
      let matchedSkill = null;
      let matchScore = 0;

      // Check skill overlap
      for (const token of skillTokens) {
        if (textToMatch.includes(token)) {
          matchScore += 40;
          if (!matchedSkill) {
            matchedSkill = token.charAt(0).toUpperCase() + token.slice(1);
          }
        }
      }

      // Priority & Urgency weight
      const urgencyVal = (task.urgency || task.priority || 'Medium').toLowerCase();
      if (urgencyVal === 'high') matchScore += 30;
      else if (urgencyVal === 'medium') matchScore += 15;
      else matchScore += 5;

      // Status weight: Allocated resources are ready for immediate dispatch
      if (task.status === 'Resources Allocated') {
        matchScore += 25;
      } else if (task.status === 'Approved') {
        matchScore += 15;
      }

      let matchReason = '';
      if (matchedSkill) {
        matchReason = `Matches your skill in ${matchedSkill}`;
      } else if (task.status === 'Resources Allocated') {
        matchReason = 'Resources ready for doorstep distribution';
      } else if (urgencyVal === 'high') {
        matchReason = 'High urgency community requirement';
      } else {
        matchReason = `${task.category || 'Relief Aid'} assistance needed`;
      }

      return {
        ...task,
        score: matchScore,
        matched_skill: matchedSkill,
        match_reason: matchReason
      };
    });

    // Sort descending by score, then earliest deadline
    scoredTasks.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });

    const suggestions = scoredTasks.slice(0, 4);

    return res.status(200).json({
      success: true,
      count: suggestions.length,
      volunteer_skills: volunteerProfile?.skills || 'General Volunteer',
      tasks: suggestions,
      heuristic: 'Skill keyword matching + Urgency weighting + Allocation readiness'
    });
  } catch (error) {
    console.error('[Recommendation Controller] getSuggestedTasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate volunteer task recommendations.'
    });
  }
}

module.exports = {
  getRecommendedCampaigns,
  getSuggestedTasks
};
