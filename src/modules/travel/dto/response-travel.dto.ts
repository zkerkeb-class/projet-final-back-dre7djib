import { Expose, Transform } from "class-transformer";

export class TravelResponseDto {
  constructor(partial: Partial<TravelResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose({ name: "id" })
  @Transform(({ obj }) => obj._id?.toString?.() ?? obj._id)
  id: string;

  @Expose()
  user_id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  start_date: string;

  @Expose()
  end_date: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
