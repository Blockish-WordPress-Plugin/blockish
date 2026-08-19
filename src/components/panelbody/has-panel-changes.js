const isPlainObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const DEVICE_KEYS = ['Desktop', 'Tablet', 'Mobile'];

export const isEmptyStoredValue = (value) => {
    if (value === undefined || value === null || value === '') {
        return true;
    }

    if (typeof value === 'boolean') {
        return value === false;
    }

    if (typeof value === 'number') {
        return false;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(/\s+/g, '');
        return normalized === '' || normalized === '{{SELECTOR}}{}';
    }

    if (Array.isArray(value)) {
        return value.length === 0 || value.every(isEmptyStoredValue);
    }

    if (isPlainObject(value)) {
        if (Object.prototype.hasOwnProperty.call(value, 'enabled') && value.enabled === false) {
            return true;
        }
        const keys = Object.keys(value);
        return keys.length === 0 || keys.every((key) => isEmptyStoredValue(value[key]));
    }

    return false;
};

const normalizeIndicatorValue = (value) => {
    if (isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, 'enabled') && value.enabled === false) {
        return { enabled: false };
    }
    return value;
};

const valuesMatch = (left, right) => {
    if (left === right) {
        return true;
    }

    try {
        return JSON.stringify(normalizeIndicatorValue(left)) === JSON.stringify(normalizeIndicatorValue(right));
    } catch {
        return false;
    }
};

const collectScalarValues = (value) => {
    if (value === undefined || value === null || value === '') {
        return [];
    }

    if (typeof value !== 'object') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (Object.prototype.hasOwnProperty.call(value, 'value') && !DEVICE_KEYS.some((key) => key in value)) {
        return value.value === undefined || value.value === null || value.value === ''
            ? []
            : [value.value];
    }

    const collected = [];
    DEVICE_KEYS.forEach((device) => {
        if (!Object.prototype.hasOwnProperty.call(value, device)) {
            return;
        }
        const entry = value[device];
        if (entry && typeof entry === 'object' && !Array.isArray(entry) && 'value' in entry) {
            if (entry.value !== undefined && entry.value !== null && entry.value !== '') {
                collected.push(entry.value);
            }
            return;
        }
        if (entry !== undefined && entry !== null && entry !== '') {
            collected.push(entry);
        }
    });

    if (!collected.length && Object.prototype.hasOwnProperty.call(value, 'value')) {
        if (value.value !== undefined && value.value !== null && value.value !== '') {
            collected.push(value.value);
        }
    }

    return collected;
};

const matchesExpected = (scalars, expected) => {
    const wanted = Array.isArray(expected) ? expected : [expected];
    return scalars.some((scalar) => wanted.includes(scalar));
};

const isRuleSatisfied = (source, rule) => {
    if (typeof rule === 'string') {
        return !isEmptyStoredValue(source?.[rule]);
    }

    if (!rule || typeof rule !== 'object' || !rule.slug) {
        return true;
    }

    const raw = source?.[rule.slug];
    const scalars = collectScalarValues(raw);

    if (Object.prototype.hasOwnProperty.call(rule, 'value')) {
        return matchesExpected(scalars, rule.value);
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'not')) {
        const banned = Array.isArray(rule.not) ? rule.not : [rule.not];
        if (!scalars.length) {
            return true;
        }
        return scalars.every((scalar) => !banned.includes(scalar));
    }

    return !isEmptyStoredValue(raw);
};

export const isIndicatorWhenSatisfied = (source, when) => {
    if (!when) {
        return true;
    }
    const rules = Array.isArray(when) ? when : [when];
    return rules.every((rule) => isRuleSatisfied(source, rule));
};

export const collectIndicatorWhenSlugs = (indicatorWhen = {}) => {
    const extra = [];
    Object.values(indicatorWhen).forEach((when) => {
        const rules = Array.isArray(when) ? when : [when];
        rules.forEach((rule) => {
            if (typeof rule === 'string') {
                extra.push(rule);
            } else if (rule?.slug) {
                extra.push(rule.slug);
            }
        });
    });
    return extra;
};

export const hasPanelChanges = (source = {}, slugs = [], defaults = {}, indicatorWhen = {}) => {
    if (!Array.isArray(slugs) || slugs.length === 0) {
        return false;
    }

    return slugs.some((slug) => {
        if (!isIndicatorWhenSatisfied(source, indicatorWhen[slug])) {
            return false;
        }

        const current = source?.[slug];
        const hasDefault = Object.prototype.hasOwnProperty.call(defaults, slug);

        if (!hasDefault) {
            return !isEmptyStoredValue(current);
        }

        const effective =
            current === undefined || current === null || current === ''
                ? defaults[slug]
                : current;

        return !valuesMatch(effective, defaults[slug]);
    });
};
