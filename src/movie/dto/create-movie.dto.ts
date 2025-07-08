import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'
import { Genre } from 'src/genre/entities/genre.entity'

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화제목',
    example: '해리 포터',
  })
  title: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화 설명',
    example: '마법 지팡이 도둑',
  })
  detail: string

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '디렉터 ID',
    example: 1,
  })
  directorId: number

  @ArrayNotEmpty()
  @IsArray()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @Type(() => Number)
  @ApiProperty({
    description: '장르 Ids',
    example: [1, 2, 3],
  })
  genreIds: Genre[]

  @IsString()
  @ApiProperty({
    description: '영화 파일 이름',
    example: 'aaa-bbb-ccc-ddd.png',
  })
  movieFileName: string
}
