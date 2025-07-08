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
import { CreateGenreDto } from './dto/create-genre.dto'
import { UpdateGenreDto } from './dto/update-genre.dto'
import { GenreService } from './genre.service'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('genre')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @RBAC(Role.ADMIN)
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto)
  }

  @Get()
  @RBAC(Role.ADMIN)
  findAll() {
    return this.genreService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    return this.genreService.update(id, updateGenreDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.genreService.remove(id)
  }
}
