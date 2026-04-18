import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';

@Entity('email_templates')
export class EmailTemplate extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;
}
