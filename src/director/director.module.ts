import { Module } from '@nestjs/common'
import { DirectorController } from './director.controller'
import { DirectorService } from './director.service'
import { Director } from './entities/director.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  controllers: [DirectorController],
  providers: [DirectorService],
  imports: [TypeOrmModule.forFeature([Director])],
})
export class DirectorModule {}
