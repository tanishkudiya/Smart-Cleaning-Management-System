import { db } from './dbConfig';
import {
  Users,
  Reports,
  Rewards,
  CollectedWastes,
  vendor_credentials,
  Notifications,
  staff,
  Transactions,
} from './schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export async function createStaff(data) {
  try {
    await db.insert(staff).values({
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      vendor_id: data.vendor_id,
    }).execute();
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
}

export async function getPendingTasksByVendorId(vendorId) {
  try {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.vendor_id, vendorId), eq(tasks.status, 'pending')))
      .execute();
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    return [];
  }
}

export async function deleteStaff(id) {
  try {
    await db.delete(staff).where(eq(staff.id, id)).execute();
  } catch (error) {
    console.error('Delete failed:', error);
    throw new Error('Failed to delete staff');
  }
}

export async function getAllStaff() {
  try {
    return await db.select().from(staff).execute();
  } catch (error) {
    console.error('Error fetching all staff:', error);
    return [];
  }
}

export async function getStaffByVendorId(vendorId) {
  try {
    return await db.select().from(staff).where(eq(staff.vendor_id, vendorId)).execute();
  } catch (error) {
    console.error('Error fetching staff by vendorId:', error);
    return [];
  }
}

export async function updateVendorStatus(vendorId, newStatus) {
  try {
    await db
      .update(vendor_credentials)
      .set({ status: newStatus })
      .where(eq(vendor_credentials.id, vendorId))
      .execute();
    return true;
  } catch (error) {
    console.error('Failed to update vendor status:', error);
    return false;
  }
}

export async function getVendorByUserId(userId) {
  try {
    const result = await db
      .select()
      .from(vendor_credentials)
      .where(eq(vendor_credentials.user_id, userId))
      .limit(1)
      .execute();
    return result.length ? result[0] : null;
  } catch (error) {
    console.error('Error fetching vendor by userId:', error);
    return null;
  }
}

export async function getPendingComplaints() {
  try {
    return await db
      .select()
      .from(Reports)
      .where(eq(Reports.status, 'pending'))
      .execute();
  } catch (error) {
    console.error('Error fetching pending complaints:', error);
    return [];
  }
}

export async function getAllVendors() {
  try {
    return await db.select().from(vendor_credentials).execute();
  } catch (error) {
    console.error('Failed to fetch all vendors:', error);
    return [];
  }
}

export async function getAllReports() {
  try {
    return await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .execute();
  } catch (error) {
    console.error('Error fetching all reports:', error);
    return [];
  }
}

