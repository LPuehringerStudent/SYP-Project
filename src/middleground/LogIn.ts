import { PlayerRow } from "../shared/model";
import { PlayerService } from "../backend/services/player-service";
import {Unit} from "../backend/utils/unit";


export class Login {
    username?: string;
    email?: string;
    unit: Unit;
    service: PlayerService;

    constructor() {
        this.unit = new Unit(false);
        this.service = new PlayerService(this.unit);
    }

    private static isEmail(text:string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    }
    public tryLogin(usernameOrEmail: string, password: string): boolean {
        if(Login.isEmail(usernameOrEmail)) {
            let user: PlayerRow | null = this.service.getPlayerByEmail(usernameOrEmail);
            if(user != null && user?.password === password){
                this.username = user.username;
                this.email = user.email;
                return true;
            }else {
                return false;
            }
        }
        else {
            let user: PlayerRow | null = this.service.getPlayerByUsername(usernameOrEmail);
            if(user != null && user?.password === password){
                this.username = user.username;
                this.email = user.email;
                return true;
            } else {
                return false;
            }
        }
    }
}