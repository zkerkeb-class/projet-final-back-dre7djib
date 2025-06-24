import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPreferencesDocument = UserPreferences & Document;

@Schema({ timestamps: true })
export class UserPreferences {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({
    type: {
      showRoutes: { type: Boolean, default: false },
      defaultTransportMode: { type: String, enum: ['driving', 'walking', 'flying'], default: 'driving' },
      autoShowRoutes: { type: Boolean, default: false }
    },
    default: {
      showRoutes: false,
      defaultTransportMode: 'driving',
      autoShowRoutes: false
    }
  })
  routePreferences: {
    showRoutes: boolean;
    defaultTransportMode: 'driving' | 'walking' | 'flying';
    autoShowRoutes: boolean;
  };

  @Prop({ type: Object, default: {} })
  otherPreferences: Record<string, any>;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);