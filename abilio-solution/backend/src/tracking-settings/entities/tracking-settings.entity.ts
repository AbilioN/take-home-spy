import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tracking_settings')
export class TrackingSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'minimum_distance_meters', type: 'float' })
  minimumDistanceMeters: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
