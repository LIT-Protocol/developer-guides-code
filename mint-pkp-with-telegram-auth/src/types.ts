export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  auth_date: number;
  hash: string;
}
