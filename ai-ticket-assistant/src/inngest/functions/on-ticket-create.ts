import { inngest } from "../client";
import { AppDataSource } from "src/config/data-source";
import { NonRetriableError } from "inngest";
import { Ticket } from "src/ticket/entities/ticket.entity";
import analyzeTicket from "src/utils/llmai";
import { User } from "src/user/entities/user.entity";
import { Brackets } from "typeorm";
import { sendMail } from "src/utils/mailer";

export type Priority = "low" | "medium" | "high";


export interface AIResponse {
  id?: number;
  priority?: Priority; // comes from AI, so possibly any string
  helpfulNotes?: string;
  relatedSkills?: string[];
}

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },  // Adjust event name if different
  async ({ event, step }) => {
    try {
      // Initialize DB if not already
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

       const ticketRepo = AppDataSource.getRepository(Ticket);
       const userRepo = AppDataSource.getRepository(User);

      const { ticketId } = event.data;

      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObj = await ticketRepo.findOne({ where: { id: ticketId } });
        if (!ticketObj) {
          throw new NonRetriableError("Ticket not found in DB.");
        }
        return ticketObj;
      });

      // You can use the `ticket` object here
      console.log("Ticket fetched:", ticket);

      await step.run("update-ticket-status",async()=>{
        await ticketRepo.update(ticket.id,{status:"TODO"})
      });

      const aiResponse:AIResponse | null = await analyzeTicket(ticket);

      const relatedskills = await step.run("ai-processing",async()=>{
             let skills: string[] = []
             if(aiResponse){
                 const related = aiResponse.relatedSkills ?? [];

                 await ticketRepo.update(ticket.id,{
                  priority:aiResponse.priority ?? "medium",
                  helpfulNotes: aiResponse.helpfulNotes,
                  status: "IN_PROGRESS",
                  relatedSkills: aiResponse.relatedSkills,
                });

                skills = related.filter(
      (s): s is string => typeof s === "string" && s.trim() !== ""
    );
             }
             return skills;
      });

      const moderator = await step.run("assign-moderator", async()=>{
            const query=await userRepo.createQueryBuilder("user")
                 .where("user.role = :role", {role: "moderator"});

            if (relatedskills.length > 0) {
               query.andWhere(
      new Brackets((qb) => {
        relatedskills.forEach((skill, index) => {
          qb.orWhere(`LOWER(:skill${index}) = ANY(ARRAY(SELECT LOWER(s) FROM unnest(user.skills) s))`, {
            [`skill${index}`]: skill.toLowerCase(),
          });
        });
      })
    );
  }

  let user = await query.getOne();

  if(!user){
    user = await userRepo.findOne({where: {role: "admin"}});
  }

  if(user){
    await ticketRepo.update(ticket.id, {
  assignedTo: user ? { id: user.id } : null as any
});
  }
      return user;
      });

      await step.run("send-email-notification", async()=>{
        if (moderator){
               const finalTicket = await ticketRepo.findOne({ where: { id: ticketId } });
            if (finalTicket) {
    await sendMail(
      moderator.email,
      "Ticket Assigned",
      `A new ticket is assigned to you: ${finalTicket.title}`
    );
  }
        }

      });
   
      return { success: true };


    } catch (error) {
      console.log("Error running the inngest steps", error.message);
      return { success: false };
    }
  }
);
