export function byProperty(prop) {
  return (left, right) =>
    left.out(prop).value.localeCompare(right.out(prop).value);
}
