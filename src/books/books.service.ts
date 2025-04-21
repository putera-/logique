import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Book } from './books.interface';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from 'src/pagination-query.dto';
import { Paginate } from 'src/app.interface';
import { nestedOrderBy } from 'src/app.decorator';

@Injectable()
export class BooksService {
    constructor(private prisma: PrismaService) {}

    create(data: Prisma.BookCreateInput) {
        return this.prisma.book.create({
            data,
        });
    }

    async findAll(pagination: PaginationQueryDto): Promise<Paginate<Book[]>> {
        const { search, page, limit, sortBy, order } = pagination;

        /**
         * Case-insensitive search
         * Search condition for:
         * - name
         * - phone
         * - address
         * - identity_no
         * - licence_no
         */
        const where: Prisma.BookWhereInput = search
            ? {
                  OR: [
                      { title: { contains: search, mode: 'insensitive' } },
                      { author: { contains: search, mode: 'insensitive' } },
                      isNaN(Number(search)) // Ensure search is a number before applying to manufacturing_year
                          ? {}
                          : { publishedYear: { equals: Number(search) } },
                  ],
              }
            : {};

        const skip = (page - 1) * limit;
        const take = limit > 0 ? limit : undefined;

        const [total, data] = await Promise.all([
            this.prisma.book.count({ where }),
            this.prisma.book.findMany({
                where,
                orderBy: nestedOrderBy(sortBy, order),
                skip,
                take,
            }),
        ]);
        return {
            data,
            limit,
            total,
            page,
            last_page:
                limit > 0 ? (limit > 0 ? Math.ceil(total / limit) : 1) : 1,
        };
    }

    async findOne(id: number): Promise<Book> {
        const data = await this.findUnique(id);
        if (!data) {
            throw new NotFoundException(`Book with id ${id} not found`);
        }

        return data;
    }

    findUnique(id: number): Promise<Book | null> {
        return this.prisma.book.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Prisma.BookUpdateInput) {
        // will throw NotFoundException if not found
        await this.findOne(id);

        return this.prisma.book.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<void> {
        // will throw NotFoundException if not found
        await this.findOne(id);

        await this.prisma.book.delete({
            where: { id },
        });

        return;
    }
}
