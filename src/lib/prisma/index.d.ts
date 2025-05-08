
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Terms
 * 
 */
export type Terms = $Result.DefaultSelection<Prisma.$TermsPayload>
/**
 * Model UserTermsSignature
 * 
 */
export type UserTermsSignature = $Result.DefaultSelection<Prisma.$UserTermsSignaturePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.terms`: Exposes CRUD operations for the **Terms** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Terms
    * const terms = await prisma.terms.findMany()
    * ```
    */
  get terms(): Prisma.TermsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userTermsSignature`: Exposes CRUD operations for the **UserTermsSignature** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTermsSignatures
    * const userTermsSignatures = await prisma.userTermsSignature.findMany()
    * ```
    */
  get userTermsSignature(): Prisma.UserTermsSignatureDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Terms: 'Terms',
    UserTermsSignature: 'UserTermsSignature'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "terms" | "userTermsSignature"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Terms: {
        payload: Prisma.$TermsPayload<ExtArgs>
        fields: Prisma.TermsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TermsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TermsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>
          }
          findFirst: {
            args: Prisma.TermsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TermsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>
          }
          findMany: {
            args: Prisma.TermsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>[]
          }
          create: {
            args: Prisma.TermsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>
          }
          createMany: {
            args: Prisma.TermsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TermsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>[]
          }
          delete: {
            args: Prisma.TermsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>
          }
          update: {
            args: Prisma.TermsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>
          }
          deleteMany: {
            args: Prisma.TermsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TermsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TermsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>[]
          }
          upsert: {
            args: Prisma.TermsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TermsPayload>
          }
          aggregate: {
            args: Prisma.TermsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTerms>
          }
          groupBy: {
            args: Prisma.TermsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TermsGroupByOutputType>[]
          }
          count: {
            args: Prisma.TermsCountArgs<ExtArgs>
            result: $Utils.Optional<TermsCountAggregateOutputType> | number
          }
        }
      }
      UserTermsSignature: {
        payload: Prisma.$UserTermsSignaturePayload<ExtArgs>
        fields: Prisma.UserTermsSignatureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTermsSignatureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTermsSignatureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>
          }
          findFirst: {
            args: Prisma.UserTermsSignatureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTermsSignatureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>
          }
          findMany: {
            args: Prisma.UserTermsSignatureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>[]
          }
          create: {
            args: Prisma.UserTermsSignatureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>
          }
          createMany: {
            args: Prisma.UserTermsSignatureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserTermsSignatureCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>[]
          }
          delete: {
            args: Prisma.UserTermsSignatureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>
          }
          update: {
            args: Prisma.UserTermsSignatureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>
          }
          deleteMany: {
            args: Prisma.UserTermsSignatureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTermsSignatureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserTermsSignatureUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>[]
          }
          upsert: {
            args: Prisma.UserTermsSignatureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTermsSignaturePayload>
          }
          aggregate: {
            args: Prisma.UserTermsSignatureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserTermsSignature>
          }
          groupBy: {
            args: Prisma.UserTermsSignatureGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTermsSignatureGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTermsSignatureCountArgs<ExtArgs>
            result: $Utils.Optional<UserTermsSignatureCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    terms?: TermsOmit
    userTermsSignature?: UserTermsSignatureOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    terms_signatures: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    terms_signatures?: boolean | UserCountOutputTypeCountTerms_signaturesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTerms_signaturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTermsSignatureWhereInput
  }


  /**
   * Count Type TermsCountOutputType
   */

  export type TermsCountOutputType = {
    signatures: number
  }

  export type TermsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signatures?: boolean | TermsCountOutputTypeCountSignaturesArgs
  }

  // Custom InputTypes
  /**
   * TermsCountOutputType without action
   */
  export type TermsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TermsCountOutputType
     */
    select?: TermsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TermsCountOutputType without action
   */
  export type TermsCountOutputTypeCountSignaturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTermsSignatureWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
    avatar_url: number | null
    preferred_language_id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
    avatar_url: number | null
    preferred_language_id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    wallet_id: string | null
    username: string | null
    avatar_url: number | null
    preferred_language_id: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    wallet_id: string | null
    username: string | null
    avatar_url: number | null
    preferred_language_id: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    wallet_id: number
    username: number
    avatar_url: number
    preferred_language_id: number
    created_at: number
    updated_at: number
    user_preferences: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
    avatar_url?: true
    preferred_language_id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
    avatar_url?: true
    preferred_language_id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    wallet_id?: true
    username?: true
    avatar_url?: true
    preferred_language_id?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    wallet_id?: true
    username?: true
    avatar_url?: true
    preferred_language_id?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    wallet_id?: true
    username?: true
    avatar_url?: true
    preferred_language_id?: true
    created_at?: true
    updated_at?: true
    user_preferences?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    wallet_id: string
    username: string
    avatar_url: number | null
    preferred_language_id: number | null
    created_at: Date
    updated_at: Date
    user_preferences: JsonValue | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet_id?: boolean
    username?: boolean
    avatar_url?: boolean
    preferred_language_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    user_preferences?: boolean
    terms_signatures?: boolean | User$terms_signaturesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet_id?: boolean
    username?: boolean
    avatar_url?: boolean
    preferred_language_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    user_preferences?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet_id?: boolean
    username?: boolean
    avatar_url?: boolean
    preferred_language_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    user_preferences?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    wallet_id?: boolean
    username?: boolean
    avatar_url?: boolean
    preferred_language_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    user_preferences?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wallet_id" | "username" | "avatar_url" | "preferred_language_id" | "created_at" | "updated_at" | "user_preferences", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    terms_signatures?: boolean | User$terms_signaturesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      terms_signatures: Prisma.$UserTermsSignaturePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      wallet_id: string
      username: string
      avatar_url: number | null
      preferred_language_id: number | null
      created_at: Date
      updated_at: Date
      user_preferences: Prisma.JsonValue | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    terms_signatures<T extends User$terms_signaturesArgs<ExtArgs> = {}>(args?: Subset<T, User$terms_signaturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly wallet_id: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly avatar_url: FieldRef<"User", 'Int'>
    readonly preferred_language_id: FieldRef<"User", 'Int'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
    readonly user_preferences: FieldRef<"User", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.terms_signatures
   */
  export type User$terms_signaturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    where?: UserTermsSignatureWhereInput
    orderBy?: UserTermsSignatureOrderByWithRelationInput | UserTermsSignatureOrderByWithRelationInput[]
    cursor?: UserTermsSignatureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTermsSignatureScalarFieldEnum | UserTermsSignatureScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Terms
   */

  export type AggregateTerms = {
    _count: TermsCountAggregateOutputType | null
    _avg: TermsAvgAggregateOutputType | null
    _sum: TermsSumAggregateOutputType | null
    _min: TermsMinAggregateOutputType | null
    _max: TermsMaxAggregateOutputType | null
  }

  export type TermsAvgAggregateOutputType = {
    id: number | null
  }

  export type TermsSumAggregateOutputType = {
    id: number | null
  }

  export type TermsMinAggregateOutputType = {
    id: number | null
    content: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type TermsMaxAggregateOutputType = {
    id: number | null
    content: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type TermsCountAggregateOutputType = {
    id: number
    content: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type TermsAvgAggregateInputType = {
    id?: true
  }

  export type TermsSumAggregateInputType = {
    id?: true
  }

  export type TermsMinAggregateInputType = {
    id?: true
    content?: true
    created_at?: true
    updated_at?: true
  }

  export type TermsMaxAggregateInputType = {
    id?: true
    content?: true
    created_at?: true
    updated_at?: true
  }

  export type TermsCountAggregateInputType = {
    id?: true
    content?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type TermsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Terms to aggregate.
     */
    where?: TermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Terms to fetch.
     */
    orderBy?: TermsOrderByWithRelationInput | TermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Terms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Terms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Terms
    **/
    _count?: true | TermsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TermsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TermsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TermsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TermsMaxAggregateInputType
  }

  export type GetTermsAggregateType<T extends TermsAggregateArgs> = {
        [P in keyof T & keyof AggregateTerms]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTerms[P]>
      : GetScalarType<T[P], AggregateTerms[P]>
  }




  export type TermsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TermsWhereInput
    orderBy?: TermsOrderByWithAggregationInput | TermsOrderByWithAggregationInput[]
    by: TermsScalarFieldEnum[] | TermsScalarFieldEnum
    having?: TermsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TermsCountAggregateInputType | true
    _avg?: TermsAvgAggregateInputType
    _sum?: TermsSumAggregateInputType
    _min?: TermsMinAggregateInputType
    _max?: TermsMaxAggregateInputType
  }

  export type TermsGroupByOutputType = {
    id: number
    content: string
    created_at: Date
    updated_at: Date
    _count: TermsCountAggregateOutputType | null
    _avg: TermsAvgAggregateOutputType | null
    _sum: TermsSumAggregateOutputType | null
    _min: TermsMinAggregateOutputType | null
    _max: TermsMaxAggregateOutputType | null
  }

  type GetTermsGroupByPayload<T extends TermsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TermsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TermsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TermsGroupByOutputType[P]>
            : GetScalarType<T[P], TermsGroupByOutputType[P]>
        }
      >
    >


  export type TermsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
    signatures?: boolean | Terms$signaturesArgs<ExtArgs>
    _count?: boolean | TermsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["terms"]>

  export type TermsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["terms"]>

  export type TermsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["terms"]>

  export type TermsSelectScalar = {
    id?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type TermsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "content" | "created_at" | "updated_at", ExtArgs["result"]["terms"]>
  export type TermsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signatures?: boolean | Terms$signaturesArgs<ExtArgs>
    _count?: boolean | TermsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TermsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TermsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TermsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Terms"
    objects: {
      signatures: Prisma.$UserTermsSignaturePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      content: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["terms"]>
    composites: {}
  }

  type TermsGetPayload<S extends boolean | null | undefined | TermsDefaultArgs> = $Result.GetResult<Prisma.$TermsPayload, S>

  type TermsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TermsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TermsCountAggregateInputType | true
    }

  export interface TermsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Terms'], meta: { name: 'Terms' } }
    /**
     * Find zero or one Terms that matches the filter.
     * @param {TermsFindUniqueArgs} args - Arguments to find a Terms
     * @example
     * // Get one Terms
     * const terms = await prisma.terms.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TermsFindUniqueArgs>(args: SelectSubset<T, TermsFindUniqueArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Terms that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TermsFindUniqueOrThrowArgs} args - Arguments to find a Terms
     * @example
     * // Get one Terms
     * const terms = await prisma.terms.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TermsFindUniqueOrThrowArgs>(args: SelectSubset<T, TermsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Terms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsFindFirstArgs} args - Arguments to find a Terms
     * @example
     * // Get one Terms
     * const terms = await prisma.terms.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TermsFindFirstArgs>(args?: SelectSubset<T, TermsFindFirstArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Terms that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsFindFirstOrThrowArgs} args - Arguments to find a Terms
     * @example
     * // Get one Terms
     * const terms = await prisma.terms.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TermsFindFirstOrThrowArgs>(args?: SelectSubset<T, TermsFindFirstOrThrowArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Terms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Terms
     * const terms = await prisma.terms.findMany()
     * 
     * // Get first 10 Terms
     * const terms = await prisma.terms.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const termsWithIdOnly = await prisma.terms.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TermsFindManyArgs>(args?: SelectSubset<T, TermsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Terms.
     * @param {TermsCreateArgs} args - Arguments to create a Terms.
     * @example
     * // Create one Terms
     * const Terms = await prisma.terms.create({
     *   data: {
     *     // ... data to create a Terms
     *   }
     * })
     * 
     */
    create<T extends TermsCreateArgs>(args: SelectSubset<T, TermsCreateArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Terms.
     * @param {TermsCreateManyArgs} args - Arguments to create many Terms.
     * @example
     * // Create many Terms
     * const terms = await prisma.terms.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TermsCreateManyArgs>(args?: SelectSubset<T, TermsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Terms and returns the data saved in the database.
     * @param {TermsCreateManyAndReturnArgs} args - Arguments to create many Terms.
     * @example
     * // Create many Terms
     * const terms = await prisma.terms.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Terms and only return the `id`
     * const termsWithIdOnly = await prisma.terms.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TermsCreateManyAndReturnArgs>(args?: SelectSubset<T, TermsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Terms.
     * @param {TermsDeleteArgs} args - Arguments to delete one Terms.
     * @example
     * // Delete one Terms
     * const Terms = await prisma.terms.delete({
     *   where: {
     *     // ... filter to delete one Terms
     *   }
     * })
     * 
     */
    delete<T extends TermsDeleteArgs>(args: SelectSubset<T, TermsDeleteArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Terms.
     * @param {TermsUpdateArgs} args - Arguments to update one Terms.
     * @example
     * // Update one Terms
     * const terms = await prisma.terms.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TermsUpdateArgs>(args: SelectSubset<T, TermsUpdateArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Terms.
     * @param {TermsDeleteManyArgs} args - Arguments to filter Terms to delete.
     * @example
     * // Delete a few Terms
     * const { count } = await prisma.terms.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TermsDeleteManyArgs>(args?: SelectSubset<T, TermsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Terms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Terms
     * const terms = await prisma.terms.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TermsUpdateManyArgs>(args: SelectSubset<T, TermsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Terms and returns the data updated in the database.
     * @param {TermsUpdateManyAndReturnArgs} args - Arguments to update many Terms.
     * @example
     * // Update many Terms
     * const terms = await prisma.terms.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Terms and only return the `id`
     * const termsWithIdOnly = await prisma.terms.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TermsUpdateManyAndReturnArgs>(args: SelectSubset<T, TermsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Terms.
     * @param {TermsUpsertArgs} args - Arguments to update or create a Terms.
     * @example
     * // Update or create a Terms
     * const terms = await prisma.terms.upsert({
     *   create: {
     *     // ... data to create a Terms
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Terms we want to update
     *   }
     * })
     */
    upsert<T extends TermsUpsertArgs>(args: SelectSubset<T, TermsUpsertArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Terms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsCountArgs} args - Arguments to filter Terms to count.
     * @example
     * // Count the number of Terms
     * const count = await prisma.terms.count({
     *   where: {
     *     // ... the filter for the Terms we want to count
     *   }
     * })
    **/
    count<T extends TermsCountArgs>(
      args?: Subset<T, TermsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TermsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Terms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TermsAggregateArgs>(args: Subset<T, TermsAggregateArgs>): Prisma.PrismaPromise<GetTermsAggregateType<T>>

    /**
     * Group by Terms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TermsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TermsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TermsGroupByArgs['orderBy'] }
        : { orderBy?: TermsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TermsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTermsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Terms model
   */
  readonly fields: TermsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Terms.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TermsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    signatures<T extends Terms$signaturesArgs<ExtArgs> = {}>(args?: Subset<T, Terms$signaturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Terms model
   */
  interface TermsFieldRefs {
    readonly id: FieldRef<"Terms", 'Int'>
    readonly content: FieldRef<"Terms", 'String'>
    readonly created_at: FieldRef<"Terms", 'DateTime'>
    readonly updated_at: FieldRef<"Terms", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Terms findUnique
   */
  export type TermsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * Filter, which Terms to fetch.
     */
    where: TermsWhereUniqueInput
  }

  /**
   * Terms findUniqueOrThrow
   */
  export type TermsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * Filter, which Terms to fetch.
     */
    where: TermsWhereUniqueInput
  }

  /**
   * Terms findFirst
   */
  export type TermsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * Filter, which Terms to fetch.
     */
    where?: TermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Terms to fetch.
     */
    orderBy?: TermsOrderByWithRelationInput | TermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Terms.
     */
    cursor?: TermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Terms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Terms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Terms.
     */
    distinct?: TermsScalarFieldEnum | TermsScalarFieldEnum[]
  }

  /**
   * Terms findFirstOrThrow
   */
  export type TermsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * Filter, which Terms to fetch.
     */
    where?: TermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Terms to fetch.
     */
    orderBy?: TermsOrderByWithRelationInput | TermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Terms.
     */
    cursor?: TermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Terms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Terms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Terms.
     */
    distinct?: TermsScalarFieldEnum | TermsScalarFieldEnum[]
  }

  /**
   * Terms findMany
   */
  export type TermsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * Filter, which Terms to fetch.
     */
    where?: TermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Terms to fetch.
     */
    orderBy?: TermsOrderByWithRelationInput | TermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Terms.
     */
    cursor?: TermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Terms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Terms.
     */
    skip?: number
    distinct?: TermsScalarFieldEnum | TermsScalarFieldEnum[]
  }

  /**
   * Terms create
   */
  export type TermsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * The data needed to create a Terms.
     */
    data: XOR<TermsCreateInput, TermsUncheckedCreateInput>
  }

  /**
   * Terms createMany
   */
  export type TermsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Terms.
     */
    data: TermsCreateManyInput | TermsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Terms createManyAndReturn
   */
  export type TermsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * The data used to create many Terms.
     */
    data: TermsCreateManyInput | TermsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Terms update
   */
  export type TermsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * The data needed to update a Terms.
     */
    data: XOR<TermsUpdateInput, TermsUncheckedUpdateInput>
    /**
     * Choose, which Terms to update.
     */
    where: TermsWhereUniqueInput
  }

  /**
   * Terms updateMany
   */
  export type TermsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Terms.
     */
    data: XOR<TermsUpdateManyMutationInput, TermsUncheckedUpdateManyInput>
    /**
     * Filter which Terms to update
     */
    where?: TermsWhereInput
    /**
     * Limit how many Terms to update.
     */
    limit?: number
  }

  /**
   * Terms updateManyAndReturn
   */
  export type TermsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * The data used to update Terms.
     */
    data: XOR<TermsUpdateManyMutationInput, TermsUncheckedUpdateManyInput>
    /**
     * Filter which Terms to update
     */
    where?: TermsWhereInput
    /**
     * Limit how many Terms to update.
     */
    limit?: number
  }

  /**
   * Terms upsert
   */
  export type TermsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * The filter to search for the Terms to update in case it exists.
     */
    where: TermsWhereUniqueInput
    /**
     * In case the Terms found by the `where` argument doesn't exist, create a new Terms with this data.
     */
    create: XOR<TermsCreateInput, TermsUncheckedCreateInput>
    /**
     * In case the Terms was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TermsUpdateInput, TermsUncheckedUpdateInput>
  }

  /**
   * Terms delete
   */
  export type TermsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
    /**
     * Filter which Terms to delete.
     */
    where: TermsWhereUniqueInput
  }

  /**
   * Terms deleteMany
   */
  export type TermsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Terms to delete
     */
    where?: TermsWhereInput
    /**
     * Limit how many Terms to delete.
     */
    limit?: number
  }

  /**
   * Terms.signatures
   */
  export type Terms$signaturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    where?: UserTermsSignatureWhereInput
    orderBy?: UserTermsSignatureOrderByWithRelationInput | UserTermsSignatureOrderByWithRelationInput[]
    cursor?: UserTermsSignatureWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTermsSignatureScalarFieldEnum | UserTermsSignatureScalarFieldEnum[]
  }

  /**
   * Terms without action
   */
  export type TermsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Terms
     */
    select?: TermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Terms
     */
    omit?: TermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TermsInclude<ExtArgs> | null
  }


  /**
   * Model UserTermsSignature
   */

  export type AggregateUserTermsSignature = {
    _count: UserTermsSignatureCountAggregateOutputType | null
    _avg: UserTermsSignatureAvgAggregateOutputType | null
    _sum: UserTermsSignatureSumAggregateOutputType | null
    _min: UserTermsSignatureMinAggregateOutputType | null
    _max: UserTermsSignatureMaxAggregateOutputType | null
  }

  export type UserTermsSignatureAvgAggregateOutputType = {
    user_id: number | null
    terms_id: number | null
  }

  export type UserTermsSignatureSumAggregateOutputType = {
    user_id: number | null
    terms_id: number | null
  }

  export type UserTermsSignatureMinAggregateOutputType = {
    user_id: number | null
    terms_id: number | null
    signature: string | null
    signed_at: Date | null
  }

  export type UserTermsSignatureMaxAggregateOutputType = {
    user_id: number | null
    terms_id: number | null
    signature: string | null
    signed_at: Date | null
  }

  export type UserTermsSignatureCountAggregateOutputType = {
    user_id: number
    terms_id: number
    signature: number
    signed_at: number
    _all: number
  }


  export type UserTermsSignatureAvgAggregateInputType = {
    user_id?: true
    terms_id?: true
  }

  export type UserTermsSignatureSumAggregateInputType = {
    user_id?: true
    terms_id?: true
  }

  export type UserTermsSignatureMinAggregateInputType = {
    user_id?: true
    terms_id?: true
    signature?: true
    signed_at?: true
  }

  export type UserTermsSignatureMaxAggregateInputType = {
    user_id?: true
    terms_id?: true
    signature?: true
    signed_at?: true
  }

  export type UserTermsSignatureCountAggregateInputType = {
    user_id?: true
    terms_id?: true
    signature?: true
    signed_at?: true
    _all?: true
  }

  export type UserTermsSignatureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTermsSignature to aggregate.
     */
    where?: UserTermsSignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTermsSignatures to fetch.
     */
    orderBy?: UserTermsSignatureOrderByWithRelationInput | UserTermsSignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTermsSignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTermsSignatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTermsSignatures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTermsSignatures
    **/
    _count?: true | UserTermsSignatureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserTermsSignatureAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserTermsSignatureSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTermsSignatureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTermsSignatureMaxAggregateInputType
  }

  export type GetUserTermsSignatureAggregateType<T extends UserTermsSignatureAggregateArgs> = {
        [P in keyof T & keyof AggregateUserTermsSignature]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserTermsSignature[P]>
      : GetScalarType<T[P], AggregateUserTermsSignature[P]>
  }




  export type UserTermsSignatureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTermsSignatureWhereInput
    orderBy?: UserTermsSignatureOrderByWithAggregationInput | UserTermsSignatureOrderByWithAggregationInput[]
    by: UserTermsSignatureScalarFieldEnum[] | UserTermsSignatureScalarFieldEnum
    having?: UserTermsSignatureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTermsSignatureCountAggregateInputType | true
    _avg?: UserTermsSignatureAvgAggregateInputType
    _sum?: UserTermsSignatureSumAggregateInputType
    _min?: UserTermsSignatureMinAggregateInputType
    _max?: UserTermsSignatureMaxAggregateInputType
  }

  export type UserTermsSignatureGroupByOutputType = {
    user_id: number
    terms_id: number
    signature: string
    signed_at: Date
    _count: UserTermsSignatureCountAggregateOutputType | null
    _avg: UserTermsSignatureAvgAggregateOutputType | null
    _sum: UserTermsSignatureSumAggregateOutputType | null
    _min: UserTermsSignatureMinAggregateOutputType | null
    _max: UserTermsSignatureMaxAggregateOutputType | null
  }

  type GetUserTermsSignatureGroupByPayload<T extends UserTermsSignatureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTermsSignatureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTermsSignatureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTermsSignatureGroupByOutputType[P]>
            : GetScalarType<T[P], UserTermsSignatureGroupByOutputType[P]>
        }
      >
    >


  export type UserTermsSignatureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    terms_id?: boolean
    signature?: boolean
    signed_at?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
    Terms?: boolean | TermsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTermsSignature"]>

  export type UserTermsSignatureSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    terms_id?: boolean
    signature?: boolean
    signed_at?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
    Terms?: boolean | TermsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTermsSignature"]>

  export type UserTermsSignatureSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    user_id?: boolean
    terms_id?: boolean
    signature?: boolean
    signed_at?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
    Terms?: boolean | TermsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTermsSignature"]>

  export type UserTermsSignatureSelectScalar = {
    user_id?: boolean
    terms_id?: boolean
    signature?: boolean
    signed_at?: boolean
  }

  export type UserTermsSignatureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"user_id" | "terms_id" | "signature" | "signed_at", ExtArgs["result"]["userTermsSignature"]>
  export type UserTermsSignatureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
    Terms?: boolean | TermsDefaultArgs<ExtArgs>
  }
  export type UserTermsSignatureIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
    Terms?: boolean | TermsDefaultArgs<ExtArgs>
  }
  export type UserTermsSignatureIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
    Terms?: boolean | TermsDefaultArgs<ExtArgs>
  }

  export type $UserTermsSignaturePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserTermsSignature"
    objects: {
      User: Prisma.$UserPayload<ExtArgs>
      Terms: Prisma.$TermsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      user_id: number
      terms_id: number
      signature: string
      signed_at: Date
    }, ExtArgs["result"]["userTermsSignature"]>
    composites: {}
  }

  type UserTermsSignatureGetPayload<S extends boolean | null | undefined | UserTermsSignatureDefaultArgs> = $Result.GetResult<Prisma.$UserTermsSignaturePayload, S>

  type UserTermsSignatureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserTermsSignatureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserTermsSignatureCountAggregateInputType | true
    }

  export interface UserTermsSignatureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserTermsSignature'], meta: { name: 'UserTermsSignature' } }
    /**
     * Find zero or one UserTermsSignature that matches the filter.
     * @param {UserTermsSignatureFindUniqueArgs} args - Arguments to find a UserTermsSignature
     * @example
     * // Get one UserTermsSignature
     * const userTermsSignature = await prisma.userTermsSignature.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTermsSignatureFindUniqueArgs>(args: SelectSubset<T, UserTermsSignatureFindUniqueArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserTermsSignature that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserTermsSignatureFindUniqueOrThrowArgs} args - Arguments to find a UserTermsSignature
     * @example
     * // Get one UserTermsSignature
     * const userTermsSignature = await prisma.userTermsSignature.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTermsSignatureFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTermsSignatureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTermsSignature that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureFindFirstArgs} args - Arguments to find a UserTermsSignature
     * @example
     * // Get one UserTermsSignature
     * const userTermsSignature = await prisma.userTermsSignature.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTermsSignatureFindFirstArgs>(args?: SelectSubset<T, UserTermsSignatureFindFirstArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTermsSignature that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureFindFirstOrThrowArgs} args - Arguments to find a UserTermsSignature
     * @example
     * // Get one UserTermsSignature
     * const userTermsSignature = await prisma.userTermsSignature.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTermsSignatureFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTermsSignatureFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTermsSignatures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTermsSignatures
     * const userTermsSignatures = await prisma.userTermsSignature.findMany()
     * 
     * // Get first 10 UserTermsSignatures
     * const userTermsSignatures = await prisma.userTermsSignature.findMany({ take: 10 })
     * 
     * // Only select the `user_id`
     * const userTermsSignatureWithUser_idOnly = await prisma.userTermsSignature.findMany({ select: { user_id: true } })
     * 
     */
    findMany<T extends UserTermsSignatureFindManyArgs>(args?: SelectSubset<T, UserTermsSignatureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserTermsSignature.
     * @param {UserTermsSignatureCreateArgs} args - Arguments to create a UserTermsSignature.
     * @example
     * // Create one UserTermsSignature
     * const UserTermsSignature = await prisma.userTermsSignature.create({
     *   data: {
     *     // ... data to create a UserTermsSignature
     *   }
     * })
     * 
     */
    create<T extends UserTermsSignatureCreateArgs>(args: SelectSubset<T, UserTermsSignatureCreateArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTermsSignatures.
     * @param {UserTermsSignatureCreateManyArgs} args - Arguments to create many UserTermsSignatures.
     * @example
     * // Create many UserTermsSignatures
     * const userTermsSignature = await prisma.userTermsSignature.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTermsSignatureCreateManyArgs>(args?: SelectSubset<T, UserTermsSignatureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTermsSignatures and returns the data saved in the database.
     * @param {UserTermsSignatureCreateManyAndReturnArgs} args - Arguments to create many UserTermsSignatures.
     * @example
     * // Create many UserTermsSignatures
     * const userTermsSignature = await prisma.userTermsSignature.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserTermsSignatures and only return the `user_id`
     * const userTermsSignatureWithUser_idOnly = await prisma.userTermsSignature.createManyAndReturn({
     *   select: { user_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserTermsSignatureCreateManyAndReturnArgs>(args?: SelectSubset<T, UserTermsSignatureCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserTermsSignature.
     * @param {UserTermsSignatureDeleteArgs} args - Arguments to delete one UserTermsSignature.
     * @example
     * // Delete one UserTermsSignature
     * const UserTermsSignature = await prisma.userTermsSignature.delete({
     *   where: {
     *     // ... filter to delete one UserTermsSignature
     *   }
     * })
     * 
     */
    delete<T extends UserTermsSignatureDeleteArgs>(args: SelectSubset<T, UserTermsSignatureDeleteArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserTermsSignature.
     * @param {UserTermsSignatureUpdateArgs} args - Arguments to update one UserTermsSignature.
     * @example
     * // Update one UserTermsSignature
     * const userTermsSignature = await prisma.userTermsSignature.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserTermsSignatureUpdateArgs>(args: SelectSubset<T, UserTermsSignatureUpdateArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTermsSignatures.
     * @param {UserTermsSignatureDeleteManyArgs} args - Arguments to filter UserTermsSignatures to delete.
     * @example
     * // Delete a few UserTermsSignatures
     * const { count } = await prisma.userTermsSignature.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTermsSignatureDeleteManyArgs>(args?: SelectSubset<T, UserTermsSignatureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTermsSignatures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTermsSignatures
     * const userTermsSignature = await prisma.userTermsSignature.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserTermsSignatureUpdateManyArgs>(args: SelectSubset<T, UserTermsSignatureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTermsSignatures and returns the data updated in the database.
     * @param {UserTermsSignatureUpdateManyAndReturnArgs} args - Arguments to update many UserTermsSignatures.
     * @example
     * // Update many UserTermsSignatures
     * const userTermsSignature = await prisma.userTermsSignature.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserTermsSignatures and only return the `user_id`
     * const userTermsSignatureWithUser_idOnly = await prisma.userTermsSignature.updateManyAndReturn({
     *   select: { user_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserTermsSignatureUpdateManyAndReturnArgs>(args: SelectSubset<T, UserTermsSignatureUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserTermsSignature.
     * @param {UserTermsSignatureUpsertArgs} args - Arguments to update or create a UserTermsSignature.
     * @example
     * // Update or create a UserTermsSignature
     * const userTermsSignature = await prisma.userTermsSignature.upsert({
     *   create: {
     *     // ... data to create a UserTermsSignature
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserTermsSignature we want to update
     *   }
     * })
     */
    upsert<T extends UserTermsSignatureUpsertArgs>(args: SelectSubset<T, UserTermsSignatureUpsertArgs<ExtArgs>>): Prisma__UserTermsSignatureClient<$Result.GetResult<Prisma.$UserTermsSignaturePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTermsSignatures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureCountArgs} args - Arguments to filter UserTermsSignatures to count.
     * @example
     * // Count the number of UserTermsSignatures
     * const count = await prisma.userTermsSignature.count({
     *   where: {
     *     // ... the filter for the UserTermsSignatures we want to count
     *   }
     * })
    **/
    count<T extends UserTermsSignatureCountArgs>(
      args?: Subset<T, UserTermsSignatureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTermsSignatureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserTermsSignature.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTermsSignatureAggregateArgs>(args: Subset<T, UserTermsSignatureAggregateArgs>): Prisma.PrismaPromise<GetUserTermsSignatureAggregateType<T>>

    /**
     * Group by UserTermsSignature.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTermsSignatureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserTermsSignatureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTermsSignatureGroupByArgs['orderBy'] }
        : { orderBy?: UserTermsSignatureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserTermsSignatureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTermsSignatureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserTermsSignature model
   */
  readonly fields: UserTermsSignatureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserTermsSignature.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTermsSignatureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    User<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Terms<T extends TermsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TermsDefaultArgs<ExtArgs>>): Prisma__TermsClient<$Result.GetResult<Prisma.$TermsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserTermsSignature model
   */
  interface UserTermsSignatureFieldRefs {
    readonly user_id: FieldRef<"UserTermsSignature", 'Int'>
    readonly terms_id: FieldRef<"UserTermsSignature", 'Int'>
    readonly signature: FieldRef<"UserTermsSignature", 'String'>
    readonly signed_at: FieldRef<"UserTermsSignature", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserTermsSignature findUnique
   */
  export type UserTermsSignatureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * Filter, which UserTermsSignature to fetch.
     */
    where: UserTermsSignatureWhereUniqueInput
  }

  /**
   * UserTermsSignature findUniqueOrThrow
   */
  export type UserTermsSignatureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * Filter, which UserTermsSignature to fetch.
     */
    where: UserTermsSignatureWhereUniqueInput
  }

  /**
   * UserTermsSignature findFirst
   */
  export type UserTermsSignatureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * Filter, which UserTermsSignature to fetch.
     */
    where?: UserTermsSignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTermsSignatures to fetch.
     */
    orderBy?: UserTermsSignatureOrderByWithRelationInput | UserTermsSignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTermsSignatures.
     */
    cursor?: UserTermsSignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTermsSignatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTermsSignatures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTermsSignatures.
     */
    distinct?: UserTermsSignatureScalarFieldEnum | UserTermsSignatureScalarFieldEnum[]
  }

  /**
   * UserTermsSignature findFirstOrThrow
   */
  export type UserTermsSignatureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * Filter, which UserTermsSignature to fetch.
     */
    where?: UserTermsSignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTermsSignatures to fetch.
     */
    orderBy?: UserTermsSignatureOrderByWithRelationInput | UserTermsSignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTermsSignatures.
     */
    cursor?: UserTermsSignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTermsSignatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTermsSignatures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTermsSignatures.
     */
    distinct?: UserTermsSignatureScalarFieldEnum | UserTermsSignatureScalarFieldEnum[]
  }

  /**
   * UserTermsSignature findMany
   */
  export type UserTermsSignatureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * Filter, which UserTermsSignatures to fetch.
     */
    where?: UserTermsSignatureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTermsSignatures to fetch.
     */
    orderBy?: UserTermsSignatureOrderByWithRelationInput | UserTermsSignatureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTermsSignatures.
     */
    cursor?: UserTermsSignatureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTermsSignatures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTermsSignatures.
     */
    skip?: number
    distinct?: UserTermsSignatureScalarFieldEnum | UserTermsSignatureScalarFieldEnum[]
  }

  /**
   * UserTermsSignature create
   */
  export type UserTermsSignatureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * The data needed to create a UserTermsSignature.
     */
    data: XOR<UserTermsSignatureCreateInput, UserTermsSignatureUncheckedCreateInput>
  }

  /**
   * UserTermsSignature createMany
   */
  export type UserTermsSignatureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTermsSignatures.
     */
    data: UserTermsSignatureCreateManyInput | UserTermsSignatureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserTermsSignature createManyAndReturn
   */
  export type UserTermsSignatureCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * The data used to create many UserTermsSignatures.
     */
    data: UserTermsSignatureCreateManyInput | UserTermsSignatureCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTermsSignature update
   */
  export type UserTermsSignatureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * The data needed to update a UserTermsSignature.
     */
    data: XOR<UserTermsSignatureUpdateInput, UserTermsSignatureUncheckedUpdateInput>
    /**
     * Choose, which UserTermsSignature to update.
     */
    where: UserTermsSignatureWhereUniqueInput
  }

  /**
   * UserTermsSignature updateMany
   */
  export type UserTermsSignatureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTermsSignatures.
     */
    data: XOR<UserTermsSignatureUpdateManyMutationInput, UserTermsSignatureUncheckedUpdateManyInput>
    /**
     * Filter which UserTermsSignatures to update
     */
    where?: UserTermsSignatureWhereInput
    /**
     * Limit how many UserTermsSignatures to update.
     */
    limit?: number
  }

  /**
   * UserTermsSignature updateManyAndReturn
   */
  export type UserTermsSignatureUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * The data used to update UserTermsSignatures.
     */
    data: XOR<UserTermsSignatureUpdateManyMutationInput, UserTermsSignatureUncheckedUpdateManyInput>
    /**
     * Filter which UserTermsSignatures to update
     */
    where?: UserTermsSignatureWhereInput
    /**
     * Limit how many UserTermsSignatures to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTermsSignature upsert
   */
  export type UserTermsSignatureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * The filter to search for the UserTermsSignature to update in case it exists.
     */
    where: UserTermsSignatureWhereUniqueInput
    /**
     * In case the UserTermsSignature found by the `where` argument doesn't exist, create a new UserTermsSignature with this data.
     */
    create: XOR<UserTermsSignatureCreateInput, UserTermsSignatureUncheckedCreateInput>
    /**
     * In case the UserTermsSignature was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTermsSignatureUpdateInput, UserTermsSignatureUncheckedUpdateInput>
  }

  /**
   * UserTermsSignature delete
   */
  export type UserTermsSignatureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
    /**
     * Filter which UserTermsSignature to delete.
     */
    where: UserTermsSignatureWhereUniqueInput
  }

  /**
   * UserTermsSignature deleteMany
   */
  export type UserTermsSignatureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTermsSignatures to delete
     */
    where?: UserTermsSignatureWhereInput
    /**
     * Limit how many UserTermsSignatures to delete.
     */
    limit?: number
  }

  /**
   * UserTermsSignature without action
   */
  export type UserTermsSignatureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTermsSignature
     */
    select?: UserTermsSignatureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTermsSignature
     */
    omit?: UserTermsSignatureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTermsSignatureInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    wallet_id: 'wallet_id',
    username: 'username',
    avatar_url: 'avatar_url',
    preferred_language_id: 'preferred_language_id',
    created_at: 'created_at',
    updated_at: 'updated_at',
    user_preferences: 'user_preferences'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const TermsScalarFieldEnum: {
    id: 'id',
    content: 'content',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type TermsScalarFieldEnum = (typeof TermsScalarFieldEnum)[keyof typeof TermsScalarFieldEnum]


  export const UserTermsSignatureScalarFieldEnum: {
    user_id: 'user_id',
    terms_id: 'terms_id',
    signature: 'signature',
    signed_at: 'signed_at'
  };

  export type UserTermsSignatureScalarFieldEnum = (typeof UserTermsSignatureScalarFieldEnum)[keyof typeof UserTermsSignatureScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    wallet_id?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    avatar_url?: IntNullableFilter<"User"> | number | null
    preferred_language_id?: IntNullableFilter<"User"> | number | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    user_preferences?: JsonNullableFilter<"User">
    terms_signatures?: UserTermsSignatureListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    wallet_id?: SortOrder
    username?: SortOrder
    avatar_url?: SortOrderInput | SortOrder
    preferred_language_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user_preferences?: SortOrderInput | SortOrder
    terms_signatures?: UserTermsSignatureOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    wallet_id?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    username?: StringFilter<"User"> | string
    avatar_url?: IntNullableFilter<"User"> | number | null
    preferred_language_id?: IntNullableFilter<"User"> | number | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    user_preferences?: JsonNullableFilter<"User">
    terms_signatures?: UserTermsSignatureListRelationFilter
  }, "id" | "wallet_id">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    wallet_id?: SortOrder
    username?: SortOrder
    avatar_url?: SortOrderInput | SortOrder
    preferred_language_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user_preferences?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    wallet_id?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    avatar_url?: IntNullableWithAggregatesFilter<"User"> | number | null
    preferred_language_id?: IntNullableWithAggregatesFilter<"User"> | number | null
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    user_preferences?: JsonNullableWithAggregatesFilter<"User">
  }

  export type TermsWhereInput = {
    AND?: TermsWhereInput | TermsWhereInput[]
    OR?: TermsWhereInput[]
    NOT?: TermsWhereInput | TermsWhereInput[]
    id?: IntFilter<"Terms"> | number
    content?: StringFilter<"Terms"> | string
    created_at?: DateTimeFilter<"Terms"> | Date | string
    updated_at?: DateTimeFilter<"Terms"> | Date | string
    signatures?: UserTermsSignatureListRelationFilter
  }

  export type TermsOrderByWithRelationInput = {
    id?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    signatures?: UserTermsSignatureOrderByRelationAggregateInput
  }

  export type TermsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TermsWhereInput | TermsWhereInput[]
    OR?: TermsWhereInput[]
    NOT?: TermsWhereInput | TermsWhereInput[]
    content?: StringFilter<"Terms"> | string
    created_at?: DateTimeFilter<"Terms"> | Date | string
    updated_at?: DateTimeFilter<"Terms"> | Date | string
    signatures?: UserTermsSignatureListRelationFilter
  }, "id">

  export type TermsOrderByWithAggregationInput = {
    id?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: TermsCountOrderByAggregateInput
    _avg?: TermsAvgOrderByAggregateInput
    _max?: TermsMaxOrderByAggregateInput
    _min?: TermsMinOrderByAggregateInput
    _sum?: TermsSumOrderByAggregateInput
  }

  export type TermsScalarWhereWithAggregatesInput = {
    AND?: TermsScalarWhereWithAggregatesInput | TermsScalarWhereWithAggregatesInput[]
    OR?: TermsScalarWhereWithAggregatesInput[]
    NOT?: TermsScalarWhereWithAggregatesInput | TermsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Terms"> | number
    content?: StringWithAggregatesFilter<"Terms"> | string
    created_at?: DateTimeWithAggregatesFilter<"Terms"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Terms"> | Date | string
  }

  export type UserTermsSignatureWhereInput = {
    AND?: UserTermsSignatureWhereInput | UserTermsSignatureWhereInput[]
    OR?: UserTermsSignatureWhereInput[]
    NOT?: UserTermsSignatureWhereInput | UserTermsSignatureWhereInput[]
    user_id?: IntFilter<"UserTermsSignature"> | number
    terms_id?: IntFilter<"UserTermsSignature"> | number
    signature?: StringFilter<"UserTermsSignature"> | string
    signed_at?: DateTimeFilter<"UserTermsSignature"> | Date | string
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
    Terms?: XOR<TermsScalarRelationFilter, TermsWhereInput>
  }

  export type UserTermsSignatureOrderByWithRelationInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
    signature?: SortOrder
    signed_at?: SortOrder
    User?: UserOrderByWithRelationInput
    Terms?: TermsOrderByWithRelationInput
  }

  export type UserTermsSignatureWhereUniqueInput = Prisma.AtLeast<{
    user_id_terms_id?: UserTermsSignatureUser_idTerms_idCompoundUniqueInput
    AND?: UserTermsSignatureWhereInput | UserTermsSignatureWhereInput[]
    OR?: UserTermsSignatureWhereInput[]
    NOT?: UserTermsSignatureWhereInput | UserTermsSignatureWhereInput[]
    user_id?: IntFilter<"UserTermsSignature"> | number
    terms_id?: IntFilter<"UserTermsSignature"> | number
    signature?: StringFilter<"UserTermsSignature"> | string
    signed_at?: DateTimeFilter<"UserTermsSignature"> | Date | string
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
    Terms?: XOR<TermsScalarRelationFilter, TermsWhereInput>
  }, "user_id_terms_id">

  export type UserTermsSignatureOrderByWithAggregationInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
    signature?: SortOrder
    signed_at?: SortOrder
    _count?: UserTermsSignatureCountOrderByAggregateInput
    _avg?: UserTermsSignatureAvgOrderByAggregateInput
    _max?: UserTermsSignatureMaxOrderByAggregateInput
    _min?: UserTermsSignatureMinOrderByAggregateInput
    _sum?: UserTermsSignatureSumOrderByAggregateInput
  }

  export type UserTermsSignatureScalarWhereWithAggregatesInput = {
    AND?: UserTermsSignatureScalarWhereWithAggregatesInput | UserTermsSignatureScalarWhereWithAggregatesInput[]
    OR?: UserTermsSignatureScalarWhereWithAggregatesInput[]
    NOT?: UserTermsSignatureScalarWhereWithAggregatesInput | UserTermsSignatureScalarWhereWithAggregatesInput[]
    user_id?: IntWithAggregatesFilter<"UserTermsSignature"> | number
    terms_id?: IntWithAggregatesFilter<"UserTermsSignature"> | number
    signature?: StringWithAggregatesFilter<"UserTermsSignature"> | string
    signed_at?: DateTimeWithAggregatesFilter<"UserTermsSignature"> | Date | string
  }

  export type UserCreateInput = {
    wallet_id: string
    username: string
    avatar_url?: number | null
    preferred_language_id?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
    terms_signatures?: UserTermsSignatureCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    wallet_id: string
    username: string
    avatar_url?: number | null
    preferred_language_id?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
    terms_signatures?: UserTermsSignatureUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    wallet_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableIntFieldUpdateOperationsInput | number | null
    preferred_language_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
    terms_signatures?: UserTermsSignatureUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    wallet_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableIntFieldUpdateOperationsInput | number | null
    preferred_language_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
    terms_signatures?: UserTermsSignatureUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    wallet_id: string
    username: string
    avatar_url?: number | null
    preferred_language_id?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUpdateManyMutationInput = {
    wallet_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableIntFieldUpdateOperationsInput | number | null
    preferred_language_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    wallet_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableIntFieldUpdateOperationsInput | number | null
    preferred_language_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TermsCreateInput = {
    content: string
    created_at?: Date | string
    updated_at?: Date | string
    signatures?: UserTermsSignatureCreateNestedManyWithoutTermsInput
  }

  export type TermsUncheckedCreateInput = {
    id?: number
    content: string
    created_at?: Date | string
    updated_at?: Date | string
    signatures?: UserTermsSignatureUncheckedCreateNestedManyWithoutTermsInput
  }

  export type TermsUpdateInput = {
    content?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    signatures?: UserTermsSignatureUpdateManyWithoutTermsNestedInput
  }

  export type TermsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    signatures?: UserTermsSignatureUncheckedUpdateManyWithoutTermsNestedInput
  }

  export type TermsCreateManyInput = {
    id?: number
    content: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TermsUpdateManyMutationInput = {
    content?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TermsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureCreateInput = {
    signature: string
    signed_at?: Date | string
    User: UserCreateNestedOneWithoutTerms_signaturesInput
    Terms: TermsCreateNestedOneWithoutSignaturesInput
  }

  export type UserTermsSignatureUncheckedCreateInput = {
    user_id: number
    terms_id: number
    signature: string
    signed_at?: Date | string
  }

  export type UserTermsSignatureUpdateInput = {
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateOneRequiredWithoutTerms_signaturesNestedInput
    Terms?: TermsUpdateOneRequiredWithoutSignaturesNestedInput
  }

  export type UserTermsSignatureUncheckedUpdateInput = {
    user_id?: IntFieldUpdateOperationsInput | number
    terms_id?: IntFieldUpdateOperationsInput | number
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureCreateManyInput = {
    user_id: number
    terms_id: number
    signature: string
    signed_at?: Date | string
  }

  export type UserTermsSignatureUpdateManyMutationInput = {
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureUncheckedUpdateManyInput = {
    user_id?: IntFieldUpdateOperationsInput | number
    terms_id?: IntFieldUpdateOperationsInput | number
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserTermsSignatureListRelationFilter = {
    every?: UserTermsSignatureWhereInput
    some?: UserTermsSignatureWhereInput
    none?: UserTermsSignatureWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserTermsSignatureOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    wallet_id?: SortOrder
    username?: SortOrder
    avatar_url?: SortOrder
    preferred_language_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user_preferences?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
    avatar_url?: SortOrder
    preferred_language_id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    wallet_id?: SortOrder
    username?: SortOrder
    avatar_url?: SortOrder
    preferred_language_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    wallet_id?: SortOrder
    username?: SortOrder
    avatar_url?: SortOrder
    preferred_language_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
    avatar_url?: SortOrder
    preferred_language_id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type TermsCountOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TermsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TermsMaxOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TermsMinOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TermsSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type TermsScalarRelationFilter = {
    is?: TermsWhereInput
    isNot?: TermsWhereInput
  }

  export type UserTermsSignatureUser_idTerms_idCompoundUniqueInput = {
    user_id: number
    terms_id: number
  }

  export type UserTermsSignatureCountOrderByAggregateInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
    signature?: SortOrder
    signed_at?: SortOrder
  }

  export type UserTermsSignatureAvgOrderByAggregateInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
  }

  export type UserTermsSignatureMaxOrderByAggregateInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
    signature?: SortOrder
    signed_at?: SortOrder
  }

  export type UserTermsSignatureMinOrderByAggregateInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
    signature?: SortOrder
    signed_at?: SortOrder
  }

  export type UserTermsSignatureSumOrderByAggregateInput = {
    user_id?: SortOrder
    terms_id?: SortOrder
  }

  export type UserTermsSignatureCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTermsSignatureCreateWithoutUserInput, UserTermsSignatureUncheckedCreateWithoutUserInput> | UserTermsSignatureCreateWithoutUserInput[] | UserTermsSignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutUserInput | UserTermsSignatureCreateOrConnectWithoutUserInput[]
    createMany?: UserTermsSignatureCreateManyUserInputEnvelope
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
  }

  export type UserTermsSignatureUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTermsSignatureCreateWithoutUserInput, UserTermsSignatureUncheckedCreateWithoutUserInput> | UserTermsSignatureCreateWithoutUserInput[] | UserTermsSignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutUserInput | UserTermsSignatureCreateOrConnectWithoutUserInput[]
    createMany?: UserTermsSignatureCreateManyUserInputEnvelope
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserTermsSignatureUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTermsSignatureCreateWithoutUserInput, UserTermsSignatureUncheckedCreateWithoutUserInput> | UserTermsSignatureCreateWithoutUserInput[] | UserTermsSignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutUserInput | UserTermsSignatureCreateOrConnectWithoutUserInput[]
    upsert?: UserTermsSignatureUpsertWithWhereUniqueWithoutUserInput | UserTermsSignatureUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTermsSignatureCreateManyUserInputEnvelope
    set?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    disconnect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    delete?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    update?: UserTermsSignatureUpdateWithWhereUniqueWithoutUserInput | UserTermsSignatureUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTermsSignatureUpdateManyWithWhereWithoutUserInput | UserTermsSignatureUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTermsSignatureScalarWhereInput | UserTermsSignatureScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserTermsSignatureUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTermsSignatureCreateWithoutUserInput, UserTermsSignatureUncheckedCreateWithoutUserInput> | UserTermsSignatureCreateWithoutUserInput[] | UserTermsSignatureUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutUserInput | UserTermsSignatureCreateOrConnectWithoutUserInput[]
    upsert?: UserTermsSignatureUpsertWithWhereUniqueWithoutUserInput | UserTermsSignatureUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTermsSignatureCreateManyUserInputEnvelope
    set?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    disconnect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    delete?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    update?: UserTermsSignatureUpdateWithWhereUniqueWithoutUserInput | UserTermsSignatureUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTermsSignatureUpdateManyWithWhereWithoutUserInput | UserTermsSignatureUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTermsSignatureScalarWhereInput | UserTermsSignatureScalarWhereInput[]
  }

  export type UserTermsSignatureCreateNestedManyWithoutTermsInput = {
    create?: XOR<UserTermsSignatureCreateWithoutTermsInput, UserTermsSignatureUncheckedCreateWithoutTermsInput> | UserTermsSignatureCreateWithoutTermsInput[] | UserTermsSignatureUncheckedCreateWithoutTermsInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutTermsInput | UserTermsSignatureCreateOrConnectWithoutTermsInput[]
    createMany?: UserTermsSignatureCreateManyTermsInputEnvelope
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
  }

  export type UserTermsSignatureUncheckedCreateNestedManyWithoutTermsInput = {
    create?: XOR<UserTermsSignatureCreateWithoutTermsInput, UserTermsSignatureUncheckedCreateWithoutTermsInput> | UserTermsSignatureCreateWithoutTermsInput[] | UserTermsSignatureUncheckedCreateWithoutTermsInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutTermsInput | UserTermsSignatureCreateOrConnectWithoutTermsInput[]
    createMany?: UserTermsSignatureCreateManyTermsInputEnvelope
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
  }

  export type UserTermsSignatureUpdateManyWithoutTermsNestedInput = {
    create?: XOR<UserTermsSignatureCreateWithoutTermsInput, UserTermsSignatureUncheckedCreateWithoutTermsInput> | UserTermsSignatureCreateWithoutTermsInput[] | UserTermsSignatureUncheckedCreateWithoutTermsInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutTermsInput | UserTermsSignatureCreateOrConnectWithoutTermsInput[]
    upsert?: UserTermsSignatureUpsertWithWhereUniqueWithoutTermsInput | UserTermsSignatureUpsertWithWhereUniqueWithoutTermsInput[]
    createMany?: UserTermsSignatureCreateManyTermsInputEnvelope
    set?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    disconnect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    delete?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    update?: UserTermsSignatureUpdateWithWhereUniqueWithoutTermsInput | UserTermsSignatureUpdateWithWhereUniqueWithoutTermsInput[]
    updateMany?: UserTermsSignatureUpdateManyWithWhereWithoutTermsInput | UserTermsSignatureUpdateManyWithWhereWithoutTermsInput[]
    deleteMany?: UserTermsSignatureScalarWhereInput | UserTermsSignatureScalarWhereInput[]
  }

  export type UserTermsSignatureUncheckedUpdateManyWithoutTermsNestedInput = {
    create?: XOR<UserTermsSignatureCreateWithoutTermsInput, UserTermsSignatureUncheckedCreateWithoutTermsInput> | UserTermsSignatureCreateWithoutTermsInput[] | UserTermsSignatureUncheckedCreateWithoutTermsInput[]
    connectOrCreate?: UserTermsSignatureCreateOrConnectWithoutTermsInput | UserTermsSignatureCreateOrConnectWithoutTermsInput[]
    upsert?: UserTermsSignatureUpsertWithWhereUniqueWithoutTermsInput | UserTermsSignatureUpsertWithWhereUniqueWithoutTermsInput[]
    createMany?: UserTermsSignatureCreateManyTermsInputEnvelope
    set?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    disconnect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    delete?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    connect?: UserTermsSignatureWhereUniqueInput | UserTermsSignatureWhereUniqueInput[]
    update?: UserTermsSignatureUpdateWithWhereUniqueWithoutTermsInput | UserTermsSignatureUpdateWithWhereUniqueWithoutTermsInput[]
    updateMany?: UserTermsSignatureUpdateManyWithWhereWithoutTermsInput | UserTermsSignatureUpdateManyWithWhereWithoutTermsInput[]
    deleteMany?: UserTermsSignatureScalarWhereInput | UserTermsSignatureScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutTerms_signaturesInput = {
    create?: XOR<UserCreateWithoutTerms_signaturesInput, UserUncheckedCreateWithoutTerms_signaturesInput>
    connectOrCreate?: UserCreateOrConnectWithoutTerms_signaturesInput
    connect?: UserWhereUniqueInput
  }

  export type TermsCreateNestedOneWithoutSignaturesInput = {
    create?: XOR<TermsCreateWithoutSignaturesInput, TermsUncheckedCreateWithoutSignaturesInput>
    connectOrCreate?: TermsCreateOrConnectWithoutSignaturesInput
    connect?: TermsWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTerms_signaturesNestedInput = {
    create?: XOR<UserCreateWithoutTerms_signaturesInput, UserUncheckedCreateWithoutTerms_signaturesInput>
    connectOrCreate?: UserCreateOrConnectWithoutTerms_signaturesInput
    upsert?: UserUpsertWithoutTerms_signaturesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTerms_signaturesInput, UserUpdateWithoutTerms_signaturesInput>, UserUncheckedUpdateWithoutTerms_signaturesInput>
  }

  export type TermsUpdateOneRequiredWithoutSignaturesNestedInput = {
    create?: XOR<TermsCreateWithoutSignaturesInput, TermsUncheckedCreateWithoutSignaturesInput>
    connectOrCreate?: TermsCreateOrConnectWithoutSignaturesInput
    upsert?: TermsUpsertWithoutSignaturesInput
    connect?: TermsWhereUniqueInput
    update?: XOR<XOR<TermsUpdateToOneWithWhereWithoutSignaturesInput, TermsUpdateWithoutSignaturesInput>, TermsUncheckedUpdateWithoutSignaturesInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserTermsSignatureCreateWithoutUserInput = {
    signature: string
    signed_at?: Date | string
    Terms: TermsCreateNestedOneWithoutSignaturesInput
  }

  export type UserTermsSignatureUncheckedCreateWithoutUserInput = {
    terms_id: number
    signature: string
    signed_at?: Date | string
  }

  export type UserTermsSignatureCreateOrConnectWithoutUserInput = {
    where: UserTermsSignatureWhereUniqueInput
    create: XOR<UserTermsSignatureCreateWithoutUserInput, UserTermsSignatureUncheckedCreateWithoutUserInput>
  }

  export type UserTermsSignatureCreateManyUserInputEnvelope = {
    data: UserTermsSignatureCreateManyUserInput | UserTermsSignatureCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserTermsSignatureUpsertWithWhereUniqueWithoutUserInput = {
    where: UserTermsSignatureWhereUniqueInput
    update: XOR<UserTermsSignatureUpdateWithoutUserInput, UserTermsSignatureUncheckedUpdateWithoutUserInput>
    create: XOR<UserTermsSignatureCreateWithoutUserInput, UserTermsSignatureUncheckedCreateWithoutUserInput>
  }

  export type UserTermsSignatureUpdateWithWhereUniqueWithoutUserInput = {
    where: UserTermsSignatureWhereUniqueInput
    data: XOR<UserTermsSignatureUpdateWithoutUserInput, UserTermsSignatureUncheckedUpdateWithoutUserInput>
  }

  export type UserTermsSignatureUpdateManyWithWhereWithoutUserInput = {
    where: UserTermsSignatureScalarWhereInput
    data: XOR<UserTermsSignatureUpdateManyMutationInput, UserTermsSignatureUncheckedUpdateManyWithoutUserInput>
  }

  export type UserTermsSignatureScalarWhereInput = {
    AND?: UserTermsSignatureScalarWhereInput | UserTermsSignatureScalarWhereInput[]
    OR?: UserTermsSignatureScalarWhereInput[]
    NOT?: UserTermsSignatureScalarWhereInput | UserTermsSignatureScalarWhereInput[]
    user_id?: IntFilter<"UserTermsSignature"> | number
    terms_id?: IntFilter<"UserTermsSignature"> | number
    signature?: StringFilter<"UserTermsSignature"> | string
    signed_at?: DateTimeFilter<"UserTermsSignature"> | Date | string
  }

  export type UserTermsSignatureCreateWithoutTermsInput = {
    signature: string
    signed_at?: Date | string
    User: UserCreateNestedOneWithoutTerms_signaturesInput
  }

  export type UserTermsSignatureUncheckedCreateWithoutTermsInput = {
    user_id: number
    signature: string
    signed_at?: Date | string
  }

  export type UserTermsSignatureCreateOrConnectWithoutTermsInput = {
    where: UserTermsSignatureWhereUniqueInput
    create: XOR<UserTermsSignatureCreateWithoutTermsInput, UserTermsSignatureUncheckedCreateWithoutTermsInput>
  }

  export type UserTermsSignatureCreateManyTermsInputEnvelope = {
    data: UserTermsSignatureCreateManyTermsInput | UserTermsSignatureCreateManyTermsInput[]
    skipDuplicates?: boolean
  }

  export type UserTermsSignatureUpsertWithWhereUniqueWithoutTermsInput = {
    where: UserTermsSignatureWhereUniqueInput
    update: XOR<UserTermsSignatureUpdateWithoutTermsInput, UserTermsSignatureUncheckedUpdateWithoutTermsInput>
    create: XOR<UserTermsSignatureCreateWithoutTermsInput, UserTermsSignatureUncheckedCreateWithoutTermsInput>
  }

  export type UserTermsSignatureUpdateWithWhereUniqueWithoutTermsInput = {
    where: UserTermsSignatureWhereUniqueInput
    data: XOR<UserTermsSignatureUpdateWithoutTermsInput, UserTermsSignatureUncheckedUpdateWithoutTermsInput>
  }

  export type UserTermsSignatureUpdateManyWithWhereWithoutTermsInput = {
    where: UserTermsSignatureScalarWhereInput
    data: XOR<UserTermsSignatureUpdateManyMutationInput, UserTermsSignatureUncheckedUpdateManyWithoutTermsInput>
  }

  export type UserCreateWithoutTerms_signaturesInput = {
    wallet_id: string
    username: string
    avatar_url?: number | null
    preferred_language_id?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUncheckedCreateWithoutTerms_signaturesInput = {
    id?: number
    wallet_id: string
    username: string
    avatar_url?: number | null
    preferred_language_id?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserCreateOrConnectWithoutTerms_signaturesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTerms_signaturesInput, UserUncheckedCreateWithoutTerms_signaturesInput>
  }

  export type TermsCreateWithoutSignaturesInput = {
    content: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TermsUncheckedCreateWithoutSignaturesInput = {
    id?: number
    content: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TermsCreateOrConnectWithoutSignaturesInput = {
    where: TermsWhereUniqueInput
    create: XOR<TermsCreateWithoutSignaturesInput, TermsUncheckedCreateWithoutSignaturesInput>
  }

  export type UserUpsertWithoutTerms_signaturesInput = {
    update: XOR<UserUpdateWithoutTerms_signaturesInput, UserUncheckedUpdateWithoutTerms_signaturesInput>
    create: XOR<UserCreateWithoutTerms_signaturesInput, UserUncheckedCreateWithoutTerms_signaturesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTerms_signaturesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTerms_signaturesInput, UserUncheckedUpdateWithoutTerms_signaturesInput>
  }

  export type UserUpdateWithoutTerms_signaturesInput = {
    wallet_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableIntFieldUpdateOperationsInput | number | null
    preferred_language_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUncheckedUpdateWithoutTerms_signaturesInput = {
    id?: IntFieldUpdateOperationsInput | number
    wallet_id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    avatar_url?: NullableIntFieldUpdateOperationsInput | number | null
    preferred_language_id?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_preferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TermsUpsertWithoutSignaturesInput = {
    update: XOR<TermsUpdateWithoutSignaturesInput, TermsUncheckedUpdateWithoutSignaturesInput>
    create: XOR<TermsCreateWithoutSignaturesInput, TermsUncheckedCreateWithoutSignaturesInput>
    where?: TermsWhereInput
  }

  export type TermsUpdateToOneWithWhereWithoutSignaturesInput = {
    where?: TermsWhereInput
    data: XOR<TermsUpdateWithoutSignaturesInput, TermsUncheckedUpdateWithoutSignaturesInput>
  }

  export type TermsUpdateWithoutSignaturesInput = {
    content?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TermsUncheckedUpdateWithoutSignaturesInput = {
    id?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureCreateManyUserInput = {
    terms_id: number
    signature: string
    signed_at?: Date | string
  }

  export type UserTermsSignatureUpdateWithoutUserInput = {
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    Terms?: TermsUpdateOneRequiredWithoutSignaturesNestedInput
  }

  export type UserTermsSignatureUncheckedUpdateWithoutUserInput = {
    terms_id?: IntFieldUpdateOperationsInput | number
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureUncheckedUpdateManyWithoutUserInput = {
    terms_id?: IntFieldUpdateOperationsInput | number
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureCreateManyTermsInput = {
    user_id: number
    signature: string
    signed_at?: Date | string
  }

  export type UserTermsSignatureUpdateWithoutTermsInput = {
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateOneRequiredWithoutTerms_signaturesNestedInput
  }

  export type UserTermsSignatureUncheckedUpdateWithoutTermsInput = {
    user_id?: IntFieldUpdateOperationsInput | number
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTermsSignatureUncheckedUpdateManyWithoutTermsInput = {
    user_id?: IntFieldUpdateOperationsInput | number
    signature?: StringFieldUpdateOperationsInput | string
    signed_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}