export async function createUser(email, name, role) {
  try {
    const result = await db
      .insert(Users)
      .values({ email, name, role })
      .returning()
      .execute();
    return result;
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
}

export async function saveVendorConfidentialInfo(info) {
  try {
    const user = await getUserByEmail(info.userEmail);
    if (!user) throw new Error('User not found');

    await db.insert(vendor_credentials).values({
      user_id: user.id,
      name: info.name,
      email: info.userEmail,
      company: info.company,
      id_number: info.idNumber,
      license_number: info.licenseNumber,
      address: info.address,
      status: 'inactive',
    }).execute();
  } catch (error) {
    console.error('Error saving vendor confidential info:', error);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const user = await db.select().from(Users).where(eq(Users.email, email)).limit(1).execute();
    return user.length ? user[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function createReport(userId, location, wasteType, amount, imageUrl, verificationResult) {
  try {
    const [report] = await db.insert(Reports).values({
      userId,
      location,
      wasteType,
      amount,
      imageUrl,
      verificationResult,
      status: 'pending',
    }).returning().execute();

    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');
    await createNotification(userId, `You've earned ${pointsEarned} points for reporting waste!`, 'reward');

    return report;
  } catch (error) {
    console.error('Error creating report:', error);
    return null;
  }
}

export async function getReportsByUserId(userId) {
  try {
    return await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
  } catch (error) {
    console.error('Error fetching reports by userId:', error);
    return [];
  }
}

export async function getOrCreateReward(userId) {
  try {
    let [reward] = await db.select().from(Rewards).where(eq(Rewards.userId, userId)).execute();
    if (!reward) {
      [reward] = await db.insert(Rewards).values({
        userId,
        name: 'Default Reward',
        collectionInfo: 'Default Collection Info',
        points: 0,
        level: 1,
        isAvailable: true,
      }).returning().execute();
    }
    return reward;
  } catch (error) {
    console.error('Error getting or creating reward:', error);
    return null;
  }
}

export async function updateRewardPoints(userId, pointsToAdd) {
  try {
    const [updatedReward] = await db
      .update(Rewards)
      .set({ points: sql`${Rewards.points} + ${pointsToAdd}`, updatedAt: new Date() })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();
    return updatedReward;
  } catch (error) {
    console.error('Error updating reward points:', error);
    return null;
  }
}

export async function createCollectedWaste(reportId, collectorId) {
  try {
    const [collectedWaste] = await db.insert(CollectedWastes).values({
      reportId,
      collectorId,
      collectionDate: new Date(),
    }).returning().execute();
    return collectedWaste;
  } catch (error) {
    console.error('Error creating collected waste:', error);
    return null;
  }
}

export async function getCollectedWastesByCollector(collectorId) {
  try {
    return await db.select().from(CollectedWastes).where(eq(CollectedWastes.collectorId, collectorId)).execute();
  } catch (error) {
    console.error('Error fetching collected wastes:', error);
    return [];
  }
}

export async function createNotification(userId, message, type) {
  try {
    const [notification] = await db.insert(Notifications).values({ userId, message, type }).returning().execute();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function getUnreadNotifications(userId) {
  try {
    return await db.select().from(Notifications).where(
      and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))
    ).execute();
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function getPendingReports() {
  try {
    return await db.select().from(Reports).where(eq(Reports.status, 'pending')).execute();
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    return [];
  }
}

export async function updateReportStatus(reportId, status) {
  try {
    const [updatedReport] = await db
      .update(Reports)
      .set({ status })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error('Error updating report status:', error);
    return null;
  }
}

export async function getRecentReports(limit = 10) {
  try {
    return await db.select().from(Reports).orderBy(desc(Reports.createdAt)).limit(limit).execute();
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map(task => ({
      ...task,
      date: task.date.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching waste collection tasks:', error);
    return [];
  }
}

export async function saveReward(userId, amount) {
  try {
    const [reward] = await db.insert(Rewards).values({
      userId,
      name: 'Waste Collection Reward',
      collectionInfo: 'Points earned from waste collection',
      points: amount,
      level: 1,
      isAvailable: true,
    }).returning().execute();

    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return reward;
  } catch (error) {
    console.error('Error saving reward:', error);
    throw error;
  }
}

export async function saveCollectedWaste(reportId, collectorId, verificationResult) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
        status: 'verified',
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error('Error saving collected waste:', error);
    throw error;
  }
}

export async function updateTaskStatus(reportId, newStatus, collectorId) {
  try {
    const updateData = { status: newStatus };
    if (collectorId !== undefined) updateData.collectorId = collectorId;

    const [updatedReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

export async function getAllRewards() {
  try {
    return await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        userName: sql`users.name`,
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id))
      .orderBy(desc(Rewards.points))
      .execute();
  } catch (error) {
    console.error('Error fetching all rewards:', error);
    return [];
  }
}

export async function getRewardTransactions(userId) {
  try {
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    return transactions.map(t => ({
      ...t,
      date: t.date.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching reward transactions:', error);
    return [];
  }
}

export async function getAvailableRewards(userId) {
  try {
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith('earned')
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);

    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(eq(Rewards.isAvailable, true))
      .execute();

    return [
      {
        id: 0,
        name: 'Your Points',
        cost: userPoints,
        description: 'Redeem your earned points',
        collectionInfo: 'Points earned from reporting and collecting waste',
      },
      ...dbRewards,
    ];
  } catch (error) {
    console.error('Error fetching available rewards:', error);
    return [];
  }
}

export async function redeemReward(userId, rewardId) {
  try {
    const reward = await db.select().from(Rewards).where(eq(Rewards.id, rewardId)).execute();
    if (!reward || reward.length === 0) throw new Error('Reward not found');

    const rewardPoints = reward[0].points;
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith('earned')
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);

    if (userPoints < rewardPoints) throw new Error('Insufficient points');

    await createTransaction(userId, 'redeemed', rewardPoints, `Redeemed reward ID ${rewardId}`);
    await db.update(Rewards).set({ isAvailable: false }).where(eq(Rewards.id, rewardId)).execute();

    return true;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return false;
  }
}

export async function createTransaction(userId, type, amount, description) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({
        userId,
        type,
        amount,
        description,
        date: new Date(),
      })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

export async function getUserBalance(userId) {
  try {
    const transactions = await getRewardTransactions(userId);
    const balance = transactions.reduce((acc, transaction) => {
      return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount;
    }, 0);
    return Math.max(balance, 0);
  } catch (error) {
    console.error('Error calculating user balance:', error);
    return 0;
  }
}
