const getResponsiveValue = (attributes, slug, device) => {
    return attributes?.[slug]?.[device] ?? attributes?.[slug] ?? null;
}

export default getResponsiveValue;