import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateDirectorDto } from './dto/create-director.dto'
import { UpdateDirectorDto } from './dto/update-director.dto'
import { Director } from './entities/director.entity'

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  getRepository() {
    return this.directorRepository
  }

  async findAll() {
    const repo = this.directorRepository
    const directors = await repo.find()

    return directors
  }

  async findOne(id: number) {
    const repo = this.directorRepository
    const director = await repo.findOneBy({ id })

    return director
  }

  async create(createDirectorDto: CreateDirectorDto) {
    const repo = this.directorRepository

    const obj = repo.create(createDirectorDto)
    const director = await repo.save(obj)

    return director
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = this.findOne(id)
    if (!director)
      throw new NotFoundException('해당하는 감독을 찾을 수 없습니다.')

    const repo = this.directorRepository
    await repo.update(id, updateDirectorDto)

    return `This action updates a #${id} director`
  }

  async remove(id: number) {
    const director = this.findOne(id)
    if (!director) throw new NotFoundException('이미 존재하지 않는 감독입니다.')

    const repo = this.directorRepository
    await repo.delete(id)

    return `This action removes a #${id} director`
  }
}
