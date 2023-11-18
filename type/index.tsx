export interface Tag {
    id: number,
    tag: string,
    description: string,
    count: number,
    price: number,
    balance?: number,
}



export interface Navigator {
    path: string,
    name: string
}