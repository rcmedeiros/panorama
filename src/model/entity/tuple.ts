type _TupleOf<T, N extends number, R extends Array<unknown>> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type Tuple<T, N extends number> = N extends N ? (number extends N ? Array<T> : _TupleOf<T, N, []>) : never;
