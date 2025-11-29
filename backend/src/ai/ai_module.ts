import { Module } from '@nestjs/common';
import { AiController } from './ai_controller';
import { AiService } from './ai_service';

@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

