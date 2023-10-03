/**
 * @param {Object} param
 * @param {string[]} param.list
 * @param {boolean} param.indexed
 * @returns {string} HTMLString
 */
function selectTemplate({ list, indexed }) {
  return `
  <select>
    ${list
      .map(
        (item, i) => `
        <option value="${indexed ? i : item}">${item}</option>
    `
      )
      .join("\n")}
  </select>
  `;
}

/**
 * @param {Object} param
 * @param {number} param.min
 * @param {number} param.max
 * @returns {string} HTMLString
 */
function rangeTemplate({ min, max }) {
  return "";
}

const TYPE_TEMPLATES = {
  select: selectTemplate,
  range: rangeTemplate,
};

/**
 * @template {keyof typeof TYPE_TEMPLATES} T
 * @param {T} type
 * @param {Parameters<typeof TYPE_TEMPLATES[T]>[0]} opt
 * @returns {string} HTMLString
 */
function getTemplate(type, opt) {
  const template = TYPE_TEMPLATES[type];

  const htmlString = template(opt);

  return htmlString;
}

const rangeString = getTemplate("range", { min: 0, max: 1 });
const selectString = getTemplate("select", {
  list: ["a", "b", "c"],
  indexed: true,
});

console.log(selectString);
