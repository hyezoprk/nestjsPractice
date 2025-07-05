import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { Cron, SchedulerRegistry } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { readdir, unlink } from 'fs/promises'
import { join, parse } from 'path'
import { Repository } from 'typeorm'
import { Movie } from 'src/movie/entities/movie.entity'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) { }

  // @Cron('*/5 * * * * *')
  async everySecond() {
    if (!this.logger.verbose) return

    this.logger.verbose("5초마다 실행중!", TasksService.name)
  }

  // @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'tmp'))

    const deleteFilesTargets = files.filter((f) => {
      const filename = parse(f).name
      const split = filename.split('_')
      if (split.length !== 2) return

      try {
        const date = new Date(parseInt(split.at(-1)!))
        const now = Date.now()
        const ONE_DAY = 24 * 60 * 60 * 1000

        const isExpired = now - date.getTime() > ONE_DAY
        return isExpired
      } catch (e) {
        return true
      }
    })

    for (let i = 0; i < deleteFilesTargets.length; i++) {
      await Promise.all(
        deleteFilesTargets.map((f) =>
          unlink(join(process.cwd(), 'public', 'tmp', f)),
        ),
      )
    }
  }

  @Cron('* * * * * *')
  async calculateMovieLikeCounts() {
    await this.movieRepository.query(`
      UPDATE movie m
        SET "likeCount" = (
          SELECT count (*) FROM movie_user_like mul
          WHERE m.id = mul."movieId"
          AND mul."isLike" = true
        )
    `)

    await this.movieRepository.query(`
      UPDATE movie m
        SET "dislikeCount" = (
          SELECT count (*) FROM movie_user_like mul
          WHERE m.id = mul."movieId"
          AND mul."isLike" = false
        )
    `)
  }
}
