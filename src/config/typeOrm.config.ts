import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig = config.get('db');
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'blogApi',
  synchronize: true,
  autoLoadEntities: true,
};
// export const typeOrmConfig: TypeOrmModuleOptions = {
//   type: process.env.DBTYPE || dbConfig.type,
//   host: dbConfig.host,
//   port: dbConfig.post,
//   username: dbConfig.username,
//   password: 'root',
//   database: dbConfig.database,
//   synchronize: dbConfig.synchronize,
//   autoLoadEntities: true,
// };
