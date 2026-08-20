import { Controller, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsString, MinLength } from 'class-validator';

class CambiarPasswordDto {
  @IsString() passwordActual: string;
  @IsString() @MinLength(6) passwordNueva: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Crea el primer admin — bloqueado si ya existe alguno
  @Post('setup')
  setup(@Body() dto: CreateUsuarioDto) {
    return this.authService.setup(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  cambiarPassword(@Req() req: any, @Body() dto: CambiarPasswordDto) {
    return this.authService.cambiarPassword(
      req.user.userId,
      dto.passwordActual,
      dto.passwordNueva,
    );
  }
}
