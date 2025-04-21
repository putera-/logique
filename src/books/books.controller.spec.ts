import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Genre } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateBookDto } from './dto/update-book.dto';
import { Paginate } from 'src/app.interface';
import { Book } from './books.interface';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('BooksController', () => {
    let controller: BooksController;
    let booksService: BooksService;


    beforeEach(async () => {
        // Mock BooksService
        const mockBooksService = {
            create: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BooksController],
            providers: [{
                provide: BooksService,
                useValue: mockBooksService
            }],
        }).compile();

        controller = module.get<BooksController>(BooksController);
        booksService = module.get<BooksService>(BooksService);

    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a book successfully', async () => {
            const createBookDto: CreateBookDto = {
                title: 'Test Book',
                author: 'Author',
                publishedYear: 2023,
                stock: 10,
                genres: [Genre.Drama],
            };

            const fixedDate = new Date('2025-04-21T11:21:35.456Z');

            const result = {
                ...createBookDto,
                id: 1,
                createdAt: fixedDate,
                updatedAt: fixedDate,
            };

            jest.spyOn(booksService, 'create').mockResolvedValue(result);

            const response = await controller.create(createBookDto);

            expect(response).toEqual(result);
        });

        it('should throw ConflictException if book title already exists', async () => {
            const createBookDto: CreateBookDto = {
                title: 'Test Book',
                author: 'Author',
                publishedYear: 2023,
                stock: 10,
                genres: [Genre.Drama],
            };

            const prismaError = new PrismaClientKnownRequestError(
                'Unique constraint failed',
                {
                    code: 'P2002',
                    clientVersion: '4.16.2', // or whatever version your Prisma client is
                }
            );

            jest.spyOn(booksService, 'create').mockRejectedValueOnce(prismaError);

            await expect(controller.create(createBookDto)).rejects.toThrowError(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return paginated books', async () => {
            const pagination = { limit: 10, page: 1 };
            const books: Book[] = [
                {
                    id: 1,
                    title: 'Book 1',
                    author: 'Author',
                    publishedYear: 2023,
                    stock: 10,
                    genres: [Genre.Drama],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    title: 'Book 2',
                    author: 'Author',
                    publishedYear: 2023,
                    stock: 10,
                    genres: [Genre.Drama],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            const result: Paginate<Book[]> = {
                data: books,
                total: 2,
                last_page: 5,
                page: 1,
                limit: 10,
            };

            jest.spyOn(booksService, 'findAll').mockResolvedValue(result);

            const response = await controller.findAll(pagination as any);
            expect(response).toEqual(result);
        });
    });

    describe('findOne', () => {
        it('should return a book by id', async () => {
            const book = {
                id: 1,
                title: 'Test Book',
                author: 'Author',
                publishedYear: 2023,
                stock: 10,
                genres: [Genre.Drama],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            jest.spyOn(booksService, 'findOne').mockResolvedValue(book);

            const response = await controller.findOne('1');
            expect(response).toEqual(book);
        });
    });

    describe('update', () => {
        it('should update a book successfully', async () => {
            const updateBookDto: UpdateBookDto = {
                title: 'Updated Title',
            };

            const updatedBook = {
                id: 1,
                title: 'Updated Title',
                author: 'Author',
                publishedYear: 2023,
                stock: 10,
                genres: [Genre.Drama],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(booksService, 'update').mockResolvedValue(updatedBook);

            const response = await controller.update('1', updateBookDto);
            expect(response).toEqual(updatedBook);
        });

        it('should throw ConflictException on duplicate title', async () => {
            const updateBookDto: UpdateBookDto = { title: 'Existing Title' };

            const prismaError = new PrismaClientKnownRequestError('Unique constraint', {
                code: 'P2002',
                clientVersion: '4.16.2',
            });

            jest.spyOn(booksService, 'update').mockRejectedValue(prismaError);

            await expect(controller.update('1', updateBookDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should return a success message on delete', async () => {
            jest.spyOn(booksService, 'remove').mockResolvedValue(undefined);

            const response = await controller.remove('1');
            expect(response).toEqual({
                message: 'Book deleted successfully',
            });
        });
    });

    describe('CreateBookDto validation', () => {
        const base = {
            title: 'Valid Title',
            author: 'Valid Author',
            publishedYear: 2025,
            stock: 5,
        };

        it('accepts genres as an array of enum values', async () => {
            const input = { ...base, genres: [Genre.Action, Genre.Comedy] };
            const dto = plainToInstance(CreateBookDto, input);
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.genres).toEqual([Genre.Action, Genre.Comedy]);
        });

        it('transforms comma‑separated string into array', async () => {
            const input = { ...base, genres: 'Action,Comedy , Drama' };
            const dto = plainToInstance(CreateBookDto, input);
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.genres).toEqual([Genre.Action, Genre.Comedy, Genre.Drama]);
        });

        it('rejects when genres is missing', async () => {
            const dto = plainToInstance(CreateBookDto, { ...base });
            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('genres');
            expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
        });

        it('rejects when genres is null', async () => {
            const dto = plainToInstance(CreateBookDto, { ...base, genres: null });
            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('genres');
            expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
        });

        it('rejects empty array input', async () => {
            const dto = plainToInstance(CreateBookDto, { ...base, genres: [] });
            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('genres');
            expect(errors[0].constraints).toHaveProperty('arrayNotEmpty');
        });


        it('rejects invalid enum values', async () => {
            const dto = plainToInstance(CreateBookDto, {
                ...base,
                genres: ['SciFi', 'Actions']
            });
            const errors = await validate(dto);
            // Should fail @IsEnum on the first invalid element
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('genres');
            expect(errors[0].constraints).toHaveProperty('isEnum');
            // expect(errors[0].constraints).toHaveProperty('each');
            expect(errors[0].constraints.isEnum).toMatch(/must be one of the following values/);
        });
    });

});
