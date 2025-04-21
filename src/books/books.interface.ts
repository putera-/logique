export interface Book {
    id: number
    title: string,
    author: string,
    publishedYear: number,
    genres: string[],
    stock: number,
    createdAt?: Date
    updatedAt?: Date
}