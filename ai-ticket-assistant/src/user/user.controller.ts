import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/middlewares/jwtauthguard';

@Controller('user')
export class UserController {
     
    constructor(private readonly userService: UserService) {}


     @UseGuards(JwtAuthGuard)
     @Post("/update-user")
        updateUser(@Req() req, @Body() body: any){
              return this.userService.updateUser(req.user, body);
        }
    

     @Post("/signup")
         signUp(@Body() body: any){
               return this.userService.signUp(body);
         }

     

     @Post("/login")
        logIn(@Body() body: any){
             return this.userService.signIn(body);
        }
     
    
      @Post("/logout")
        logOut(@Req() req){
            const authHeader=req.headers['authorization'];
            return this.userService.logout(authHeader);

        }

     @UseGuards(JwtAuthGuard)
     @Get("/users")
     getUsers(@Req() req){
          return this.userService.findAllUsers(req.user);
     }
     

}
