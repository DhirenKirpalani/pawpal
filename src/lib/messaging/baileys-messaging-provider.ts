import { MessagingProvider } from './messaging-provider';

export class BaileysMessagingProvider implements MessagingProvider {
  private sendCallback: (to: string, message: string) => Promise<void>;

  constructor(sendCallback: (to: string, message: string) => Promise<void>) {
    this.sendCallback = sendCallback;
  }

  async sendMessage(to: string, message: string): Promise<void> {
    await this.sendCallback(to, message);
  }
}
