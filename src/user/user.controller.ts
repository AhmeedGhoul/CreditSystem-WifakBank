import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post, Query, Request,
  Res, UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request as ExpressRequest, Response } from 'express';
import { CreateUserDto, GrantRoleDto, RequestPasswordResetDto, UpdateUserDto, UserLoginDto } from './dto/UserDto.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './Roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { JwtUser } from './strategy/jwt-user.interface';

@Controller('user')
export class UserController {
  constructor(private userService:UserService) {
  }


  @Get('users/search')
  getUsers(@Query() query: any) {
    return this.userService.searchUsers(query);
  }
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token } = await this.userService.signin(dto);

    res.cookie('access_token', access_token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });


    return { message: 'Login successful' };
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: 'Logout successful' };
  }
  @HttpCode(HttpStatus.OK)

  @Delete('delete/:id')
  deleteUser(@Param('id',ParseIntPipe)userId:number){
    return this.userService.deleteUser(userId);
  }
  @HttpCode(HttpStatus.OK)
  @Patch('modify/:id')

  modifyUser(
    @Param('id',ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.editUser(dto, userId);
  }
@HttpCode(HttpStatus.OK)
@Post('promote/:id')
  promoteUser(@Param('id',ParseIntPipe)userId:number,@Body()dto:GrantRoleDto){
    return this.userService.grantRole(userId,dto.roleName)
}

  @HttpCode(HttpStatus.OK)
  @Post('demote/:id')
  demoteUser(@Param('id',ParseIntPipe)userId:number,@Body()dto:GrantRoleDto){
    return this.userService.DemoteRole(userId,dto.roleName)
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('has-access')
  async checkUserAccess(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    const hasAccess = await this.userService.userHasAccess(user.userId);
    return { hasAccess };
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('current-user')
  async getUser(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    const hasAccess = await this.userService.getUser(user.userId);
    return { hasAccess };
  }
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.userService.sendPasswordResetEmail(dto.email);
    return { message: 'Reset email sent successfully.' };
  }
  @Post('reset-password')
  async resetPassword(@Body() body: { password: string; token: string }) {
    return this.userService.resetPassword(body.password, body.token)
  }

}
