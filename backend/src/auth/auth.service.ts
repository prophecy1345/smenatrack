import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email уже зарегистрирован');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.save({
      email: dto.email,
      passwordHash,
      shiftPattern: dto.shiftPattern,
      shiftStartDate: dto.shiftStartDate,
      timeZone: dto.timeZone,
    });
    // возвращаем профиль БЕЗ хэша: всё, что вернул этот метод, уйдёт клиенту в ответе на POST /auth/register
    const { passwordHash: _hash, ...profile } = user;
    return profile;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOneBy({ email: dto.email });
    const isValid =
      user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!isValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const accessToken = this.jwtService.sign({ sub: user.id });
    return { accessToken };
  }

  async me(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // update() не бросает 404 сам: без явной проверки чужой/удалённый id молча ничего не изменит
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    await this.usersRepository.update(userId, dto);
    return this.me(userId);
  }
}
