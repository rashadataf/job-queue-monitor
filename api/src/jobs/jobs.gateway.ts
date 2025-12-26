import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JobSocketEvent, JobStatusUpdatedPayload, Job } from '@shared';

const corsOrigin = process.env.CORS_ORIGIN || '*';
const origin = corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin;

@WebSocketGateway({
    cors: {
        origin,
    },
})
export class JobsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(JobsGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    emitJobStatusUpdate(payload: JobStatusUpdatedPayload) {
        this.server.emit(JobSocketEvent.JOB_STATUS_UPDATED, payload);
    }

    emitJobCreated(job: Job) {
        this.server.emit(JobSocketEvent.JOB_CREATED, { job });
    }
}
