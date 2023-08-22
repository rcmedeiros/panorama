export type Rejection = (reason: Error) => void;
export declare type Resolution<T> = (value?: T | PromiseLike<T>) => void;
