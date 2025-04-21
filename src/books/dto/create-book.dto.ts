import { ApiProperty } from "@nestjs/swagger";
import { Genre } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateBookDto {
    @ApiProperty({ description: 'Book Title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Book Author' })
    @IsString()
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
        enum: Genre, // Use enum here
        enumName: 'Genre', // Optional: to provide a name for the enum in Swagger
    })
    @IsEnum(Genre)
    @Transform(({ value }) => {
        // Ensure undefined or empty input results in an empty array
        if (!value) return [];

        // Support both array and string input
        return Array.isArray(value)
            ? value
            : value.split(',').map((v: string) => v.trim());
    })
    @IsArray()
    @IsString({ each: true })
    genres: Genre[];
}
