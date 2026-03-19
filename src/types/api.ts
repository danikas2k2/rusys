import type { Request, Response } from 'express';
import type { FileArray } from 'express-fileupload';
import type { ParamsDictionary } from 'express-serve-static-core';

import type { Group, Product, Summary, UserProfile, Variant, VariantAmount } from '~/types/data';

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

    // Products
    Products = '/products',
    ProductsAdd = '/products/add',
    ProductsUpdate = '/products/update',
    ProductsSetRemoving = '/products/removing',
    ProductsSetMissing = '/products/missing',
    ProductsRename = '/products/rename',
    ProductsMove = '/products/move',
    ProductsDelete = '/products/delete',

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

    // History
    History = '/history',
    HistoryUpdate = '/history/update',
    HistoryDelete = '/history/delete',
    HistoryMove = '/history/move',
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

export interface ApiRequestYear {
    year: number;
}

export interface ApiSetRemoving extends ApiRequestProduct, ApiRequestYear {
    removing: boolean;
}

export interface ApiUpdateProduct extends ApiRequestProduct, ApiRequestYear {
    amounts?: readonly VariantAmount[];
    user?: string;
}

export interface ApiMoveProductsHistoryEntry {
    group: string;
    name: string;
    time: number;
    year: number;
    newGroup: string;
    newName: string;
    newYear: number;
}

export interface ApiDeleteProductsHistoryEntry extends ApiRequestProduct, ApiRequestYear {
    time: number;
}

export interface ApiUpdateProductsHistoryEntry extends ApiDeleteProductsHistoryEntry {
    amounts: readonly VariantAmount[];
    user?: string;
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
    history: readonly History[];
}

export interface ApiRequestHistory extends ApiRequestProduct {
    time: number;
    year?: number;
    user?: string;
}

export interface ApiUpdateHistory extends ApiRequestHistory {
    amounts?: readonly VariantAmount[];
}

export interface ApiMoveHistory extends ApiRequestHistory {
    newGroup?: string;
    newName?: string;
    newYear?: number;
}
