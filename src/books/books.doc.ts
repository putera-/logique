import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const NotFound = ApiResponse({
    status: 404,
    description: 'Error: Not Found',
    schema: {
        example: {
            message: 'Book is not found',
            error: 'Not Found',
            statusCode: 404,
        },
    },
});

const BadRequest = ApiResponse({
    status: 400,
    description: 'Error: Bad Request',
    content: {
        'application/json': {
            examples: {
                'Title is too short': {
                    value: {
                        message: [
                            'title must not be less than 3',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                },
                'Author is too short': {
                    value: {
                        message: [
                            'author must not be less than 3',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                },
                'publishedYear is less thank 1900': {
                    value: {
                        message: [
                            'publishedYear must not be less than 1900',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                },
                'publishedYear is more than 2200': {
                    value: {
                        message: [

                            'publipublishedYear must not be greater than 2200',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                },
                'genres is not a valid enum value': {
                    value: {
                        message: [
                            'each value in genres must be one of the following values: Action, Adventure, Comedy, Drama, Fantasy, Horror, Mystery, Romance, Thriller, Western',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                },
                'multiple errors': {
                    value: {
                        message: [
                            'author must not be less than 3',
                            'publishedYear must not be less than 1900',
                            'each value in genres must be one of the following values: Action, Adventure, Comedy, Drama, Fantasy, Horror, Mystery, Romance, Thriller, Western',
                        ],
                        error: 'Bad Request',
                        statusCode: 400,
                    },
                },
            },
        },
    },
});

export function CreateBookDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Create Book' }),
        ApiBody({
            type: CreateBookDto,
        }),
        ApiResponse({
            status: 200,
            description: 'Success',
            schema: {
                example: sample1,
            },
        }),
        BadRequest
    );
}

export function UpdateBookDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Update Book' }),
        ApiBody({
            type: UpdateBookDto,
        }),
        ApiResponse({
            status: 200,
            description: 'Success',
            schema: {
                example: sample1,
            },
        }),
        NotFound,
        BadRequest
    );
}

export function GetAllBookDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get All Book' }),
        // IncludeQuery('consignments'),
        ApiResponse({
            status: 200,
            description: 'Success',
            schema: {
                example: {
                    last_page: [sample1, sample2],
                    limit: 10,
                    total: 2,
                    page: 1,
                    maxPages: 1,
                },
            },
        }),
    );
}

export function GetBookDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get Book By Id' }),
        ApiResponse({
            status: 200,
            description: 'Success',
            schema: {
                example: sample1,
            },
        }),
        NotFound,
    );
}

export function DeleteBookDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Delete Book By Id.' }),
        NotFound,
        ApiResponse({
            status: 200,
            description: 'Success',
            schema: {
                example: {
                    message: 'Book deleted successfully'
                },
            },
        }),
    );
}

const sample1 = {
    id: 3,
    title: "Temporibus adeo corpus textus aptus.",
    author: "Hubert Jacobson",
    publishedYear: 2024,
    stock: 60,
    genres: [
        "Drama",
        "Romance"
    ],
    createdAt: "2025-04-21T11:21:35.456Z",
    updatedAt: "2025-04-21T11:21:35.456Z"
};
const sample2 = {
    id: 4,
    title: "Sto corpus defendo facere doloribus spectaculum esse defluo tardus.",
    author: "Mike DuBuque",
    publishedYear: 2024,
    stock: 75,
    genres: [
        "Western",
        "Comedy",
        "Thriller",
        "Romance",
        "Action",
        "Mystery",
        "Drama",
        "Horror"
    ],
    createdAt: "2025-04-21T11:21:35.456Z",
    updatedAt: "2025-04-21T11:21:35.456Z"
};
