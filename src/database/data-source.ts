import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'

dotenv.config()

export default new DataSource({
  type: process.env.TYPE as 'postgres',
  host: process.env.HOST,
  port: parseInt(process.env.PORT || '5432'),
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
})
