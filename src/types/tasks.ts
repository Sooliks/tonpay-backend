export type TaskType = {
    id: number
    check: (id: string | number) => Promise<boolean>
    reward: number
    name: string
    isComplete: boolean
    link?: string
}
