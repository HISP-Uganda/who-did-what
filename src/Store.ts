import { intersection, isEmpty } from "lodash";
import { domain } from "./Domains";
import {
    changeTotal,
    changeTrackedEntityType,
    changeTypes,
    changeOu,
    changePeriod,
    changeTrackedEntityAttributes,
    changeDataElement,
    changeProgram,
    changeStage,
    changeAttribute,
    changeDistrict,
    changeUsers,
    changeDistricts,
    setExpandedKeys,
    setSelected,
    changePage,
    changePageSize,
    changeSelectedOu,
    changeUserGroups,
    setLevels,
    setSelectedLevel,
} from "./Events";
import { Store } from "./interfaces";

export const $pagination = domain
    .createStore<{
        pageSize: number;
        page: number;
    }>({
        pageSize: 25,
        page: 1,
    })
    .on(changePage, (state, page) => {
        return { ...state, page };
    })
    .on(changePageSize, (state, pageSize) => {
        return { ...state, pageSize };
    });

export const $store = domain
    .createStore<Store>({
        loading: false,
        total: { gYKNziyGEIz: 0, aslYgAGKjTw: 0 },
        organisationUnits: [],
        period: [{ id: "LAST_YEAR", name: "Last Year" }],
        programs: [],
        dataSets: [],
        program: {},
        stage: "",
        attribute: "",
        users: [],
        districts: {},
        expandedKeys: [],
        selected: [],
        userGroups: [],
        selectedOu: {},
        levels: [],
        selectedLevel: "",
    })
    .on(changeTotal, (state, total) => {
        return { ...state, total: { ...state.total, ...total } };
    })
    .on(changeOu, (state, organisationUnits: any[]) => {
        return { ...state, organisationUnits };
    })
    .on(changePeriod, (state, period: any[]) => {
        return { ...state, period };
    })
    .on(changeTrackedEntityType, (state, trackedEntityType) => {
        return { ...state, trackedEntityType };
    })
    .on(changeDataElement, (state, dataElement) => {
        return { ...state, dataElement };
    })
    .on(changeStage, (state, stage) => {
        return { ...state, stage };
    })
    .on(changeAttribute, (state, attribute) => {
        return { ...state, attribute };
    })
    .on(changeTrackedEntityAttributes, (state, trackedEntityAttribute) => {
        return { ...state, trackedEntityAttribute };
    })
    .on(changeTypes, (state, { programs, dataSets, organisationUnits }) => {
        return {
            ...state,
            programs,
            dataSets,
            organisationUnits,
        };
    })
    .on(changeProgram, (state, program) => {
        return {
            ...state,
            program,
        };
    })
    .on(changeDistrict, (state, Orgunit) => {
        return { ...state, Orgunit };
    })
    .on(changeUsers, (state, users) => {
        return { ...state, users };
    })
    .on(changeDistricts, (state, districts) => {
        return { ...state, districts };
    })
    .on(setExpandedKeys, (state, expandedKeys) => {
        return { ...state, expandedKeys };
    })
    .on(setSelected, (state, selected) => {
        return { ...state, selected };
    })
    .on(changeSelectedOu, (state, selectedOu) => {
        return { ...state, selectedOu };
    })
    .on(changeUserGroups, (state, userGroups) => {
        return { ...state, userGroups };
    })
    .on(setLevels, (state, levels) => {
        return { ...state, levels };
    })
    .on(setSelectedLevel, (state, selectedLevel) => {
        return { ...state, selectedLevel };
    });

export const $trackerPrograms = $store.map(({ programs }) => {
    return programs.filter((item) => item.programType === "WITH_REGISTRATION");
});

export const $eventPrograms = $store.map(({ programs }) => {
    return programs.filter(
        (item) => item.programType === "WITHOUT_REGISTRATION"
    );
});

export const $attributes = $store.map(({ program }) => {
    if (!isEmpty(program)) {
        return program.programTrackedEntityAttributes.map(
            (tea: any) => tea.trackedEntityAttribute
        );
    }
    return [];
});

export const $stages = $store.map(({ program }) => {
    if (!isEmpty(program)) {
        return program.programStages;
    }
    return [];
});

export const $dataElements = $store.map(({ program, stage }) => {
    if (!isEmpty(program)) {
        const foundStage = program.programStages.find(
            (ps: any) => ps.id === stage
        );
        if (foundStage) {
            return foundStage.programStageDataElements.map(
                (psde: any) => psde.dataElement
            );
        }
    }
    return [];
});

export const $canDownload = $store.map(({ userGroups }) => {
    return intersection(userGroups, ["RIpQlyW6TQH", "HB77j3OzP5K"]).length > 0;
});
