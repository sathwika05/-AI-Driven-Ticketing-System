import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Ticket{

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;

    @Column()
    description: string;

    @Column({default: 'TODO'})
    status: string;

    @ManyToOne(() => User, (user) => user.createdTickets)
    createdBy: User

    @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
    assignedTo: User;


    @Column({ nullable: true })
    priority: string;

    @Column({ type: 'timestamp', nullable: true })
    deadline:Date;

    @Column({ nullable: true })
    helpfulNotes: string;

    @Column('text', { array: true, default: [] })
    relatedSkills:string[];

    @CreateDateColumn({default:()=>'now()'})
    createdAt: Date;

    
}