import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';

interface AuthInput {
  email: string;
  password: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}

  async register(input: AuthInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException('Користувач з таким email вже існує');
    }

    const user = this.users.create({
      email,
      name: input.name?.trim() || email.split('@')[0],
      passwordHash: await bcrypt.hash(input.password, 10),
      premiumTier: 'free'
    });

    await this.users.save(user);
    return this.sessionFor(user);
  }

  async login(input: AuthInput) {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    return this.sessionFor(user);
  }

  async profile(userId: string) {
    const user = await this.users.findOneOrFail({ where: { id: userId } });
    return this.publicUser(user);
  }

  private sessionFor(user: UserEntity) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      premiumTier: user.premiumTier
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.publicUser(user)
    };
  }

  private publicUser(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      premiumTier: user.premiumTier,
      premiumUntil: user.premiumUntil
    };
  }
}
