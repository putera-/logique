import { ApiProperty } from '@nestjs/swagger';
import { Genre } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateBookDto {
    @ApiProperty({ description: 'Book Title' })
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({ description: 'Book Author' })
    @IsString()
    @MinLength(3)
    author: string;

    @ApiProperty({ description: 'Published Year' })
    @IsNumber()
    @Min(1900)
    @Max(2200)
    publishedYear: number;

    @ApiProperty({ description: 'Number of stock' })
    @IsNumber()
    stock: number;

    @ApiProperty({
        description: 'List of genres',
        enum: Genre,
        isArray: true,
        example: ['Action', 'Comedy'],
    })
    @Transform(({ value }) => {
        if (!value) return [];
        return Array.isArray(value)
            ? value
            : value.split(',').map((v: string) => v.trim());
    })
    @IsArray()
    @IsEnum(Genre, { each: true })
    genres: Genre[];
}
