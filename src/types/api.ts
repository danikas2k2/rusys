import type { Request, Response } from 'express';
import type { FileArray } from 'express-fileupload';
import type { ParamsDictionary } from 'express-serve-static-core';

import type { Group, Product, Summary, UserProfile, Variant, VariantAmount, VariantUnits } from '~/types/data';

export type ApiRequest<R = unknown> = Request<ParamsDictionary, unknown, R>;
export type ApiResult<R = unknown> = ({ ok: true } & R) | { ok?: false; error?: string };
export type ApiResponse<R = unknown> = Response<ApiResult<R>>;

export const enum ApiUrl {
    // Export/Import
    Export = '/export',
    Import = '/import',

    // Client/User
    ClientId = '/clientId',
    CheckUser = '/checkUser',
    UserProfileUpsert = '/userProfile/upsert',
    UserProfiles = '/userProfiles',

    // Summary
    Summary = '/summary',
    SummaryHistory = '/summary/history',

    // Products
    Products = '/products',
    ProductsAdd = '/products/add',
    ProductsUpdate = '/products/update',
    ProductsUndo = '/products/undo',
    ProductsRedo = '/products/redo',
    ProductsSetRemoving = '/products/removing',
    ProductsSetMissing = '/products/missing',
    ProductsSetMissingBulk = '/products/missing/bulk',
    ProductsSetImage = '/products/image',
    ProductsSetVariantImage = '/products/variantImage',
    ProductsRename = '/products/rename',
    ProductsMove = '/products/move',
    ProductsDelete = '/products/delete',
    ProductsHistory = '/products/history',

    // Groups
    Groups = '/groups',
    GroupsUpdate = '/groups/update',
    GroupsReorder = '/groups/reorder',
    GroupsRename = '/groups/rename',
    GroupsDelete = '/groups/delete',

    // Variants
    Variants = '/variants',
    VariantsUpdate = '/variants/update',
    VariantsReorder = '/variants/reorder',
    VariantsRename = '/variants/rename',
    VariantsCopy = '/variants/copy',
    VariantsDelete = '/variants/delete',
}

export interface ApiUserEmail {
    email: string;
}

export interface ApiUserAllowed {
    allowed: boolean;
}

export interface ApiClientId {
    clientId: string;
}

export interface ApiUpsertUserProfile {
    email: string;
    name?: string;
    picture?: string;
}

export interface ApiGetUserProfiles {
    emails: readonly string[];
}

export interface ApiUserProfiles {
    profiles: readonly UserProfile[];
}

export interface ApiProducts {
    products: readonly Product[];
}

export interface ApiYears {
    years: readonly number[];
}

export interface ApiRequestProduct {
    group: string;
    name: string;
    year?: number;
}

export interface ApiRequestProductWithYear extends ApiRequestProduct {
    year: number;
}

export interface ApiMoveProduct extends ApiRequestProduct {
    newGroup: string;
    newName?: string;
}

export interface ApiRenameProduct extends ApiRequestProduct {
    newName: string;
}

export interface ApiSetMissing extends ApiRequestProduct {
    missing: boolean;
}

export interface ApiSetImage extends ApiRequestProduct {
    image: string;
}

export interface ApiSetVariantImage extends ApiRequestProduct {
    variant: string;
    image: string;
}

export interface ApiSetMissingBulk {
    updates: readonly { group: string; name: string; missing: boolean }[];
}

export interface ApiRequestYear {
    year: number;
}

export interface ApiRequestHistory {
    group: string;
    name: string;
    year: number;
}

export interface ApiSetRemoving extends ApiRequestProductWithYear {
    removing: boolean;
}

export interface ApiUpdateProduct extends ApiRequestProductWithYear {
    amounts?: readonly VariantAmount[];
    user?: string;
    comment?: string;
}

export interface ApiSummary {
    years: readonly number[];
    summary: readonly Summary[];
}

export interface ApiGroups {
    groups: readonly Group[];
}

export interface ApiRequestGroup {
    group: string;
}

export interface ApiUpdateGroup extends ApiRequestGroup {
    annual?: boolean;
    review?: boolean;
    image?: string;
}

export interface ApiRenameGroup extends ApiUpdateGroup {
    newGroup: string;
}

export interface ApiReorderGroups {
    groups: Readonly<Record<string, number>>;
}

export interface ApiVariants {
    variants: readonly Variant[];
}

export interface ApiRequestVariant {
    group: string;
    variant: string;
}

export interface ApiUpdateVariant extends ApiRequestVariant {
    order?: number;
    suffix?: string;
    count?: number;
    units?: VariantUnits;
}

export interface ApiRenameVariant extends ApiUpdateVariant {
    newVariant: string;
}

export interface ApiCopyVariant extends ApiUpdateVariant {
    newGroup: string;
    newVariant?: string;
}

export interface ApiReorderVariants {
    group: string;
    variants: Readonly<Record<string, number>>;
}

export type ApiProductsWithYears = ApiYears & ApiProducts;

export type ApiProductsWithVariants = ApiProductsWithYears & ApiVariants;

export type ApiProductsWithGroups = ApiProductsWithVariants & ApiGroups;

export type ApiVariantsWithGroups = ApiVariants & ApiGroups;

export type ApiAllSummary = ApiSummary & ApiVariantsWithGroups;

export type ApiExport = ApiProducts & ApiVariantsWithGroups;

export type ApiWithFiles = { files?: FileArray };

export interface ApiHistory {
    updates: readonly History[];
    undates: readonly History[];
}
