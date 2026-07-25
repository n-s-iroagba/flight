import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { AdminUser } from '../models';
import logger from '../config/logger';

export class AuthService {
  async seedAdminUser() {
    try {
      const existingAdmin = await AdminUser.findOne({ where: { username: 'Daniel' } });
      if (!existingAdmin) {
        const password_hash = await bcrypt.hash('Daniel123', 10);
        await AdminUser.create({
          username: 'Daniel',
          email: 'daniel@admin.com',
          password_hash,
          full_name: 'Daniel',
          role: 'super_admin',
        });
        logger.info('Default admin user seeded: username Daniel');
      }
    } catch (error) {
      logger.error('Failed to seed admin user:', error);
    }
  }

  async login(username: string, password: string) {
    const user = await AdminUser.findOne({ where: { username } });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRATION as any }
    );

    await user.update({ last_login: new Date() });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      }
    };
  }
}

export default new AuthService();
