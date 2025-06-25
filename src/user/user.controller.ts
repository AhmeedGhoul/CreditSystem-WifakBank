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
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { CreateUserDto, GrantRoleDto, UpdateUserDto, UserLoginDto } from './dto/UserDto.dto';

@Controller('user')
export class UserController {
  constructor(private userService:UserService) {
  }
  @Get()
  async getUsers(@Res() res: Response) {
    const data = await this.userService.getUsers();
    return res.status(200).json({ status: 'success', data });
  }
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto:UserLoginDto){
    return this.userService.signin(dto)}
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
}
