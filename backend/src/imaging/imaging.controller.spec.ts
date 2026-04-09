import { Test, TestingModule } from '@nestjs/testing';
import { ImagingController } from './imaging.controller';

describe('ImagingController', () => {
  let controller: ImagingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagingController],
    }).compile();

    controller = module.get<ImagingController>(ImagingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
