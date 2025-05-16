import { Injectable } from '@nestjs/common';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoggerService } from '../../shared/services/LoggerService';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly supabaseProvider: SupabaseAdminProvider,
    private readonly logger: LoggerService,
  ) {
    this.supabase = this.supabaseProvider.getClient();
  }

  async login(email: string, password: string): Promise<object> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      this.logger.error('Error logging in:', error);
      throw new Error(`Error logging in: ${error.message}`);
    }
    this.logger.info('User logged in successfully in auth service:');
    return data;
  }

  async createUser(email: string, password: string): Promise<object> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      this.logger.error('Error creating user:', error);
      throw new Error(`Error creating user: ${error.message}`);
    }
    this.logger.info('User created successfully in auth service:');
    return data;
  }

  async deleteUser(userId: string): Promise<object> {
    const { data, error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) {
      this.logger.error('Error deleting user:', error);
      throw new Error(`Error deleting user: ${error.message}`);
    }
    this.logger.info('User deleted successfully in auth service:');
    return data;
  }
}
