import schema from '~/server/data/schema/schema.json';
import Ajv, { type ValidateFunction } from 'ajv';

const ISO_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function getValidator(): ValidateFunction {
    const ajv = new Ajv();
    ajv.addFormat('date-time', {
        type: 'string',
        validate: (s) => ISO_DATE_TIME_REGEX.test(s),
    });
    return ajv.compile(schema);
}
