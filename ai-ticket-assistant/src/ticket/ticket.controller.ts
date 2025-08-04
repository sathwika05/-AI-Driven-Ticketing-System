import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from 'src/middlewares/jwtauthguard';

@Controller('ticket')
@UseGuards(JwtAuthGuard)
export class TicketController {
   constructor(private readonly ticketsService: TicketService) {}

  @Post()
  async createTicket(@Body() body: any, @Req() req: any) {
    return this.ticketsService.createTicket(body, req);
  }

  @Get()
  async getTickets(@Req() req: any) {
    return this.ticketsService.getTickets(req);
  }

  @Get(':id')
  async getTicket(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.getTicket(id, req);
  }
    
}
