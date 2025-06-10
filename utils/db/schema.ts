import {
  integer,
  varchar,
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

// Users table
export const Users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: text("role").default('user'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendor credentials
export const vendor_credentials = pgTable("vendor_credentials", {
  id: uuid("id").primaryKey().defaultRandom(), // ✅ changed from serial to uuid
  user_id: uuid("user_id").notNull().references(() => Users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  id_number: varchar("id_number", { length: 255 }),
  license_number: varchar("license_number", { length: 255 }),
  address: text("address"),
  company: varchar("company", { length: 255 }).notNull(),  
  status: text("status").default("inactive").notNull(),
});

// Staff table
export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(), // ✅ changed from serial to uuid
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 100 }).notNull(),
  vendor_id: uuid("vendor_id").notNull().references(() => vendor_credentials.id), // ✅ link to vendor table
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Reports table
export const Reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(), // ✅
  userId: uuid("user_id").references(() => Users.id).notNull(),
  location: text("location").notNull(),
  wasteType: varchar("waste_type", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  verificationResult: jsonb("verification_result"),
  status: varchar("status", { length: 255 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  collectorId: uuid("collector_id").references(() => Users.id),
});

// Rewards table
export const Rewards = pgTable("rewards", {
  id: uuid("id").primaryKey().defaultRandom(), // ✅
  userId: uuid("user_id").references(() => Users.id).notNull(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  description: text("description"),
  name: varchar("name", { length: 255 }).notNull(),
  collectionInfo: text("collection_info").notNull(),
});

// Collected Wastes
export const CollectedWastes = pgTable("collected_wastes", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => Reports.id).notNull(),
  collectorId: uuid("collector_id").references(() => Users.id).notNull(),
  collectionDate: timestamp("collection_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("collected"),
});

// Notifications table
export const Notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => Users.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table
export const Transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => Users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'earned' or 'redeemed'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const AssignedTasks = pgTable("assigned_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  staff_id: uuid("staff_id").notNull(),
  report_id: uuid("report_id").notNull(),
  vendor_id: uuid("vendor_id").notNull(),
  assigned_at: timestamp("assigned_at").defaultNow().notNull(),
  status: varchar("status", { length: 100 }).default("assigned"),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").notNull(),
  staffId: uuid("staff_id").notNull(),
  wasteType: varchar("waste_type", { length: 100 }),
  location: text("location"),
  amount: integer("amount"),
  imageUrl: text("image_url"),
  taskStatus: varchar("task_status", { length: 20 }).default("assigned"),
  assignedAt: timestamp("assigned_at").defaultNow(),
  verifiedAt: timestamp("verified_at").defaultNow(),  // Use .nullable() here
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});