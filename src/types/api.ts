import { type Details, type Group, type Summary, type Variant, type VariantAmount } from '~/types/data';
import { type Request, type Response } from 'express';
import { type FileArray } from 'express-fileupload';
import { type ParamsDictionary } from 'express-serve-static-core';

export type ApiRequest<R = unknown> = Request<ParamsDictionary, unknown, R>;
export type ApiResult<R = unknown> = { ok: true } | ({ ok: true } & R) | { ok?: false; error?: string };
export type ApiResponse<R = unknown> = Response<ApiResult<R>>;

export const enum ApiUrl {
    // Export/Import
    Export = '/export',
    Import = '/import',

    // Client/User
    ClientId = '/clientId',
    CheckUser = '/checkUser',

    // Summary
    Summary = '/summary',

    // Details
    Details = '/details',
    DetailsAdd = '/details/add',
    DetailsUpdate = '/details/update',
    DetailsSetRemoving = '/details/removing',
    DetailsSetMissing = '/details/missing',
    DetailsRename = '/details/rename',
    DetailsMove = '/details/move',
    DetailsDelete = '/details/delete',

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
    email: string;
    allowed: boolean;
}

export interface ApiClientId {
    clientId: string;
}

export interface ApiDetails {
    details: ReadonlyArray<Details>;
}

export interface ApiYears {
    years: ReadonlyArray<number>;
}

export interface ApiRequestDetails {
    group: string;
    name: string;
}

export interface ApiMoveDetails extends ApiRequestDetails {
    newGroup: string;
    newName?: string;
}

export interface ApiRenameDetails extends ApiRequestDetails {
    newName: string;
}

export interface ApiSetMissing extends ApiRequestDetails {
    missing: boolean;
}

export interface ApiSetRemoving extends ApiRequestDetails {
    year: number;
    removing: boolean;
}

export interface ApiUpdateDetails extends ApiRequestDetails {
    year: number;
    amounts?: ReadonlyArray<VariantAmount>;
}

export interface ApiSummary {
    years: ReadonlyArray<number>;
    summary: ReadonlyArray<Summary>;
}

export interface ApiGroups {
    groups: ReadonlyArray<Group>;
}

export interface ApiRequestGroup {
    group: string;
}

export interface ApiRenameGroup extends ApiRequestGroup {
    newGroup: string;
}

export interface ApiUpdateGroup extends ApiRequestGroup {
    order?: number;
}

export interface ApiReorderGroups {
    groups: Readonly<Record<string, number>>;
}

export interface ApiVariants {
    variants: ReadonlyArray<Variant>;
}

export interface ApiRequestVariant {
    group: string;
    variant: string;
}

export interface ApiUpdateVariant extends ApiRequestVariant {
    order?: number;
    long?: string;
    short?: string;
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

export type ApiDetailsWithYears = ApiYears & ApiDetails;

export type ApiDetailsWithVariants = ApiDetailsWithYears & ApiVariants;

export type ApiDetailsWithGroups = ApiDetailsWithVariants & ApiGroups;

export type ApiVariantsWithGroups = ApiVariants & ApiGroups;

export type ApiAllSummary = ApiSummary & ApiVariantsWithGroups;

export type ApiExport = ApiDetails & ApiVariantsWithGroups;

export type ApiWithFiles = { files?: FileArray };
