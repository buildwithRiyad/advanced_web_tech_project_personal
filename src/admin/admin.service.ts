import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  private users: any[] = [];

create(dto: CreateUserDto, nidImage?: any) {
  const user = {
    id: Date.now().toString(),
    ...dto,
    nidImage: nidImage ? {
      filename: nidImage.filename,
      path: nidImage.path,
      size: nidImage.size,
      mimetype: nidImage.mimetype,
    } : null,
  };
  this.users.push(user);
  return { data: user };
}

  findAll(role?: string) {
    if (role) {
      return { data: this.users.filter(u => u.role === role) };
    }
    return { data: this.users };
  }

  findOne(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { data: user };
  }

  update(id: string, dto: UpdateUserDto) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    Object.assign(user, dto);
    return { data: user };
  }

  assignRole(id: string, dto: AssignRoleDto) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.role = dto.role;
    return { data: user };
  }

  remove(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users = this.users.filter(u => u.id !== id);
    return { message: 'deleted' };
  }

  logs() {
    return { data: [] };
  }

  backup() {
    return { data: JSON.stringify(this.users) };
  }
}