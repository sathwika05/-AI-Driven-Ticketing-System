import { Ticket } from "src/ticket/entities/ticket.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export type UserRole = 'user' | 'moderator' | 'admin';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['user', 'moderator', 'admin'], default: 'user' })
  role: UserRole;

  @Column('text', { array: true, default: [] })
  skills: string[];

  @Column({default: ()=>'now()'})
  createdAt: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
  createdTickets: Ticket[];

 @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
  assignedTickets: Ticket[];

}
