/** Only code-owned categories belong here. Never add content, identifiers or free-text fields. */
const dialogs = [
    'group',
    'product',
    'variant',
    'amount',
    'move_variants',
    'import',
    'export',
    'review',
    'summary_history',
    'annual_amount',
    'expiry_picker',
    'photo_preview',
    'confirmation',
    'discard_changes',
    'error',
    'logout',
] as const;
const forms = [
    'group',
    'product',
    'variant',
    'amount',
    'move_consumed',
    'move_variants',
    'import',
    'review',
    'annual_amount',
] as const;
const fields = [
    'name',
    'description',
    'category',
    'group',
    'parent',
    'amount',
    'quantity',
    'unit',
    'units',
    'suffix',
    'count',
    'price',
    'date',
    'year',
    'annual',
    'review',
    'expiry',
    'expiry_tolerance',
    'expiryTolerance',
    'image',
    'file',
    'missing',
    'removing',
    'comment',
    'target',
    'variant',
    'variants',
] as const;
const results = ['started', 'success', 'error'] as const;
const formField = { form: forms, field: fields } as const;

export const FARO_EVENT_ATTRIBUTES = {
    telemetry_enabled: {},
    search_performed: {},
    filter_applied: {},
    image_uploaded: {},
    item_created: {},
    export_started: {},
    dialog_opened: { dialog: dialogs },
    dialog_closed: { dialog: dialogs },
    form_field_changed: formField,
    form_submitted: { form: forms },
    form_validation_failed: formField,
    form_result: { form: forms, result: ['success', 'error'] },
    checkbox_changed: {
        control: [
            'missing',
            'removing',
            'selection',
            'review',
            'show_removed',
            'show_missing',
            'review_item',
            'review_all',
            'category_annual',
            'category_review',
        ],
        state: ['checked', 'unchecked'],
    },
    list_reordered: { list: ['groups', 'variants'], result: ['success', 'error'] },
    refresh: { source: ['toolbar', 'pull_to_refresh'], result: results },
    auth: { action: ['login', 'logout'], result: results },
    navigation: { page: ['categories', 'products', 'variants', 'summary'] },
    tab_changed: { tab: ['quantities', 'history'] },
    view_changed: { view: ['detailed', 'total'] },
    data_action: {
        entity: ['group', 'variant', 'product', 'review', 'archive', 'stock'],
        action: [
            'create',
            'update',
            'rename',
            'delete',
            'copy',
            'move',
            'undo',
            'redo',
            'set_amounts',
            'transfer_amounts',
            'recycle',
            'apply_review',
            'set_missing',
            'set_removing',
            'set_parent',
            'set_expiry_tolerance',
            'set_image',
            'import',
            'export',
        ],
        result: results,
    },
} as const;

export type FaroEvent = keyof typeof FARO_EVENT_ATTRIBUTES;
export type FaroEventAttributes<Name extends FaroEvent> = {
    [
        Key in keyof (typeof FARO_EVENT_ATTRIBUTES)[Name]
    ]?: (typeof FARO_EVENT_ATTRIBUTES)[Name][Key] extends readonly string[]
        ? (typeof FARO_EVENT_ATTRIBUTES)[Name][Key][number]
        : never;
};
export const FARO_EVENTS = Object.keys(FARO_EVENT_ATTRIBUTES) as FaroEvent[];

/** Revalidate at the transport boundary: TypeScript cannot protect runtime payloads. */
export function sanitizeFaroAttributes(name: FaroEvent, attributes: unknown): Record<string, string> | undefined {
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
        return undefined;
    }
    const schema = FARO_EVENT_ATTRIBUTES[name];
    const kept = Object.fromEntries(
        Object.entries(schema).flatMap(([key, allowed]: [string, readonly string[]]) => {
            const value: unknown = Object.hasOwn(attributes, key) ? Reflect.get(attributes, key) : undefined;
            return typeof value === 'string' && allowed.includes(value) ? [[key, value]] : [];
        })
    );
    return Object.keys(kept).length ? kept : undefined;
}
