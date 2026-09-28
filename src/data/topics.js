/* Topics: the branches of math (Fractions, Algebra, ...) and the kinds of
   question within each (Equivalent Fractions, Ordering Fractions, ...), as
   the grade page's left panel lists them. */

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const byGradeThenTopic = (a, b) => a.grade - b.grade || a.topic.localeCompare(b.topic);

// Kinds are keyed case-insensitively: the source spells "Sharing in a Ratio"
// two ways, and they are one kind.
export function kindsOf(list) {
  const map = new Map();
  list.forEach((s) => {
    const key = s.topic.trim().toLowerCase();
    if (!map.has(key)) map.set(key, { key, name: s.topic.trim(), sessions: [] });
    map.get(key).sessions.push(s);
  });
  return [...map.values()]
    .map((k) => ({ ...k, sessions: k.sessions.sort(byGradeThenTopic) }))
    .sort(
      (a, b) =>
        b.sessions.length - a.sessions.length ||
        a.sessions[0].grade - b.sessions[0].grade ||
        a.name.localeCompare(b.name)
    );
}
