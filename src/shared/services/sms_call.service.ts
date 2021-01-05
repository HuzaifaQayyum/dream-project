import { Injectable } from "@nestjs/common";
import * as twilio from 'twilio';
import { MessageListInstance, MessageListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/message";

@Injectable()
export class SmsCallService { 
    private _client: twilio.Twilio;
    
    constructor() { 
        this._client = twilio('AC4a717ffa94f2782c6e1950b7150daa07', '18cadf96ebc6a9c1ab871b369ad2a1a3');
    }

    sendMessage(config: MessageListInstanceCreateOptions) {
        return this._client.messages.create({
            ...config,
            from: '+12025195818'
        });
    }
}