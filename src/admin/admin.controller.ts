// admin.controller.ts 

import { 
  Controller, Post, Get, Put, Patch, Delete, Body, Param, Query, 
  UseInterceptors, UploadedFile, BadRequestException, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { AdminService } from './admin.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/admin.dto';
import { Admin_pipe } from './pipes/admin_pipe.pipe';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';        // we'll create this
import { Roles } from './auth/roles.decorator';          // custom decorator

@Controller('admin') 
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  // ================= USER ROUTES =================
  @Post('register') // POST /admin/register → public admin registration
  async register(@Body(Admin_pipe) dto: CreateUserDto) {
    return this.adminService.registerAdmin(dto);
  }

  @Post('setup') // POST /admin/setup → legacy alias for admin registration
  async setup(@Body(Admin_pipe) dto: CreateUserDto) {
    return this.adminService.registerAdmin(dto);
  }

  @Post() // POST /admin → create user with optional NID image (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)   // 🔒 protect + role check
  @Roles('admin')                         // only admin can create users
  @UseInterceptors(FileInterceptor('nidImage', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads/nid'),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        cb(null, `nid-${uniqueSuffix}.${ext}`);
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      ['image/jpeg', 'image/png'].includes(file.mimetype)
        ? cb(null, true)
        : cb(new BadRequestException('Only JPEG/PNG allowed'), false);
    },
  }))
  create(@Body(Admin_pipe) dto: CreateUserDto, @UploadedFile() nidImage?: Express.Multer.File) {
    return this.adminService.create(dto, nidImage);
  }

  // ... rest of the controller unchanged


  @Get() // GET /admin → get all users (optional role filter)
  findAll(@Query('role') role: string) {
    return this.adminService.findAll(role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all') // GET /admin/all → protected route, get all users
  findAllProtected() {
    return this.adminService.findAll();
  }

  @Get(':id') // GET /admin/:id → get user by id
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Put(':id') // PUT /admin/:id → update user by id
  update(@Param('id') id: string, @Body(Admin_pipe) dto: UpdateUserDto) {
    return this.adminService.update(id, dto);
  }

  @Patch(':id/role') // PATCH /admin/:id/role → assign role to user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  assignRole(@Param('id') id: string, @Body(Admin_pipe) dto: AssignRoleDto) {
    return this.adminService.assignRole(id, dto);
  }

  @Delete(':id') // DELETE /admin/:id → remove user
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  // ================= LOGS & OTHER ROUTES =================
  @Get('logs/all') // GET /admin/logs/all → get all logs
  logs() {
    return this.adminService.logs();
  }

  @Post('login') // POST /admin/login → login route, returns JWT
  login(@Body() body: { email: string, password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('backup') // POST /admin/backup → backup database
  backup() {
    return this.adminService.backup();
  }

  @Post('restore') // POST /admin/restore → restore database from backup snapshot
  restore(@Body() body: any) {
    return this.adminService.restore(body);
  }
}