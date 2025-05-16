import { Expose } from 'class-transformer';

export class ResponseStepDto {
  constructor(partial: Partial<ResponseStepDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  travel_id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  place: string;

  @Expose()
  start_date: string;

  @Expose()
  end_date: string;

  @Expose()
  metadata_fields: object;

  @Expose()
  created_at: string;
}
