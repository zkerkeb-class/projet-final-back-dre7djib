import { IsString } from "class-validator";

export class CreateSubscriptionDto {
    @IsString()
    user_id: string;

    @IsString()
    stripe_customer_id: string;

    @IsString()
    statut: string;

    @IsString()
    start_date: string;

    @IsString()
    end_date: string;

    @IsString()
    created_at: string;
}
