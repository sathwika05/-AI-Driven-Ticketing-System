import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, Req } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { inngest } from 'src/inngest/client';

@Injectable()
export class TicketService {

    constructor(
            @InjectRepository(Ticket)
            private readonly ticketRepository: Repository<Ticket>
        ){}

   async createTicket(body: any,req){
     try{
       
        const {title, description} = body;
        
        if (!title || !description) {
      throw new BadRequestException('Title and description are required');
    }

        const newTicket= this.ticketRepository.create({title, description, createdBy: req.user.id});
         
        await this.ticketRepository.save(newTicket);

        await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: (await newTicket).id,
        title,
        description,
        createdBy: req.user.id.toString(),
      },
    });

    return {
      status: 201,
      message: "Ticket created and processing started",
      ticket: newTicket
    }

     }
     catch(error){
        console.error("Error creating ticket", error.message);
        throw new HttpException(
    error?.message || 'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
     }
   }

async getTickets(req: any) {
  try {
    const user = req.user;
    let tickets;

    if (user.role !== 'user') {
      tickets = await this.ticketRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['assignedTo'],
        select: ['id', 'title', 'description', 'status', 'createdAt', 'assignedTo'],
      });
    } else {
      tickets = await this.ticketRepository.find({
        where: { createdBy: user.id },
        select: ['title', 'description', 'status', 'createdAt'],
        order: { createdAt: 'DESC' },
      });
    }

    return {
      statusCode: 200,
      data: tickets,
    };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async getTicket(id,req) {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== 'user') {
      ticket = await this.ticketRepository.findOne({
  where: { id },
  relations: ['assignedTo'],
});
    } else {
   ticket = await this.ticketRepository
  .createQueryBuilder('ticket')
  .select(['ticket.title', 'ticket.description', 'ticket.status', 'ticket.createdAt'])
  .where('ticket.id = :id', { id })
  .andWhere('ticket.createdById = :userId', { userId: id })
  .getOne();
    }

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return {
      statusCode: 200,
      ticket,
    };
  } catch (error) {
    console.error('Error fetching ticket', error.message);
    throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}





}
