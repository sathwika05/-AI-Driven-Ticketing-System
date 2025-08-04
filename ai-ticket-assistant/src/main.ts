import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { serve } from 'inngest/express';
import { inngest } from './inngest/client';
import { onUserSignup } from './inngest/functions/on-signup';
import { onTicketCreated } from './inngest/functions/on-ticket-create';

async function bootstrap() {
  try{
  
  const app = await NestFactory.create(AppModule);
  
   // Add Inngest route
    app.use(
      '/inngest',
      serve({
        client: inngest,
        functions: [onUserSignup, onTicketCreated],
      }),
    );
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  }
  catch(e){
    console.error('App failed to start:', e);
  }
}
bootstrap();
