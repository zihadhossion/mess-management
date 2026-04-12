import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

dotenv.config();

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME;

  if (!email || !password || !fullName) {
    console.error(
      'Missing required env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME',
    );
    process.exit(1);
  }

  await AppDataSource.initialize();

  try {
    const userRepo = AppDataSource.getRepository(User);

    const existing = await userRepo.findOneBy({ email });
    if (existing) {
      console.log(`Admin user already exists, skipping: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = userRepo.create({
      email,
      passwordHash,
      fullName,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
      isSuspended: false,
      isBanned: false,
    });

    await userRepo.save(admin);
    console.log(`Admin user created: ${email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
