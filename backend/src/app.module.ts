import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MessesModule } from './modules/messes/messes.module';
import { MessMembersModule } from './modules/mess-members/mess-members.module';
import { MealSlotsModule } from './modules/meal-slots/meal-slots.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DailyCostsModule } from './modules/daily-costs/daily-costs.module';
import { FixedChargesModule } from './modules/fixed-charges/fixed-charges.module';
import { ItemTypesModule } from './modules/item-types/item-types.module';
import { ItemAllocationsModule } from './modules/item-allocations/item-allocations.module';
import { MonthlyBillingModule } from './modules/monthly-billing/monthly-billing.module';
import { SharedBillsModule } from './modules/shared-bills/shared-bills.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { JoinRequestsModule } from './modules/join-requests/join-requests.module';
import { MessDeletionRequestsModule } from './modules/mess-deletion-requests/mess-deletion-requests.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    AuthModule,
    UsersModule,
    MessesModule,
    MessMembersModule,
    MealSlotsModule,
    BookingsModule,
    DailyCostsModule,
    FixedChargesModule,
    ItemTypesModule,
    ItemAllocationsModule,
    MonthlyBillingModule,
    SharedBillsModule,
    FeedbackModule,
    JoinRequestsModule,
    MessDeletionRequestsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
