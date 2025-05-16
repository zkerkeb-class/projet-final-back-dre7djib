import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  user_id: string;

  @Expose()
  email: string;

  @Expose()
  created_at: Date;

  @Exclude()
  password: string;
}
