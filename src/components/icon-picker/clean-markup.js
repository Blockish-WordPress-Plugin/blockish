function cleanMarkup(svgString) {
  return svgString
    // remove CR and LF
    .replace(/\r?\n|\r/g, '')
    // remove multiple spaces
    .replace(/\s+/g, ' ')
    // remove spaces before/after tags
    .replace(/>\s+</g, '><')
    // trim final
    .trim();
}

export default cleanMarkup;