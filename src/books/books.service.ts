import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Book } from './books.interface';
import { Paginate } from '../app.interface';
import { nestedOrderBy } from '../app.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FilterBookQueryDto } from './dto/filter-book.dto';

@Injectable()
export class BooksService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private prisma: PrismaService,
    ) {}

    create(data: Prisma.BookCreateInput) {
        return this.prisma.book.create({
            data,
        });
    }

    async findAll(filters: FilterBookQueryDto): Promise<Paginate<Book[]>> {
        const cacheKey = `books:${JSON.stringify(filters)}`;

        const cached = await this.cacheManager.get<Paginate<Book[]>>(cacheKey);

        if (cached) return cached;

        const { search, page, limit, sortBy, order, genre } = filters;

        /**
         * Case-insensitive search
         * Search condition for:
         * - title
         * - author
         * - publishedYear
         */
        const searchCondition: Prisma.BookWhereInput = search
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
        const where: Prisma.BookWhereInput = {
            AND: [
                searchCondition,
                { genres: genre ? { has: genre } : undefined },
            ],
        };

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

        const result = {
            data,
            limit,
            total,
            page,
            last_page:
                limit > 0 ? (limit > 0 ? Math.ceil(total / limit) : 1) : 1,
        };

        await this.cacheManager.set(cacheKey, result, 60 * 1000); // cache for 60 sec

        return result;
    }

    async findOne(id: number): Promise<Book> {
        const data = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!data) {
            throw new NotFoundException('Book is not found');
        }

        return data;
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
