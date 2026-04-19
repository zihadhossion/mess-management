import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';

@Entity('admin_config')
export class AdminConfig extends BaseEntity {
  @Column({ name: 'max_members_per_mess', type: 'int', default: 20 })
  maxMembersPerMess: number;

  @Column({ name: 'supported_currencies', type: 'json', default: () => "'[\"BDT\",\"USD\"]'" })
  supportedCurrencies: string[];
}
