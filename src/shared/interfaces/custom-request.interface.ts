import { User } from "src/shared/models/User.model";

export interface CustomRequest extends Request { 
    user: null | User
}