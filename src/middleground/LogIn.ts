import { Player } from "../shared/model";
import { PlayerService } from "../backend/services/player-service";


export class Login {
    username: string;
    password: string;
    email: string;

    private static isEmail(text:string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    }
    public tryLogin(usernameOrEmail: string, password: string): boolean {
        if(Login.isEmail(usernameOrEmail)) {}
    }
}