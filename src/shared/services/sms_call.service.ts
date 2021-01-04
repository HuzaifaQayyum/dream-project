import { Injectable } from "@nestjs/common";
import * as twilio from 'twilio';

@Injectable()
export class SmsCallService { 
    private _client: twilio.Twilio;
    
    constructor() { 
        this._client = twilio('AC4a717ffa94f2782c6e1950b7150daa07', '679bffd5df4f226fc82d7689336f63e5');
    }

    sendMessage(config: { from: string; to: string; body: string; }) {
        return this._client.messages.create(config);
    }
}