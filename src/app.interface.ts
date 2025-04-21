export interface Paginate<T> {
    data: T;
    limit: number;
    total: number;
    page: number;
    last_page: number;
}