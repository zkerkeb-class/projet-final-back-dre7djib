import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Step extends Document {
  @Prop({ type: Types.ObjectId, ref: "Travel", required: true })
  travel_id: Types.ObjectId;

  @Prop()
  type: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  place: string;

  @Prop()
  location: string;

  @Prop({ type: Object })
  metadata_fields: Record<string, any>;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;
}

export const StepSchema = SchemaFactory.createForClass(Step);
