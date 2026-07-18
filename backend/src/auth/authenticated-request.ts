import { Request } from 'express';

// То, что JwtStrategy.validate кладёт в request.user (модуль 6).
// Без этого типа req остаётся any, и линтер справедливо ругается
// на каждое обращение к req.user.
export interface AuthenticatedRequest extends Request {
  user: { userId: string };
}
