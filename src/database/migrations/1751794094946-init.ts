import { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1751794094946 implements MigrationInterface {
  name = 'Init1751794094946'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "director" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "name" character varying NOT NULL, "bod" TIMESTAMP NOT NULL, "nationality" character varying NOT NULL, CONSTRAINT "PK_b85b179882f31c43324ef124fea" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "genre" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "name" character varying NOT NULL, CONSTRAINT "UQ_dd8cd9e50dd049656e4be1f7e8c" UNIQUE ("name"), CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "movie_detail" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "detail" character varying NOT NULL, CONSTRAINT "PK_e3014d1b25dbc9648b9abc58537" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "movie" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "title" character varying NOT NULL, "movieFilePath" text, "likeCount" integer NOT NULL DEFAULT '0', "dislikeCount" integer NOT NULL DEFAULT '0', "creatorId" integer, "detailId" integer NOT NULL, "directorId" integer NOT NULL, CONSTRAINT "REL_87276a4fc1647d6db559f61f89" UNIQUE ("detailId"), CONSTRAINT "PK_cb3bb4d61cf764dc035cbedd422" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "movie_user_like" ("movieId" integer NOT NULL, "userId" integer NOT NULL, "isLike" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_55397b3cefaa6fc1b47370fe84e" PRIMARY KEY ("movieId", "userId"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "email" character varying NOT NULL, "password" character varying NOT NULL, "role" integer NOT NULL DEFAULT '2', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "genre_movies_movie" ("genreId" integer NOT NULL, "movieId" integer NOT NULL, CONSTRAINT "PK_5b787840ea6352039c37c32e8f0" PRIMARY KEY ("genreId", "movieId"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_dff457c114a6294863814818b0" ON "genre_movies_movie" ("genreId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e59764a417d4f8291747b744fa" ON "genre_movies_movie" ("movieId") `,
    )
    await queryRunner.query(
      `ALTER TABLE "movie" ADD CONSTRAINT "FK_b55916de756e46290d52c70fc04" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie" ADD CONSTRAINT "FK_87276a4fc1647d6db559f61f89a" FOREIGN KEY ("detailId") REFERENCES "movie_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie" ADD CONSTRAINT "FK_a32a80a88aff67851cf5b75d1cb" FOREIGN KEY ("directorId") REFERENCES "director"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie_user_like" ADD CONSTRAINT "FK_fd47c2914ce011f6966368c8486" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie_user_like" ADD CONSTRAINT "FK_6a4d1cde9def796ad01b9ede541" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "genre_movies_movie" ADD CONSTRAINT "FK_dff457c114a6294863814818b0f" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "genre_movies_movie" ADD CONSTRAINT "FK_e59764a417d4f8291747b744faa" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "genre_movies_movie" DROP CONSTRAINT "FK_e59764a417d4f8291747b744faa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "genre_movies_movie" DROP CONSTRAINT "FK_dff457c114a6294863814818b0f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie_user_like" DROP CONSTRAINT "FK_6a4d1cde9def796ad01b9ede541"`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie_user_like" DROP CONSTRAINT "FK_fd47c2914ce011f6966368c8486"`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie" DROP CONSTRAINT "FK_a32a80a88aff67851cf5b75d1cb"`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie" DROP CONSTRAINT "FK_87276a4fc1647d6db559f61f89a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "movie" DROP CONSTRAINT "FK_b55916de756e46290d52c70fc04"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e59764a417d4f8291747b744fa"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dff457c114a6294863814818b0"`,
    )
    await queryRunner.query(`DROP TABLE "genre_movies_movie"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TABLE "movie_user_like"`)
    await queryRunner.query(`DROP TABLE "movie"`)
    await queryRunner.query(`DROP TABLE "movie_detail"`)
    await queryRunner.query(`DROP TABLE "genre"`)
    await queryRunner.query(`DROP TABLE "director"`)
  }
}
