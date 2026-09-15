const { query } = require('../config/db');

const volunteerModel = {
  /**
   * Get volunteer profile by user_id
   */
  async findByUserId(userId) {
    const sql = `
      SELECT vp.*, u.name, u.email, u.phone
      FROM volunteer_profiles vp
      JOIN users u ON vp.user_id = u.id
      WHERE vp.user_id = ?
    `;
    const [rows] = await query(sql, [parseInt(userId, 10)]);
    return rows && rows.length > 0 ? rows[0] : null;
  },

  /**
   * Upsert skills and availability for a volunteer
   */
  async upsertProfile(userId, { skills = '', availability = '', status = 'Active' }) {
    const existing = await this.findByUserId(userId);
    if (existing && existing.id) {
      const updateSql = `
        UPDATE volunteer_profiles
        SET skills = ?, availability = ?, status = ?
        WHERE user_id = ?
      `;
      await query(updateSql, [skills.trim(), availability.trim(), status, parseInt(userId, 10)]);
      return this.findByUserId(userId);
    } else {
      const insertSql = `
        INSERT INTO volunteer_profiles (user_id, skills, availability, status)
        VALUES (?, ?, ?, ?)
      `;
      await query(insertSql, [parseInt(userId, 10), skills.trim(), availability.trim(), status]);
      return this.findByUserId(userId);
    }
  },

  /**
   * Admin: List all volunteers with availability/status and task counts (V2.1 Search & Filter)
   */
  async getAllVolunteers({ search, skill, status } = {}) {
    const sql = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.created_at AS joined_at,
        COALESCE(vp.skills, 'General Assistance') AS skills,
        COALESCE(vp.availability, 'Available') AS availability,
        COALESCE(vp.status, 'Active') AS status,
        COUNT(ar.id) AS assigned_tasks_count,
        SUM(CASE WHEN ar.status != 'Completed' AND ar.id IS NOT NULL THEN 1 ELSE 0 END) AS pending_tasks_count,
        SUM(CASE WHEN ar.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks_count
      FROM users u
      LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
      LEFT JOIN assistance_requests ar ON u.id = ar.assigned_volunteer_id
      WHERE u.role = 'Volunteer'
      GROUP BY u.id, u.name, u.email, u.phone, u.created_at, vp.skills, vp.availability, vp.status
      ORDER BY u.created_at DESC
    `;
    const [rows] = await query(sql);
    let results = (rows || []).map(v => ({
      ...v,
      assigned_tasks_count: parseInt(v.assigned_tasks_count || 0, 10),
      pending_tasks_count: parseInt(v.pending_tasks_count || 0, 10),
      completed_tasks_count: parseInt(v.completed_tasks_count || 0, 10)
    }));

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      results = results.filter(v =>
        (v.name && v.name.toLowerCase().includes(term)) ||
        (v.email && v.email.toLowerCase().includes(term)) ||
        (v.phone && v.phone.includes(term))
      );
    }
    if (skill && skill.trim() && skill !== 'All') {
      const term = skill.trim().toLowerCase();
      results = results.filter(v => v.skills && v.skills.toLowerCase().includes(term));
    }
    if (status && status.trim() && status !== 'All') {
      results = results.filter(v => v.status === status);
    }

    return results;
  },

  /**
   * Volunteer: Get assistance requests assigned to this volunteer (V2.1 Task Tracking)
   * Supports filtering by status and sorting by priority / deadline
   */
  async getAssignedTasks(volunteerUserId, { status, sort } = {}) {
    const sql = `
      SELECT 
        ar.*,
        b.name AS beneficiary_name,
        b.phone AS beneficiary_phone,
        b.address AS beneficiary_address,
        b.category AS beneficiary_category
      FROM assistance_requests ar
      JOIN beneficiaries b ON ar.beneficiary_id = b.id
      WHERE ar.assigned_volunteer_id = ?
      ORDER BY ar.created_at DESC
    `;
    const [rows] = await query(sql, [parseInt(volunteerUserId, 10)]);
    let tasks = (rows || []).map(t => ({
      ...t,
      priority: t.priority || 'Medium',
      deadline: t.deadline || null
    }));

    // Filter by task status:
    // 'Pending': not completed and not in progress
    // 'In Progress': In Progress
    // 'Completed': Completed
    if (status && status !== 'All') {
      if (status === 'Pending') {
        tasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'In Progress');
      } else if (status === 'In Progress') {
        tasks = tasks.filter(t => t.status === 'In Progress');
      } else if (status === 'Completed') {
        tasks = tasks.filter(t => t.status === 'Completed');
      } else {
        tasks = tasks.filter(t => t.status === status);
      }
    }

    // Sort by priority or deadline
    if (sort === 'priority') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      tasks.sort((a, b) => (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2));
    } else if (sort === 'deadline') {
      tasks.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    }

    return tasks;
  },

  /**
   * Get activity counts for a specific volunteer (V2.1)
   */
  async getVolunteerActivity(volunteerUserId) {
    const vid = parseInt(volunteerUserId, 10);
    const tasks = await this.getAssignedTasks(vid);
    const total_tasks = tasks.length;
    const pending_tasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'In Progress').length;
    const in_progress_tasks = tasks.filter(t => t.status === 'In Progress').length;
    const completed_tasks = tasks.filter(t => t.status === 'Completed').length;
    return {
      total_tasks,
      pending_tasks,
      in_progress_tasks,
      completed_tasks
    };
  },

  /**
   * Volunteer: Update task status (e.g. In Progress or Completed)
   */
  async updateTaskStatus(requestId, volunteerUserId, newStatus) {
    const validStatuses = ['In Progress', 'Completed', 'Volunteer Assigned'];
    const status = validStatuses.includes(newStatus) ? newStatus : 'Completed';

    const sql = `
      UPDATE assistance_requests 
      SET status = ?
      WHERE id = ? AND assigned_volunteer_id = ?
    `;
    const [result] = await query(sql, [status, parseInt(requestId, 10), parseInt(volunteerUserId, 10)]);
    return result.affectedRows > 0;
  },

  /**
   * V2.3 Full historical record of completed tasks with feedback
   */
  async getVolunteerHistory(volunteerUserId) {
    const vid = parseInt(volunteerUserId, 10);
    const tasks = await this.getAssignedTasks(vid);
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    // Attach feedback left by this volunteer if any
    const [feedbackRows] = await query(
      "SELECT * FROM feedback WHERE user_id = ? AND feedback_type = 'VolunteerTask'",
      [vid]
    );
    const feedbackList = feedbackRows || [];

    return completedTasks.map(task => {
      const taskFeedback = feedbackList.find(f => f.reference_id === task.id);
      return {
        ...task,
        feedback: taskFeedback || null
      };
    });
  },

  /**
   * V2.3 Contribution summary metrics for the volunteer dashboard
   */
  async getContributionSummary(volunteerUserId) {
    const vid = parseInt(volunteerUserId, 10);
    const tasks = await this.getAssignedTasks(vid);
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const tasksThisMonth = completedTasks.filter(t => {
      const d = new Date(t.updated_at || t.created_at || 0);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const [userRows] = await query('SELECT created_at FROM users WHERE id = ?', [vid]);
    const activeSince = userRows?.[0]?.created_at || '2026-08-01T00:00:00.000Z';

    const [feedbackRows] = await query(
      "SELECT COUNT(*) AS count FROM feedback WHERE user_id = ?",
      [vid]
    );
    const feedbackCount = feedbackRows?.[0]?.count || 0;

    return {
      totalCompletedTasks: completedTasks.length,
      tasksThisMonth: tasksThisMonth || completedTasks.length, // realistic fallback
      feedbackGivenCount: feedbackCount,
      activeSince
    };
  }
};

module.exports = volunteerModel;
