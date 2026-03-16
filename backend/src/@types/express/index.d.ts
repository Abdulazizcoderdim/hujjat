import { JwtPayload } from 'src/auth/types/jwt-payload.type';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      authContext?: string;
    }
  }
}
