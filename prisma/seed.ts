import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);
    const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Thriller', 'Western'];

    const books: Prisma.BookCreateManyInput[] = [];
    for (let i = 0; i < 110; i++) {
        const book: Prisma.BookCreateManyInput = {
            title: faker.lorem.sentence(),
            author: faker.person.fullName(),
            publishedYear: faker.date.past().getFullYear(),
            genres: faker.helpers.arrayElements(genres),
            stock: faker.number.int({ min: 1, max: 100 }),
        }
        books.push(book);
    }

    await prisma.book.createMany({
        data: books,
    });
    console.log(`Finish seeding ...`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
