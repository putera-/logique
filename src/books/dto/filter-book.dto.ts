import { ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../pagination-query.dto';

export class FilterBookQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by genre',
        enum: Genre,
        enumName: 'Genre',
    })
    @IsOptional()
    @IsEnum(Genre)
    genre: Genre;
}
