import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
// Reduced AppModule; REST routes are mounted via Express

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
