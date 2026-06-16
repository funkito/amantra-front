type ExtractRouteParamNames<Path extends string> =
  Path extends `${string}[${infer Param}]${infer Rest}`
    ? Param | ExtractRouteParamNames<Rest>
    : never;

type RouteParams<Path extends string> = [ExtractRouteParamNames<Path>] extends [never]
  ? Record<string, string>
  : Record<ExtractRouteParamNames<Path>, string>;

declare global {
  type PageProps<Path extends string = string> = {
    params: Promise<RouteParams<Path>>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  };

  type RouteContext<Path extends string = string> = {
    params: Promise<RouteParams<Path>>;
  };
}

export {};

