import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const logger = new Logger('Seeder');

interface FixtureUser {
  role: string;
  email: string;
  password: string;
  name: string;
  mess_id?: string;
}

interface FixtureMess {
  id: string;
  name: string;
  manager_email: string;
  status: string;
  address: string;
  currency: string;
}

interface Fixtures {
  users: FixtureUser[];
  messes: FixtureMess[];
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const dataSource = app.get<DataSource>(getDataSourceToken());

  // Read fixtures
  const fixturesPath = path.join(
    __dirname,
    '../../../../.claude-project/user_stories/_fixtures.yaml',
  );
  const fixturesContent = fs.readFileSync(fixturesPath, 'utf8');
  const fixtures = yaml.load(fixturesContent) as Fixtures;

  const usersRepo = dataSource.getRepository('User');
  const messesRepo = dataSource.getRepository('Mess');
  const messMembersRepo = dataSource.getRepository('MessMember');

  // 1. Upsert users
  const userMap: Record<string, Record<string, unknown>> = {};
  for (const u of fixtures.users) {
    const role =
      u.role === 'admin'
        ? 'ADMIN'
        : u.role === 'manager'
          ? 'MANAGER'
          : 'MEMBER';
    let existing = await usersRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      existing = usersRepo.create({
        email: u.email,
        passwordHash,
        fullName: u.name,
        role,
        isEmailVerified: true,
        isActive: true,
      });
      await usersRepo.save(existing);
      logger.log(`Created user: ${u.email} (${role})`);
    } else {
      logger.log(`User already exists: ${u.email}`);
    }
    userMap[u.email] = existing as Record<string, unknown>;
  }

  // 2. Upsert messes
  for (const m of fixtures.messes) {
    const manager = userMap[m.manager_email];
    if (!manager) {
      logger.warn(
        `Manager ${m.manager_email} not found, skipping mess ${m.id}`,
      );
      continue;
    }

    let mess = await messesRepo.findOne({ where: { messId: m.id } });
    if (!mess) {
      mess = messesRepo.create({
        name: m.name,
        address: m.address,
        currency: m.currency.toUpperCase(),
        messId: m.id,
        status: 'ACTIVE',
        managerId: manager['id'],
        requiresJoinApproval: true,
      });
      await messesRepo.save(mess);
      logger.log(`Created mess: ${m.name} (${m.id})`);
    } else {
      logger.log(`Mess already exists: ${m.id}`);
    }

    // 3. Add member to mess
    const memberFixture = fixtures.users.find(
      (u) => u.mess_id === m.id && u.role === 'member',
    );
    if (memberFixture) {
      const memberUser = userMap[memberFixture.email];
      if (memberUser) {
        const existingMembership = await messMembersRepo.findOne({
          where: { messId: mess['id'], userId: memberUser['id'] },
        });
        if (!existingMembership) {
          const membership = messMembersRepo.create({
            messId: mess['id'],
            userId: memberUser['id'],
            memberRole: 'MEMBER',
            joinDate: new Date(),
            isActive: true,
            participatesInMeals: true,
          });
          await messMembersRepo.save(membership);
          logger.log(`Added member ${memberFixture.email} to mess ${m.id}`);
        } else {
          logger.log(`Member ${memberFixture.email} already in mess ${m.id}`);
        }
      }
    }

    // 4. Add manager as member too
    const managerFixture = fixtures.users.find(
      (u) => u.email === m.manager_email,
    );
    if (managerFixture) {
      const managerUser = userMap[m.manager_email];
      if (managerUser) {
        const existingMembership = await messMembersRepo.findOne({
          where: { messId: mess['id'], userId: managerUser['id'] },
        });
        if (!existingMembership) {
          const membership = messMembersRepo.create({
            messId: mess['id'],
            userId: managerUser['id'],
            memberRole: 'MEMBER',
            joinDate: new Date(),
            isActive: true,
            participatesInMeals: false, // managers opt-in
          });
          await messMembersRepo.save(membership);
          logger.log(
            `Added manager ${m.manager_email} as member to mess ${m.id}`,
          );
        }
      }
    }
  }

  logger.log('Seeding complete.');
  await app.close();
}

seed().catch((err) => {
  logger.error('Seeding failed:', err);
  process.exit(1);
});
