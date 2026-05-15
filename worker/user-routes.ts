import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, DocumentSessionEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Pin, Comment, ReactionType } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SESSIONS
  app.get('/api/sessions', async (c) => {
    const page = await DocumentSessionEntity.list(c.env);
    return ok(c, page);
  });
  app.get('/api/sessions/by-codename/:codename', async (c) => {
    const code = c.req.param('codename').toUpperCase();
    const { items } = await DocumentSessionEntity.list(c.env);
    const match = items.find(s => s.codename?.toUpperCase() === code);
    if (!match) return notFound(c, 'Session not found');
    return ok(c, match);
  });
  app.get('/api/sessions/:id', async (c) => {
    const session = new DocumentSessionEntity(c.env, c.req.param('id'));
    if (!await session.exists()) return notFound(c, 'Session not found');
    return ok(c, await session.getState());
  });
  app.post('/api/sessions', async (c) => {
    const body = await c.req.json();
    if (!body.title || !body.documentUrl) return bad(c, 'Title and documentUrl required');
    const session = await DocumentSessionEntity.create(c.env, {
      id: crypto.randomUUID(),
      title: body.title,
      documentUrl: body.documentUrl,
      creatorId: body.creatorId || 'anonymous',
      pins: [],
      createdAt: Date.now(),
      codename: body.codename
    });
    return ok(c, session);
  });
  app.patch('/api/sessions/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const session = new DocumentSessionEntity(c.env, id);
    if (!await session.exists()) return notFound(c, 'Session not found');
    const updated = await session.mutate(s => ({
      ...s,
      ...body
    }));
    return ok(c, updated);
  });
  app.delete('/api/sessions/:id', async (c) => {
    const id = c.req.param('id');
    const success = await DocumentSessionEntity.delete(c.env, id);
    return ok(c, { success });
  });
  // PINS & FEEDBACK
  app.post('/api/sessions/:id/pins', async (c) => {
    const sessionId = c.req.param('id');
    const pinData = await c.req.json() as Pin;
    const session = new DocumentSessionEntity(c.env, sessionId);
    if (!await session.exists()) return notFound(c, 'Session not found');
    await session.addPin({
      ...pinData,
      id: pinData.id || crypto.randomUUID(),
      createdAt: Date.now(),
      reactions: pinData.reactions || { THUMBS_UP: 0, THUMBS_DOWN: 0, CONFUSED: 0, EYES: 0, CELEBRATE: 0 },
      comments: pinData.comments || []
    });
    return ok(c, { success: true });
  });
  app.post('/api/sessions/:id/pins/:pinId/feedback', async (c) => {
    const sessionId = c.req.param('id');
    const pinId = c.req.param('pinId');
    const feedback = await c.req.json() as { comment?: Comment; reaction?: ReactionType };
    const session = new DocumentSessionEntity(c.env, sessionId);
    if (!await session.exists()) return notFound(c, 'Session not found');
    await session.addFeedback(pinId, feedback);
    return ok(c, { success: true });
  });
}