import { Exclude } from 'class-transformer';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Generated,
} from 'typeorm';

import {
    JobStatus,
    JobType,
    JobPriority,
    type JobData,
    JobResult,
} from '@shared';

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn()
    @Exclude()
    id: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    nanoId: string;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: JobType,
        default: JobType.MOCK,
        nullable: false,
    })
    type: JobType;

    @Column({
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.PENDING,
        nullable: false,
    })
    status: JobStatus;

    @Column({
        type: 'int',
        default: JobPriority.NORMAL,
        nullable: false,
    })
    priority: JobPriority;

    @Column({ type: 'boolean', default: false, nullable: false })
    autoRetry: boolean;

    @Column({ type: 'int', default: 3, nullable: false })
    maxRetries: number;

    @Column({ type: 'int', default: 0, nullable: false })
    retryCount: number;

    @Column({ type: 'jsonb', nullable: true })
    data: JobData;

    @Column({ type: 'jsonb', nullable: true })
    result: JobResult | null;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
