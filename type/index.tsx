export interface Tag {
    id: number,
    tag: string,
    description: string,
    count: number,
    price: number,
    balance?: number,
}

export interface LayoutNavigator {
    path: string,
    name: string
}