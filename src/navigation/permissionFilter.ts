export interface NavItemLike {
  permission?: string | string[]
  children?: unknown[]
}

type CanAny = (permissions: string[]) => boolean

const allowed = (item: NavItemLike, canAny: CanAny) => {
  if (!item.permission) return true

  return canAny(Array.isArray(item.permission) ? item.permission : [item.permission])
}

/**
 * Drops nav items the user cannot reach. A parent whose children are all dropped
 * collapses too, so no group is left rendering an empty menu.
 */
export const filterNavByPermission = <T extends NavItemLike>(items: T[], canAny: CanAny): T[] => {
  return items.reduce<T[]>((kept, item) => {
    if (!allowed(item, canAny)) return kept

    if (item.children?.length) {
      const children = filterNavByPermission(item.children as T[], canAny)

      if (!children.length) return kept

      kept.push({ ...item, children })

      return kept
    }

    kept.push(item)

    return kept
  }, [])
}
