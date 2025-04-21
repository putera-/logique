import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should redirect to /api with status 302', () => {
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                redirect: jest.fn(),
            };

            appController.root(mockRes as any);

            expect(mockRes.status).toHaveBeenCalledWith(302);
            expect(mockRes.redirect).toHaveBeenCalledWith('/api');
        });
    });
});
