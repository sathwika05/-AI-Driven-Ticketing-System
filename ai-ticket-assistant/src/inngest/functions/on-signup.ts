import { User } from "src/user/entities/user.entity";
import {inngest} from "../client";
import { AppDataSource } from "src/config/data-source";
import { NonRetriableError } from "inngest";
import { sendMail } from "src/utils/mailer";

export const onUserSignup= inngest.createFunction(
   {id: "on-user-signup", retries: 2},
   {event: "user/signup"},
   async({event,step}) => {
       try{

        if(!AppDataSource.isInitialized){
          await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(User);
        
        
           const {email}=event.data

           const user = await step.run("get-user-email",async ()=>{

             const userObject = await userRepo.findOne({where: { email } });
             if(!userObject){
                throw new NonRetriableError("User no longer exists in our database");
             }
              return userObject
           })

           await step.run("send-welcome-email",async ()=>{
              const subject = `Welcome to the app`
              const message = `Hi, 
              \n\n
              Thanks for signing up. We're glad to have you onboard!
              `
              await sendMail(user.email,subject,message)
           })

           return {success: true}
       }
       catch(error){
console.log("Error running step", error.message);
return {success: false}

       }
   }
);