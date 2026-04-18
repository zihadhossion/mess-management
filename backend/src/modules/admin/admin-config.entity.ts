import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';

@Entity('admin_config')
export class AdminConfig extends BaseEntity {
  @Column({ name: 'max_members_per_mess', type: 'int', default: 20 })
  maxMembersPerMess: number;

  @Column({
    name: 'default_meal_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  defaultMealRate: number;

  @Column({ name: 'allow_self_registration', type: 'boolean', default: true })
  allowSelfRegistration: boolean;

  @Column({
    name: 'require_email_verification',
    type: 'boolean',
    default: false,
  })
  requireEmailVerification: boolean;

  @Column({ name: 'maintenance_mode', type: 'boolean', default: false })
  maintenanceMode: boolean;

  @Column({ name: 'supported_currencies', type: 'json', default: () => "'[\"BDT\",\"USD\"]'" })
  supportedCurrencies: string[];
}
