export type Subscription = {
    id: number;
    user_id: number;
    stripe_customer_id: string;
    statut: string;
    start_date: string;
    end_date: string;
    deleted: boolean;
    created_at: string;
}