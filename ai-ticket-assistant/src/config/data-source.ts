import { Ticket } from "src/ticket/entities/ticket.entity";
import { User } from "src/user/entities/user.entity";
import { DataSource } from "typeorm";



export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Ticket],
  synchronize: true, // Be careful: this drops/creates tables if changed
});

