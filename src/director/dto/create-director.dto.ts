import { IsDate, IsNotEmpty, IsString } from 'class-validator'

export class CreateDirectorDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsDate()
  bod: Date

  @IsNotEmpty()
  @IsString()
  nationality: string
}
