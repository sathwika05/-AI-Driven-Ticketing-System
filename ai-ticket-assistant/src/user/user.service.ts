import { ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import {User} from "./entities/user.entity"
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { inngest } from 'src/inngest/client';




@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

  async signUp(body: any) {
    const { email, password, skills = [] } = body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({ email, password: hashed, skills });
      await this.userRepository.save(user);

      await inngest.send({
        name: "user/signup",
        data: { email }
      });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET
      );

      return { user, token };
    } catch (error) {
      throw new InternalServerErrorException({ message: "Signup failed", details: error.message });
    }
  }

async signIn(body: any) {
    const { email, password } = body;
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new UnauthorizedException("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedException("Invalid credentials");

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET
      );

      return { user, token };
    } catch (error) {
      throw new InternalServerErrorException({ message: "SignIn failed", details: error.message });
    }
  }
    

     async logout(authHeader: string) {
    try {
      const token = authHeader?.split(" ")[1];
      if (!token) throw new UnauthorizedException("Unauthorized");

      jwt.verify(token, process.env.JWT_SECRET);
      return { message: "Logout successfully" };
    } catch (error) {
      throw new UnauthorizedException({ message: "Logout failed", details: error.message });
    }
  }

async updateUser(user: any, body: any) {
  const { skills = [], role, email } = body;
  try {
    if (user?.role !== "admin") throw new ForbiddenException("Access Forbidden");

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (!existingUser) throw new UnauthorizedException("User not found");

    await this.userRepository.update(
      { email },
      {
        skills: skills.length ? skills : existingUser.skills,
        role
      }
    );

    return { message: "User updated successfully" };
  } catch (error) {
    throw new InternalServerErrorException({ message: "Update failed", details: error.message });
  }
}

async findAllUsers(user: any) {
  try {
    if (user.role !== "admin") throw new ForbiddenException("Forbidden");

    const users = await this.userRepository.find({
      select: ['id', 'email', 'role', 'skills']
    });

    return users;
  } catch (error) {
    throw new InternalServerErrorException({ message: "Fetch failed", details: error.message });
  }
 }

}

