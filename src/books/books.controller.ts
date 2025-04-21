import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ValidationPipe,
    ConflictException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiTags } from '@nestjs/swagger';
import { Book } from './books.interface';
import { Paginate } from '../app.interface';
import { CreateBookDoc, DeleteBookDoc, GetAllBookDoc, GetBookDoc, UpdateBookDoc } from './books.doc';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FilterBookQueryDto } from './dto/filter-book.dto';

@ApiTags('Books')
@Controller({
    path: 'books',
    version: '1',
})
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    @CreateBookDoc()
    @Post()
    async create(@Body(new ValidationPipe({ transform: true })) createBookDto: CreateBookDto): Promise<Book> {
        try {
            return await this.booksService.create(createBookDto);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Book with this title already exists');
            }
            throw error;
        }
    }

    @GetAllBookDoc()
    @Get()
    findAll(
        @Query(new ValidationPipe({ transform: true })) filters: FilterBookQueryDto,
    ): Promise<Paginate<Book[]>> {
        console.log('masuk controller')
        return this.booksService.findAll(filters);
    }

    @GetBookDoc()
    @Get(':id')
    findOne(@Param('id') id: string): Promise<Book> {
        return this.booksService.findOne(+id);
    }

    @UpdateBookDoc()
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(new ValidationPipe({ transform: true })) updateBookDto: UpdateBookDto
    ): Promise<Book> {
        try {
            return await this.booksService.update(+id, updateBookDto);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Book with this title already exists');
            }
            throw error;
        }
    }

    @DeleteBookDoc()
    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.booksService.remove(+id);

        return {
            message: 'Book deleted successfully',
        };
    }
}
