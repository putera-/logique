import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Genre } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { FilterBookQueryDto } from './dto/filter-book.dto';

describe('BooksService', () => {
    let service: BooksService;
    let prismaService: PrismaService;
    let cacheManager: any;

    const mockPrismaService = {
        book: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BooksService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                        del: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BooksService>(BooksService);
        prismaService = module.get<PrismaService>(PrismaService);
        cacheManager = module.get(CACHE_MANAGER);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a book', async () => {
            const dto = {
                title: 'Book Title',
                author: 'Author',
                publishedYear: 2024,
                stock: 5,
                genres: [Genre.Fantasy],
            };
            const result = { id: 1, ...dto };

            mockPrismaService.book.create.mockResolvedValue(result);

            expect(await service.create(dto)).toEqual(result);
            expect(mockPrismaService.book.create).toHaveBeenCalledWith({
                data: dto,
            });
        });
    });

    describe('findAll', () => {
        it('should return cached data if exists', async () => {
            const filter: FilterBookQueryDto = {
                page: 1,
                limit: 10,
                search: '',
                sortBy: 'id',
                order: 'desc',
                genre: null,
            };

            const cachedResult = {
                data: [{ id: 1, title: 'Cached Book' }],
                total: 1,
                limit: 10,
                page: 1,
                last_page: 1,
            };

            cacheManager.get.mockResolvedValue(cachedResult);

            const result = await service.findAll(filter);
            expect(result).toEqual(cachedResult);
            expect(cacheManager.get).toHaveBeenCalled();
            expect(prismaService.book.findMany).not.toHaveBeenCalled();
        });

        it('should query DB and cache the result if no cache', async () => {
            cacheManager.get.mockResolvedValue(null);

            // stub count + findMany
            mockPrismaService.book.count.mockResolvedValue(2);
            mockPrismaService.book.findMany.mockResolvedValue([
                { id: 1, title: 'Book A' },
                { id: 2, title: 'Book B' },
            ]);

            const filter: FilterBookQueryDto = {
                page: 1,
                limit: 2,
                search: '',
                sortBy: 'id',
                order: 'asc',
                genre: null,
            };

            const result = await service.findAll(filter);

            expect(result).toEqual({
                data: [
                    { id: 1, title: 'Book A' },
                    { id: 2, title: 'Book B' },
                ],
                total: 2,
                limit: 2,
                page: 1,
                last_page: 1,
            });

            expect(mockPrismaService.book.count).toHaveBeenCalledWith({
                where: {
                    AND: [{}, { genres: undefined }],
                },
            });
            expect(mockPrismaService.book.findMany).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return book by id', async () => {
            const book = { id: 1, title: 'Found Book' };
            mockPrismaService.book.findUnique.mockResolvedValue(book);

            const result = await service.findOne(1);
            expect(result).toEqual(book);
        });

        it('should throw NotFoundException if book not found', async () => {
            mockPrismaService.book.findUnique.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update a book', async () => {
            const id = 1;
            const book = { id, title: 'Existing' };
            const updateData = { title: 'Updated' };

            mockPrismaService.book.findUnique.mockResolvedValue(book);
            mockPrismaService.book.update.mockResolvedValue({
                id,
                ...updateData,
            });

            const result = await service.update(id, updateData);

            expect(result).toEqual({ id, ...updateData });
        });

        it('should throw NotFoundException if book not found', async () => {
            mockPrismaService.book.findUnique.mockResolvedValue(null);

            await expect(service.update(999, { title: 'X' })).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('should delete a book', async () => {
            const id = 1;
            const book = { id, title: 'To Delete' };

            mockPrismaService.book.findUnique.mockResolvedValue(book);
            mockPrismaService.book.delete.mockResolvedValue(undefined);

            await expect(service.remove(id)).resolves.toBeUndefined();
        });

        it('should throw NotFoundException if book not found', async () => {
            mockPrismaService.book.findUnique.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
