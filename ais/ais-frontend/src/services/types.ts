export interface Category {
    id: number;
    name: string;
    parent_category_id?: number | null;
}