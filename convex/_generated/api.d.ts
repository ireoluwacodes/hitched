/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as eventSettings from "../eventSettings.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_branding from "../lib/branding.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_settings from "../lib/settings.js";
import type * as menu from "../menu.js";
import type * as menuMutations from "../menuMutations.js";
import type * as orders from "../orders.js";
import type * as seed from "../seed.js";
import type * as tables from "../tables.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  eventSettings: typeof eventSettings;
  "lib/auth": typeof lib_auth;
  "lib/branding": typeof lib_branding;
  "lib/crypto": typeof lib_crypto;
  "lib/settings": typeof lib_settings;
  menu: typeof menu;
  menuMutations: typeof menuMutations;
  orders: typeof orders;
  seed: typeof seed;
  tables: typeof tables;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
