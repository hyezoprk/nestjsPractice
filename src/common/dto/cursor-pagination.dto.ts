import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator'

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '페이지네이션 커서',
    example: 'eyJ2YWx1ZXMiOnsiaWQiOjF9LCJvcmRlciI6WyJpZF9BU0MiXX0=',
  })
  cursor?: string

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  @ApiProperty({
    description: '내림차 또는 오름차 정령',
    example: ['id_DESC'],
  })
  @Transform(({ value: v }) => (Array.isArray(v) ? v : [v]))
  order: string[] = ['id_DESC']

  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: '받으려는 데이터 숫자',
    example: 1,
  })
  take: number = 5
}
