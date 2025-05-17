import { Expose, Transform } from "class-transformer";

export class ResponseSubscriptionDto {
  constructor(partial: Partial<ResponseSubscriptionDto>) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'id' })
  @Transform(({ obj }) => obj._id?.toString?.() ?? obj._id)
  id: string;

  @Expose()
  user_id: string;

    @Expose()
  stripe_customer_id: string;

    @Expose()
  statut: string;

    @Expose()
  start_date: string;

    @Expose()
  end_date: string;

    @Expose()
  created_at: string;
}