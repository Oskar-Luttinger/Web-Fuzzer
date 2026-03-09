import "express-session";

declare module "express-session" {
    interface SessionData {
        username: string;
        is_logged_in: boolean;
        is_admin: boolean;
    }
}