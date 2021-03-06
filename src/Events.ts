import { domain } from "./Domains";
import { DataSet, Program } from "./interfaces";

export const changeTotal = domain.createEvent<{ [k: string]: number }>();
export const changePeriod = domain.createEvent<any[]>("change period");
export const changeOu = domain.createEvent<any[]>("change OrgUnit");
export const changeTrackedEntityType = domain.createEvent<string>();
export const changeDataElement = domain.createEvent<string>();
export const changeProgram = domain.createEvent<any>();
export const changeTrackedEntityAttributes = domain.createEvent<string>();
export const changeStage = domain.createEvent<string>();
export const changeAttribute = domain.createEvent<string>();
export const changeTypes = domain.createEvent<{
  programs: Program[];
  dataSets: DataSet[];
  organisationUnits: string[];
}>();
export const changeDistrict = domain.createEvent<any>();
export const changeUsers = domain.createEvent<{ [k: string]: any }>();
export const changeDistricts = domain.createEvent<{ [k: string]: string }>();
export const setExpandedKeys = domain.createEvent<string[]>();
export const setSelected = domain.createEvent<any[]>();
export const changePage = domain.createEvent<number>();
export const changePageSize = domain.createEvent<number>();
export const changeSelectedOu = domain.createEvent<string>();
export const changeUserGroups = domain.createEvent<string[]>();
export const setLevels =
  domain.createEvent<{ id: string; name: string; level: string }[]>();

export const setSelectedLevel = domain.createEvent<string>();
