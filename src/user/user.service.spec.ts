import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import * as bycrypt from 'bcrypt';

const mockUserRepository = {
  findOneBy: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
}
const mockConfigService = {
  get: jest.fn()
}

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe("create", () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        email: "hyezo@google.com", password: "123456789"
      }, hashRound = 10, hashedPassword = "asdjkfjecjkvzxvcjkqww", newUser = { id: 1, email: dto.email, password: hashedPassword }

      // 1. 생성된 적이 없어야 함
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(mockConfigService, 'get').mockReturnValue(hashRound)
      jest.spyOn(bycrypt, 'hash').mockImplementation(async (_password, _hashRound) => hashedPassword)
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(newUser)

      const result = await userService.create(dto)

      expect(result).toEqual(newUser)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: dto.email })
      expect(mockConfigService.get).toHaveBeenCalledWith(expect.anything())
      // expect(bycrypt.hash).toHaveBeenCalledWith(dto.password, hashRound)
      expect(mockUserRepository.save).toHaveBeenCalledWith({ email: dto.email, password: hashedPassword })
    })

    it('should throw a BadRequestException if email already exists', () => {
      const dto: CreateUserDto = {
        email: "dfk@naver.com",
        password: 'qweqwe',
      }

      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue({
        id: 1,
        email: dto.email,
      })

      expect(userService.create(dto)).rejects.toThrow(BadRequestException)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: dto.email })
    })
  })

  describe("findAll", () => {
    it('should return all users', async () => {
      const users = [{
        id: 1,
        email: 'hyezo@naver.com',
      }]

      mockUserRepository.find.mockResolvedValue(users)

      const result = await userService.findAll()

      expect(result).toEqual(users)
      expect(mockUserRepository.find).toHaveBeenCalled()
    })
  })

  describe("findOne", () => {
    it('should return a user by id', async () => {
      const user = { id: 100, email: "code@google.com" }
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(user)
      const result = await userService.findOne(100)

      expect(result).toEqual(user)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: 100
      })
    })

    it('should throw error if user doesn\'t exist', async () => {
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null)

      expect(userService.findOne(1)).rejects.toThrow(NotFoundException)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
    })
  })

  describe("remove", () => {
    it('should remove a user by id', async () => {
      const id = 999
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue({ id: 1 })
      const result = await userService.remove(id)

      expect(result).toEqual(id)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id })
    })

    it('should throw an error if userId doesn\'t exist', async () => {
      jest.spyOn(mockUserRepository, 'findOneBy').mockResolvedValue(null)

      expect(userService.remove(999)).rejects.toThrow(NotFoundException)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 999 })
    })
  })



});
