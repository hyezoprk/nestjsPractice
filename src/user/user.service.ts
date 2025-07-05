import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateUserDto } from './dto/update-user.dto'
import { hash } from 'bcrypt'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { ConfigService } from '@nestjs/config'
import { ENV } from 'src/common/const/env.const'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService
  ) { }

  async findAll() {
    return await this.userRepository.find()
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id })

    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.')

    return user
  }

  async create(dto: CreateUserDto) {
    const { email, password } = dto
    const user = await this.userRepository.findOneBy({ email })

    if (user) throw new BadRequestException('이미 존재하는 유저입니다.')

    const salt = this.configService.get<number>(ENV.HASH_ROUNDS)
    if (typeof salt !== 'number')
      throw new InternalServerErrorException("Hash rounds를 확인할 수 없습니다.")

    const hashedPassword = await hash(password, salt)
    const newUser = await this.userRepository.save({
      email,
      password: hashedPassword,
    })

    return newUser
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({ id, ...updateUserDto })
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.')

    await this.userRepository.save(user)

    return user
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.')

    await this.userRepository.delete(id)
    return id
  }
}
