/**
 * NOTE: This module is currently disabled as it incorrectly imports backend services
 * which cannot run in the browser. For sprint purposes, login should be handled via
 * API calls to the backend, not direct database access.
 * 
 * TODO: Refactor to use fetch API calls to /api/players endpoints instead.
 */

export class Login {
    username?: string;
    email?: string;

    constructor() {
        // Disabled - backend services cannot run in browser
    }

    public tryLogin(_usernameOrEmail: string, _password: string): boolean {
        // Disabled - use API calls instead
        console.warn("Login is disabled. Use API calls to backend instead.");
        return false;
    }
}