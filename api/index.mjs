// api/vercel-entry.ts
import express from "express";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", [
    "Noch nicht kontaktiert",
    "E-Mail in Vorbereitung",
    "E-Mail gesendet",
    "Antwort erhalten",
    "Absage",
    "Zusage/Partner"
  ]).default("Noch nicht kontaktiert").notNull(),
  emailSentDate: timestamp("emailSentDate"),
  responseDate: timestamp("responseDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function getSponsorById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(sponsors).where(eq(sponsors.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllSponsors() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sponsors).orderBy(sponsors.createdAt);
}
async function createSponsor(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sponsors).values(data);
  const id = result[0]?.insertId;
  if (!id) throw new Error("Failed to create sponsor");
  return getSponsorById(id);
}
async function updateSponsor(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sponsors).set(data).where(eq(sponsors.id, id));
  return getSponsorById(id);
}
async function deleteSponsor(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sponsors).where(eq(sponsors.id, id));
  return true;
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
var MASTER_PASSWORD = "Management";
var authenticatedProcedure = publicProcedure.use(({ ctx, next }) => {
  const isAuthenticated = ctx.req.cookies?.[COOKIE_NAME] === "authenticated";
  if (!isAuthenticated) {
    throw new TRPCError3({
      code: "UNAUTHORIZED",
      message: "Authentifizierung erforderlich"
    });
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    login: publicProcedure.input(z2.object({ password: z2.string() })).mutation(({ input, ctx }) => {
      if (input.password !== MASTER_PASSWORD) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Falsches Passwort"
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.setHeader("Set-Cookie", [
        `${COOKIE_NAME}=authenticated; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=86400`
      ]);
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    me: publicProcedure.query(({ ctx }) => {
      const isAuthenticated = ctx.req.cookies?.[COOKIE_NAME] === "authenticated";
      return { isAuthenticated };
    })
  }),
  sponsors: router({
    list: authenticatedProcedure.query(async () => {
      return await getAllSponsors();
    }),
    get: authenticatedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return await getSponsorById(input.id);
    }),
    create: authenticatedProcedure.input(z2.object({
      companyName: z2.string().min(1),
      contactPerson: z2.string().min(1),
      email: z2.string().email(),
      notes: z2.string().optional(),
      status: z2.enum([
        "Noch nicht kontaktiert",
        "E-Mail in Vorbereitung",
        "E-Mail gesendet",
        "Antwort erhalten",
        "Absage",
        "Zusage/Partner"
      ]).default("Noch nicht kontaktiert")
    })).mutation(async ({ input }) => {
      return await createSponsor(input);
    }),
    update: authenticatedProcedure.input(z2.object({
      id: z2.number(),
      companyName: z2.string().min(1).optional(),
      contactPerson: z2.string().min(1).optional(),
      email: z2.string().email().optional(),
      notes: z2.string().optional(),
      status: z2.enum([
        "Noch nicht kontaktiert",
        "E-Mail in Vorbereitung",
        "E-Mail gesendet",
        "Antwort erhalten",
        "Absage",
        "Zusage/Partner"
      ]).optional(),
      emailSentDate: z2.date().optional().nullable(),
      responseDate: z2.date().optional().nullable()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateSponsor(id, data);
    }),
    delete: authenticatedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      return await deleteSponsor(input.id);
    })
  })
});

// api/vercel-entry.ts
import path from "path";
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => ({
      req,
      res,
      user: null
    })
  })
);
var staticPath = path.join(process.cwd(), "dist", "public");
app.use(express.static(staticPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};
