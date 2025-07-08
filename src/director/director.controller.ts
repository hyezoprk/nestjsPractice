import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { Role } from 'src/user/entities/user.entity'
import { DirectorService } from './director.service'
import { CreateDirectorDto } from './dto/create-director.dto'
import { UpdateDirectorDto } from './dto/update-director.dto'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('director')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get()
  findAll() {
    return this.directorService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.findOne(id)
  }

  @Post()
  @RBAC(Role.ADMIN)
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.create(createDirectorDto)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDirectorDto: UpdateDirectorDto,
  ) {
    return this.directorService.update(id, updateDirectorDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.remove(id)
  }
}
