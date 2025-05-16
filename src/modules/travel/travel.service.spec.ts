import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from './travel.service';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';

describe('TravelService', () => {
  let service: TravelService;

  beforeEach(async () => {
    const mockSupabaseProvider = {
      getClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        {
          provide: SupabaseProvider,
          useValue: mockSupabaseProvider,
        },
        {
          provide: SupabaseAdminProvider,
          useValue: mockSupabaseProvider,
        },
        LoggerService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        ConfigService,
        JwtService,
        AuthService,
      ],
    }).compile();

    service = module.get<TravelService>(TravelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
