import { 
  users, 
  documents, 
  viewingSessions,
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type ViewingSession,
  type InsertViewingSession 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  getViewingSession(documentId: number): Promise<ViewingSession | undefined>;
  createViewingSession(session: InsertViewingSession): Promise<ViewingSession>;
  updateViewingSession(documentId: number, currentPage: number, scale: string): Promise<ViewingSession | undefined>;
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

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getViewingSession(documentId: number): Promise<ViewingSession | undefined> {
    const [session] = await db.select().from(viewingSessions).where(eq(viewingSessions.documentId, documentId));
    return session || undefined;
  }

  async createViewingSession(insertSession: InsertViewingSession): Promise<ViewingSession> {
    const [session] = await db
      .insert(viewingSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateViewingSession(documentId: number, currentPage: number, scale: string): Promise<ViewingSession | undefined> {
    const [session] = await db
      .update(viewingSessions)
      .set({ 
        currentPage, 
        scale, 
        lastViewedAt: new Date() 
      })
      .where(eq(viewingSessions.documentId, documentId))
      .returning();
    return session || undefined;
  }
}

export const storage = new DatabaseStorage();
