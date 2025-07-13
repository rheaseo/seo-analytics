import { users, analyticsReports, type User, type InsertUser, type AnalyticsReport, type InsertAnalyticsReport } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveAnalyticsReport(report: InsertAnalyticsReport): Promise<AnalyticsReport>;
  getLatestAnalyticsReport(): Promise<AnalyticsReport | undefined>;
  getAllAnalyticsReports(): Promise<AnalyticsReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveAnalyticsReport(report: InsertAnalyticsReport): Promise<AnalyticsReport> {
    const [savedReport] = await db
      .insert(analyticsReports)
      .values(report)
      .returning();
    return savedReport;
  }

  async getLatestAnalyticsReport(): Promise<AnalyticsReport | undefined> {
    const [report] = await db
      .select()
      .from(analyticsReports)
      .orderBy(desc(analyticsReports.createdAt))
      .limit(1);
    return report || undefined;
  }

  async getAllAnalyticsReports(): Promise<AnalyticsReport[]> {
    return await db
      .select()
      .from(analyticsReports)
      .orderBy(desc(analyticsReports.createdAt));
  }
}

export const storage = new DatabaseStorage();
