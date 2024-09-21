import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('token_statistics')
export class TokenStatisticsEntity {

  @PrimaryColumn({ name: 'token_id' })
  tokenId: string;

  @Column({ name: 'token_name' })
  tokenName: string;


  @Column({ type: 'bigint' })
  max: string;


  @Column({ type: 'bigint' })
  mint: string;

  @Column()
  holders: number;

  @CreateDateColumn({ name: 'deploy_time' })
  deployTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
