export interface MessagingProvider {
  sendMessage(to: string, message: string): Promise<void>;
}
