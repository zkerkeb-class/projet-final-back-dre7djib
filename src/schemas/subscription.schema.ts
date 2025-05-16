import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Subscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop()
  stripe_customer_id: string;

  @Prop()
  statut: string;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop({ default: false })
  deleted: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);