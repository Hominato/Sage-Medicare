import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role, TokenStatus } from '@prisma/client';

@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('token/issue')
  @Roles(Role.CLERK, Role.ADMIN)
  issueToken(
    @Body()
    body: {
      department: string;
      patientName?: string;
      patientId?: string;
    },
  ) {
    return this.queueService.issueToken(
      body.department,
      body.patientName,
      body.patientId,
    );
  }

  @Get('recent')
  @Roles(Role.CLERK, Role.ADMIN, Role.DOCTOR, Role.NURSE)
  getRecentTokens(@Query('department') department?: string) {
    return this.queueService.getRecentTokens(department);
  }

  @Patch('token/:id/status')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE) // Doctor or nurse can call the patient
  updateTokenStatus(
    @Param('id') id: string,
    @Body('status') status: TokenStatus,
  ) {
    return this.queueService.updateTokenStatus(id, status);
  }
}
