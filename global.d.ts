type StripSlash<S extends string> = S extends `/${infer Rest}`
  ? StripSlash<Rest>
  : S;

type Combine_Internal<
  Sa extends string[],
  IsFirst extends boolean
> = Sa extends [infer H extends string, ...infer Rest extends string[]]
  ? IsFirst extends true
    ? `${H}${Combine_Internal<Rest, false>}`
    : `/${StripSlash<H>}${Combine_Internal<Rest, false>}`
  : "";

type JoinPath<Strings extends string[]> = Combine_Internal<Strings, true>;

declare module "path" {
  interface PlatformPath {
    join<P extends string[]>(...paths: P): JoinPath<P>;
  }
}
