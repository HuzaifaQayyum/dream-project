import { Injectable } from "@nestjs/common";
import * as twilio from 'twilio';

@Injectable()
export class SmsCallService { 
    private _client: twilio.Twilio;
    
    constructor() { 
        this._client = twilio('AC4a717ffa94f2782c6e1950b7150daa07', '18cadf96ebc6a9c1ab871b369ad2a1a3');
    }

    sendMessage(config: { from: string; to: string; body: string; }) {
        return this._client.messages.create(config);
    }
}