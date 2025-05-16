import { Expose } from "class-transformer";

export class ResponseSubscriptionDto {
  constructor(partial: Partial<ResponseSubscriptionDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  user_id: number;

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