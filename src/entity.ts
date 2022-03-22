/* eslint-disable max-len */
import { ANNOTATE_CHANGELOG_ENABLED, CHANGELOG_NAMESPACE } from "./constants";
import { EntityDefinition } from "./type";
import { memorized } from "./utils";

/**
 * @scope server
 * @param def entity definition
 * @returns 
 */
export const isChangeLogEnabled = memorized((def: any) => {
  if (def !== undefined) {
    if (ANNOTATE_CHANGELOG_ENABLED in def && def[ANNOTATE_CHANGELOG_ENABLED] === true) {
      return true;
    }
    if (extractChangeAwareElements(def).length > 0) {
      return true;
    }
  }
  return false;
});

/**
 * extract key names from entity definition
 * 
 * @param entityDef 
 * @returns 
 */
export const extractKeyNamesFromEntity = memorized((entityDef: EntityDefinition) => {
  return extractKeyElementsFromEntity(entityDef).map((ele: any) => ele.name);
});

/**
 * @scope server
 * @param entityDef 
 * @returns 
 */
export const extractKeyElementsFromEntity = memorized((entityDef: EntityDefinition) => {
  return Object
    .entries(entityDef?.elements ?? [])
    .filter(([_, value]) => (value as any)?.key)
    .map(([_, value]) => value);
});

const IGNORED_TYPES = ["@cds.Association", "cds.Composition"];

/**
 * @scope server
 * @param entityDef 
 * @returns 
 */
export const isLocalizedAndChangeLogRelated = memorized((entityDef: EntityDefinition): boolean => {
  return extractChangeAwareLocalizedElements(entityDef).length > 0;
});

/**
 * 
 * @scope server
 * @param entityDef 
 * @returns 
 */
export const extractChangeAwareLocalizedElements = memorized((entityDef: EntityDefinition): Array<any> => {
  return Object
    .entries(entityDef?.elements)
    .filter((entry: any[]) =>
      entry[1]?.[ANNOTATE_CHANGELOG_ENABLED] === true &&
      entry[1]?.localized === true &&
      !IGNORED_TYPES.includes(entry[1].type)
    )
    .map(entry => entry[1]);
});

/**
 * @scope server
 * @param entityDef 
 * @returns 
 */
export const extractChangeAwareElements = memorized((entityDef: EntityDefinition): Array<any> => {
  return Object
    .entries(entityDef?.elements)
    .filter((entry: any[]) =>
      entry[1]?.[ANNOTATE_CHANGELOG_ENABLED] === true &&
      entry[1]?.key !== true && // ignore key
      !IGNORED_TYPES.includes(entry[1].type)
    )
    .map(entry => entry[1]);
});

/**
 * @scope server
 * @param name entity name
 * @returns 
 */
export function isChangeLogInternalEntity(name: string = "") {
  return name.startsWith(CHANGELOG_NAMESPACE);
}
