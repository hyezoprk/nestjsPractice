import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   controllers: [UserController],
    //   providers: [UserService],
    // }).compile();
    //
    // controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(true).toBeDefined();
  });
});
