import { Exclude } from 'class-transformer';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Generated,
} from 'typeorm';

export enum JobStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

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
        enum: JobStatus,
        default: JobStatus.PENDING,
        nullable: false,
    })
    status: JobStatus;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
