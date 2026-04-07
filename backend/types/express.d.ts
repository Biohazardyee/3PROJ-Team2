import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string;
      username: string;
      role: "BASIC" | "ADMIN";
    };
  }
}

declare module "*.png" {
  const value: string;
  export default value;
}
