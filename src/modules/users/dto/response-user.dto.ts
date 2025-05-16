import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'id' })
  @Transform(({ obj }) => obj._id?.toString?.() ?? obj._id)
  id: string;

  @Expose()
  user_id: string;

  @Expose()
  email: string;

  @Expose()
  created_at: Date;

  @Exclude()
  password: string;
}
