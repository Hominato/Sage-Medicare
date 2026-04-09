import { Test, TestingModule } from '@nestjs/testing';
import { ImagingService } from './imaging.service';

describe('ImagingService', () => {
  let service: ImagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImagingService],
    }).compile();

    service = module.get<ImagingService>(ImagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
