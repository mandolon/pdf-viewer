import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  totalPages: integer("total_pages").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const viewingSessions = pgTable("viewing_sessions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  currentPage: integer("current_page").notNull().default(1),
  scale: text("scale").notNull().default("1.0"),
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  viewingSessions: many(viewingSessions),
}));

export const viewingSessionsRelations = relations(viewingSessions, ({ one }) => ({
  document: one(documents, {
    fields: [viewingSessions.documentId],
    references: [documents.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  filename: true,
  totalPages: true,
});

export const insertViewingSessionSchema = createInsertSchema(viewingSessions).pick({
  documentId: true,
  currentPage: true,
  scale: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertViewingSession = z.infer<typeof insertViewingSessionSchema>;
export type ViewingSession = typeof viewingSessions.$inferSelect;
