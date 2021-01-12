import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsCallService {
  private _client: twilio.Twilio;

  constructor() {
    this._client = twilio('AC4a717ffa94f2782c6e1950b7150daa07', '6e2abbf50ed13e65640ad13db831a20e');
  }

  sendMessage(config: any) {
    return this._client.messages.create({
      ...config,
      from: '+12025195818',
    });
  }
}
