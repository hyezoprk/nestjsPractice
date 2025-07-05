import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm'

export abstract class BaseTable {
  @PrimaryGeneratedColumn()
  @ApiHideProperty()
  id: number

  @CreateDateColumn()
  @ApiHideProperty()
  createdAt: Date

  @UpdateDateColumn()
  @Exclude({
    toPlainOnly: true,
  })
  @ApiHideProperty()
  updatedAt: Date

  @VersionColumn({
    default: 1,
  })
  @Exclude({
    toPlainOnly: true,
  })
  @ApiHideProperty()
  version: number
}
