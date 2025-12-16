// biome-ignore lint/correctness/noUnusedImports: false
import * as express from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Response {
    success: <T = unknown>(data: T, message?: string, statusCode?: number) => void;
  }
  interface Request {
    id: string;
    user: User;
  }
}

interface User {
  id: number;
}
