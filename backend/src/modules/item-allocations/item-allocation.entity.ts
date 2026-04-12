import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/base/base.entity';
import { ItemAllocationStatus } from '../../common/enums/item-allocation-status.enum';
import { ItemType } from '../item-types/item-type.entity';
import { MessMember } from '../mess-members/mess-member.entity';

@Entity('item_allocations')
@Index(['messMemberId', 'date'])
export class ItemAllocation extends BaseEntity {
  @Column({ name: 'item_type_id' })
  @Index()
  itemTypeId: string;

  @Column({ name: 'mess_member_id' })
  @Index()
  messMemberId: string;

  @Column({ name: 'date', type: 'date' })
  @Index()
  date: Date;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ItemAllocationStatus,
    default: ItemAllocationStatus.ALLOCATED,
  })
  @Index()
  status: ItemAllocationStatus;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @ManyToOne(() => ItemType, (itemType) => itemType.allocations)
  @JoinColumn({ name: 'item_type_id' })
  itemType: ItemType;

  @ManyToOne(() => MessMember, (member) => member.itemAllocations)
  @JoinColumn({ name: 'mess_member_id' })
  messMember: MessMember;
}
