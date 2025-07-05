import { BadRequestException } from '@nestjs/common'
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'
import { CursorPaginationDto } from './dto/cursor-pagination.dto'
import { PagePaginationDto } from './dto/page-pagination.dto'

interface Cursor {
  values: {}
  order: string[]
}

export class CommonService {
  constructor() { }

  async applyCursorPaginationParamsToQb<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    // eslint-disable-next-line prefer-const
    let { cursor, order, take } = dto

    if (cursor) {
      const decodedCursor: Cursor = JSON.parse(atob(cursor))
      const { values } = decodedCursor

      order = decodedCursor.order
      const fields = Object.keys(values)
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>'
      const whereConditions = fields.map((f) => `${qb.alias}.${f}`).join(',')
      const whereParams = fields.map((f) => `:${f}`).join(',')
      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      )
    }

    for (let i = 0; i < order.length; i++) {
      const [field, direction] = order[i].split('_')
      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException('정렬 방향은 ASC 또는 DESC 여야 합니다.')
      }

      if (i === 0) {
        qb.orderBy(`${qb.alias}.${field}`, direction)
      } else {
        qb.addOrderBy(`${qb.alias}.${field}`, direction)
      }
    }

    qb.take(take + 1)

    const data = await qb.getMany()
    let hasNext = false
    if (data.length > take) {
      hasNext = true
      data.pop()
    }
    const nextCursor = hasNext ? this.generateNextCursor(data, order) : null

    return { qb, nextCursor }
  }

  generateNextCursor<T>(result: T[], order: string[]): string | null {
    if (result.length === 0) return null

    const lastItem = result[result.length - 1] as Record<string, any>

    const values: Record<string, string> = {}
    order.forEach((fieldOrder) => {
      const [field, _] = fieldOrder.split('_')
      values[field] = lastItem[field]
    })

    const cursorObj = { values, order }

    const nextCursor = btoa(JSON.stringify(cursorObj))

    return nextCursor
  }

  applyPagePaginationParamsToQb<T extends ObjectLiteral>(
    dto: PagePaginationDto,
    qb?: SelectQueryBuilder<T>,
  ) {
    const { page, take } = dto
    const skip = (page - 1) * take

    if (!qb) return { skip, take }
    else {
      qb.skip(skip)
      qb.take(take)
      return qb
    }
  }
}
