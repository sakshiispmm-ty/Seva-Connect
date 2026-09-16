const { query } = require('../config/db');
const notificationModel = require('./notificationModel');

const BADGE_DEFINITIONS = [
  { id: 1, name: 'First Steps', description: 'Completed your first community assistance delivery task.', icon: 'award' },
  { id: 2, name: 'Dedicated Helper', description: 'Successfully fulfilled 5 relief distribution tasks.', icon: 'shield-check' },
  { id: 3, name: 'Community Champion', description: 'Completed 10 or more community relief delivery tasks.', icon: 'trophy' },
  { id: 4, name: 'Priority Hero', description: 'Completed 3 or more High-priority emergency relief missions.', icon: 'flame' },
  { id: 5, name: 'Centurion', description: 'Earned over 250 volunteer service points.', icon: 'zap' },
  { id: 6, name: 'Legendary Volunteer', description: 'Reached over 500 volunteer service points.', icon: 'crown' }
];

const pointsModel = {
  /**
   * Transparent point rules:
   * Flat 50 points per completed task.
   * Priority bonus: High = +25, Medium = +10, Low = +0.
   */
  async awardTaskPoints(volunteerUserId, taskId, taskPriority = 'Medium') {
    const vId = parseInt(volunteerUserId, 10);
    const reqId = parseInt(taskId, 10);

    if (isNaN(vId) || isNaN(reqId)) {
      return null;
    }

    // 1. Idempotency check: Don't award points twice for the same task
    const [existingTx] = await query(
      "SELECT id FROM point_transactions WHERE user_id = ? AND reference_type = 'AssistanceRequest' AND reference_id = ?",
      [vId, reqId]
    );
    if (existingTx && existingTx.length > 0) {
      console.log(`[Points Model] Task #${reqId} points already awarded to volunteer #${vId}.`);
      return null;
    }

    // 2. Calculate points according to rule
    const basePoints = 50;
    let priorityBonus = 0;
    const cleanPriority = String(taskPriority || 'Medium').toLowerCase();
    if (cleanPriority === 'high') priorityBonus = 25;
    else if (cleanPriority === 'medium') priorityBonus = 10;

    const totalAwarded = basePoints + priorityBonus;
    const reason = `Completed task #REQ-00${reqId} (${taskPriority} Priority)`;

    // 3. Insert transaction log
    await query(
      "INSERT INTO point_transactions (user_id, points, reason, reference_type, reference_id) VALUES (?, ?, ?, 'AssistanceRequest', ?)",
      [vId, totalAwarded, reason, reqId]
    );

    // 4. Update running points total
    const [pointsRow] = await query("SELECT total_points FROM volunteer_points WHERE user_id = ?", [vId]);
    let newTotalPoints = totalAwarded;
    if (pointsRow && pointsRow.length > 0) {
      newTotalPoints = (pointsRow[0].total_points || 0) + totalAwarded;
      await query("UPDATE volunteer_points SET total_points = ? WHERE user_id = ?", [newTotalPoints, vId]);
    } else {
      await query("INSERT INTO volunteer_points (user_id, total_points) VALUES (?, ?)", [vId, newTotalPoints]);
    }

    // 5. Trigger in-app notification for points awarded
    try {
      await notificationModel.create({
        recipient_id: vId,
        type: 'PointsAwarded',
        message: `You earned +${totalAwarded} points for completing relief mission #REQ-00${reqId}! Total points: ${newTotalPoints}.`,
        reference_type: 'AssistanceRequest',
        reference_id: reqId
      });
    } catch (e) {
      console.warn('[Points Model] Failed to send points notification:', e.message);
    }

    // 6. Evaluate Badge Qualification Rules
    const badgesUnlocked = await this.evaluateBadges(vId, newTotalPoints);

    return {
      pointsAwarded: totalAwarded,
      totalPoints: newTotalPoints,
      badgesUnlocked
    };
  },

  /**
   * Evaluates rule-based badges server-side and awards qualified ones
   */
  async evaluateBadges(volunteerUserId, currentTotalPoints = null) {
    const vId = parseInt(volunteerUserId, 10);
    const badgesUnlocked = [];

    // Fetch existing user badges
    const [existingBadges] = await query("SELECT badge_id FROM user_badges WHERE user_id = ?", [vId]);
    const earnedBadgeIds = new Set((existingBadges || []).map(b => b.badge_id));

    // Get volunteer task statistics
    const [completedRows] = await query(
      "SELECT id, priority FROM assistance_requests WHERE assigned_volunteer_id = ? AND status = 'Completed'",
      [vId]
    );
    const completedTasks = completedRows || [];
    const completedCount = completedTasks.length;
    const highPriorityCount = completedTasks.filter(t => (t.priority || '').toLowerCase() === 'high').length;

    let points = currentTotalPoints;
    if (points === null) {
      const [ptRow] = await query("SELECT total_points FROM volunteer_points WHERE user_id = ?", [vId]);
      points = ptRow?.[0]?.total_points || 0;
    }

    // Qualification rules:
    // Badge 1: 'First Steps' -> completed >= 1
    if (!earnedBadgeIds.has(1) && completedCount >= 1) {
      await this.awardBadge(vId, 1);
      badgesUnlocked.push('First Steps');
    }
    // Badge 2: 'Dedicated Helper' -> completed >= 5
    if (!earnedBadgeIds.has(2) && completedCount >= 5) {
      await this.awardBadge(vId, 2);
      badgesUnlocked.push('Dedicated Helper');
    }
    // Badge 3: 'Community Champion' -> completed >= 10
    if (!earnedBadgeIds.has(3) && completedCount >= 10) {
      await this.awardBadge(vId, 3);
      badgesUnlocked.push('Community Champion');
    }
    // Badge 4: 'Priority Hero' -> highPriorityCount >= 3
    if (!earnedBadgeIds.has(4) && highPriorityCount >= 3) {
      await this.awardBadge(vId, 4);
      badgesUnlocked.push('Priority Hero');
    }
    // Badge 5: 'Centurion' -> points >= 250
    if (!earnedBadgeIds.has(5) && points >= 250) {
      await this.awardBadge(vId, 5);
      badgesUnlocked.push('Centurion');
    }
    // Badge 6: 'Legendary Volunteer' -> points >= 500
    if (!earnedBadgeIds.has(6) && points >= 500) {
      await this.awardBadge(vId, 6);
      badgesUnlocked.push('Legendary Volunteer');
    }

    return badgesUnlocked;
  },

  /**
   * Server-side badge awarding with in-app notification
   */
  async awardBadge(userId, badgeId) {
    const uId = parseInt(userId, 10);
    const bId = parseInt(badgeId, 10);
    const badge = BADGE_DEFINITIONS.find(b => b.id === bId);
    if (!badge) return;

    await query("INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", [uId, bId]);

    try {
      await notificationModel.create({
        recipient_id: uId,
        type: 'BadgeEarned',
        message: `🏆 Badge Unlocked: You earned the "${badge.name}" badge! (${badge.description})`,
        reference_type: 'Badge',
        reference_id: bId
      });
    } catch (e) {
      console.warn('[Points Model] Failed to send badge notification:', e.message);
    }
  },

  /**
   * Get point total and transaction ledger for a volunteer
   */
  async getPoints(volunteerUserId) {
    const vId = parseInt(volunteerUserId, 10);
    const [pRow] = await query("SELECT total_points, updated_at FROM volunteer_points WHERE user_id = ?", [vId]);
    const totalPoints = pRow?.[0]?.total_points || 0;

    const [txRows] = await query(
      "SELECT id, points, reason, reference_type, reference_id, created_at FROM point_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [vId]
    );

    return {
      userId: vId,
      totalPoints,
      updatedAt: pRow?.[0]?.updated_at || null,
      transactions: txRows || []
    };
  },

  /**
   * Get all badges with earned status and progress for a volunteer
   */
  async getBadges(volunteerUserId) {
    const vId = parseInt(volunteerUserId, 10);
    if (isNaN(vId)) return BADGE_DEFINITIONS.map(b => ({ ...b, earned: false, earnedAt: null }));

    // Evaluate in case the volunteer qualified from previous or newly completed tasks
    try {
      await this.evaluateBadges(vId);
    } catch (err) {
      console.warn('[Points Model] evaluateBadges in getBadges:', err.message);
    }

    const [userBadgesRows] = await query(
      "SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?",
      [vId]
    );
    const earnedMap = new Map((userBadgesRows || []).map(ub => [ub.badge_id, ub.earned_at]));

    // Fetch volunteer stats to compute current progress towards each badge
    const [completedRows] = await query(
      "SELECT id, priority FROM assistance_requests WHERE assigned_volunteer_id = ? AND status = 'Completed'",
      [vId]
    );
    const completedTasks = completedRows || [];
    const completedCount = completedTasks.length;
    const highPriorityCount = completedTasks.filter(t => (t.priority || '').toLowerCase() === 'high').length;

    const [ptRow] = await query("SELECT total_points FROM volunteer_points WHERE user_id = ?", [vId]);
    const totalPoints = ptRow?.[0]?.total_points || 0;

    return BADGE_DEFINITIONS.map(b => {
      const isEarned = earnedMap.has(b.id);
      let progress = { current: 0, target: 1, unit: 'tasks', percent: 0 };

      if (b.id === 1) {
        progress = { current: Math.min(completedCount, 1), target: 1, unit: 'task delivery', percent: Math.min(100, Math.round((completedCount / 1) * 100)) };
      } else if (b.id === 2) {
        progress = { current: Math.min(completedCount, 5), target: 5, unit: 'task deliveries', percent: Math.min(100, Math.round((completedCount / 5) * 100)) };
      } else if (b.id === 3) {
        progress = { current: Math.min(completedCount, 10), target: 10, unit: 'task deliveries', percent: Math.min(100, Math.round((completedCount / 10) * 100)) };
      } else if (b.id === 4) {
        progress = { current: Math.min(highPriorityCount, 3), target: 3, unit: 'high-priority missions', percent: Math.min(100, Math.round((highPriorityCount / 3) * 100)) };
      } else if (b.id === 5) {
        progress = { current: Math.min(totalPoints, 250), target: 250, unit: 'points', percent: Math.min(100, Math.round((totalPoints / 250) * 100)) };
      } else if (b.id === 6) {
        progress = { current: Math.min(totalPoints, 500), target: 500, unit: 'points', percent: Math.min(100, Math.round((totalPoints / 500) * 100)) };
      }

      return {
        ...b,
        earned: isEarned,
        earnedAt: earnedMap.get(b.id) || null,
        progress
      };
    });
  },

  /**
   * Volunteer Leaderboard: Ranked by points and completed tasks
   */
  async getLeaderboard({ limit = 50, timeRange = 'all' } = {}) {
    const maxLimit = Math.min(parseInt(limit, 10) || 50, 100);

    // Fetch all volunteers
    const [volUsers] = await query(
      "SELECT id, name, email, role, is_active FROM users WHERE role = 'Volunteer' AND is_active = TRUE"
    );
    const volunteers = volUsers || [];

    // Fetch all points
    const [allPoints] = await query("SELECT user_id, total_points FROM volunteer_points");
    const pointsMap = new Map((allPoints || []).map(p => [p.user_id, p.total_points || 0]));

    // Fetch completed tasks counts
    const [allTasks] = await query(
      "SELECT assigned_volunteer_id, priority FROM assistance_requests WHERE status = 'Completed'"
    );
    const taskCountMap = new Map();
    (allTasks || []).forEach(t => {
      const vid = t.assigned_volunteer_id;
      if (vid) {
        taskCountMap.set(vid, (taskCountMap.get(vid) || 0) + 1);
      }
    });

    // Fetch user badges
    const [allUserBadges] = await query("SELECT user_id, badge_id FROM user_badges");
    const userBadgesMap = new Map();
    (allUserBadges || []).forEach(ub => {
      if (!userBadgesMap.has(ub.user_id)) userBadgesMap.set(ub.user_id, []);
      const bDef = BADGE_DEFINITIONS.find(b => b.id === ub.badge_id);
      if (bDef) userBadgesMap.get(ub.user_id).push(bDef);
    });

    const ranked = volunteers.map(v => {
      const pts = pointsMap.get(v.id) || 0;
      const tasks = taskCountMap.get(v.id) || 0;
      const badges = userBadgesMap.get(v.id) || [];
      return {
        id: v.id,
        name: v.name,
        email: v.email,
        totalPoints: pts,
        completedTasks: tasks,
        badges,
        badgeCount: badges.length
      };
    });

    // Sort: highest points first, then most completed tasks, then name
    ranked.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.completedTasks !== a.completedTasks) return b.completedTasks - a.completedTasks;
      return a.name.localeCompare(b.name);
    });

    // Assign rank
    return ranked.slice(0, maxLimit).map((item, index) => ({
      rank: index + 1,
      ...item
    }));
  }
};

module.exports = pointsModel;
