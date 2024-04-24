import { groupBy, sum, uniq, min } from "lodash";

export const enrollmentCounts = (
    logins: string,
    startDate: string,
    endDate: string
) => {
    const dateQuery =
        startDate && endDate
            ? `and date(created) between '${startDate}' and '${endDate}'`
            : "";
    return {
        type: "QUERY",
        publicAccess: "rwrw----",
        access: {
            read: true,
            update: true,
            externalize: true,
            delete: true,
            write: true,
            manage: true,
            data: {
                read: true,
                write: true,
            },
        },
        sharing: {
            owner: "w29gG6lD26U",
            external: false,
            users: {},
            userGroups: {},
            public: "rwrw----",
        },
        id: "kIEqe77I6oC",
        sqlQuery: `select storedby,COUNT(programinstanceid) from programinstance where storedby in (${logins}) ${dateQuery} and deleted = false group by storedby;`,
        description: "Query Enrollments by Users",
        name: "Enrollments Per Person",
        cacheStrategy: "NO_CACHE",
    };
};
export const enrollmentCountsGroupByDistricts = (
    startDate: string,
    endDate: string
) => {
    const dateQuery =
        startDate && endDate
            ? `and date(pi.created) between '${startDate}' and '${endDate}'`
            : "";
    return {
        type: "QUERY",
        publicAccess: "rwrw----",
        access: {
            read: true,
            update: true,
            externalize: true,
            delete: true,
            write: true,
            manage: true,
            data: {
                read: true,
                write: true,
            },
        },
        sharing: {
            owner: "w29gG6lD26U",
            external: false,
            users: {},
            userGroups: {},
            public: "rwrw----",
        },
        id: "kVTqe77I6oC",
        sqlQuery: `select split_part(o.path, '/', 4) as ou,COUNT(pi.programinstanceid) from programinstance pi 
    inner join organisationunit o using(organisationunitid)
    where deleted = false ${dateQuery} group by ou;`,

        description: "Query Enrollments by Districts",
        name: "Enrollments Per District",
        cacheStrategy: "NO_CACHE",
    };
};
export const eventCounts = (
    logins: string,
    startDate: string,
    endDate: string
) => {
    const dateQuery =
        startDate && endDate
            ? `and date(created) between '${startDate}' and '${endDate}'`
            : "";
    return {
        type: "QUERY",
        publicAccess: "rwrw----",
        access: {
            read: true,
            update: true,
            externalize: true,
            delete: true,
            write: true,
            manage: true,
            data: {
                read: true,
                write: true,
            },
        },
        sharing: {
            owner: "w29gG6lD26U",
            external: false,
            users: {},
            userGroups: {},
            public: "rwrw----",
        },
        id: "kCt1rIMGkJb",
        sqlQuery: `select storedby,status,COUNT(*) from (select programstageinstanceid,storedby,eventdatavalues->'bbnyNYD1wgS'->>'value' as vaccine,eventdatavalues->'LUIsbsm3okG'->>'value' as dose,status from programstageinstance where storedby in (${logins}) ${dateQuery} and deleted = false) psi  where psi.vaccine is not null and psi.dose is not null group by storedby,status;`,
        description: "Events Per Person",
        name: "Events Per Person",
        cacheStrategy: "NO_CACHE",
    };
};

export const eventCountsGroupByDistrict = (
    startDate: string,
    endDate: string
) => {
    const dateQuery =
        startDate && endDate
            ? `and date(pi.created) between '${startDate}' and '${endDate}'`
            : "";
    return {
        type: "QUERY",
        publicAccess: "rwrw----",
        access: {
            read: true,
            update: true,
            externalize: true,
            delete: true,
            write: true,
            manage: true,
            data: {
                read: true,
                write: true,
            },
        },
        sharing: {
            owner: "w29gG6lD26U",
            external: false,
            users: {},
            userGroups: {},
            public: "rwrw----",
        },
        id: "kbc1rIMGkJb",
        sqlQuery: `select split_part(o.path, '/', 4) as ou,pi.status,COUNT(pi.programstageinstanceid) from programstageinstance pi inner join organisationunit o using(organisationunitid) where deleted = false ${dateQuery} and eventdatavalues#>>'{bbnyNYD1wgS, value}'  is not null and eventdatavalues#>>'{LUIsbsm3okG, value}'  is not null group by ou,status;`,
        description: "Events Per District",
        name: "Events Per District",
        cacheStrategy: "NO_CACHE",
    };
};

export const processEvents = ({ listGrid: { rows, headers } }: any) => {
    const groupedEvents = groupBy(
        rows.map((e: any) => {
            return { username: e[0], status: e[1], value: Number(e[2]) };
        }),
        "username"
    );

    return Object.entries(groupedEvents).map(([username, data]) => {
        return { username, events: sum(data.map((d) => d.value)) };
    });
};

export const columns = [
    {
        name: "ID",
        id: "id",
    },
    {
        name: "Vaccination Card No",
        id: ["hDdStedsrHN", "ozr4eUxYkva"],
    },
    {
        name: "NIN",
        id: "Ewi7FUfcHAD",
    },
    {
        name: "Profile created by",
        id: "tei_stored_by",
    },
    {
        name: "Client category",
        id: "pCnbIVhxv4j",
    },
    {
        name: "Alternative ID",
        id: "ud4YNaOH3Dw",
    },
    {
        name: "Alternative ID No",
        id: "YvnFn4IjKzx",
    },
    {
        name: "Client name",
        id: "sB1IHYu2xQT",
    },
    {
        name: "Sex",
        id: "FZzQbW8AWVd",
    },
    {
        name: "Date of birth",
        id: "NI0QRzJvQ0k",
    },
    {
        name: "Age",
        id: "s2Fmb8zgEem",
    },
    {
        name: "Telephone contact",
        id: "ciCR6BBvIT4",
    },

    {
        name: "Address - District and Subcounty",
        id: "Za0xkyQDpxA",
    },
    {
        name: "Priority Population Group",
        id: "CFbojfdkIIj",
    },
    {
        name: "Place of work",
        id: "ZHF7EsKgiaM",
    },
    {
        name: "Main Occupation",
        id: "pK0K4T2Cq2f",
    },
    {
        name: "Institution Level",
        id: "ZpvNoELGUnJ",
    },
    {
        name: "Registering facility",
        id: "regorgunitname",
    },
    {
        name: "Vaccination facility",
        id: "orgunitname",
    },
    {
        name: "Date of Vaccination",
        id: "event_execution_date",
    },
    {
        name: "Vaccine Name",
        id: ["bbnyNYD1wgS", "oOqS5bMo20q"],
    },
    {
        name: "Underlying condition",
        id: "bCtWZGjSWM8",
    },
    {
        name: "Event created by",
        id: "event_stored_by",
    },
    {
        name: "Created on",
        id: "event_created",
    },
    {
        name: "Manufacturer",
        id: ["rpkH9ZPGJcX", "UCdRPDvBar4"],
    },

    {
        name: "Batch Number",
        id: ["Yp1F4txx8tm", "rb384fbj6Ub"],
    },
    {
        name: "Dose Number",
        id: "LUIsbsm3okG",
    },
    {
        name: "Event Status",
        id: "event_status",
    },
    {
        name: "PI Deleted",
        id: "pi_deleted",
    },
    {
        name: "TEI Deleted",
        id: "tei_deleted",
    },
    {
        name: "PSI Deleted",
        id: "psi_deleted",
    },
];

export const findAllUsers = (data: any) => {
    const vaccineUsers = data.vaccine.buckets.map((bucket: any) => bucket.key);
    const doseUsers = data.dose.buckets.map((bucket: any) => bucket.key);
    return uniq([...vaccineUsers, ...doseUsers]);
};

export const findCompleted = (row: any) => {
    const found = row.status.buckets.find(
        (bucket: any) => bucket.key === "COMPLETED"
    );
    if (found) {
        return found.doc_count;
    }
    return 0;
};

export const findRecord = (data: any, username: string) => {
    let results: any = {
        completedVaccine: 0,
        completedDose: 0,
        doses: 0,
        vaccines: 0,
        total: 0,
        totalCompleted: 0,
    };
    const vaccine = data.vaccine.buckets.find(
        ({ key }: any) => key === username
    );
    const dose = data.dose.buckets.find(({ key }: any) => key === username);

    if (vaccine) {
        results = {
            ...results,
            vaccines: vaccine.doc_count,
            completedVaccine: findCompleted(vaccine),
        };
    }

    if (dose) {
        results = {
            ...results,
            doses: dose.doc_count,
            completedDose: findCompleted(dose),
        };
    }

    results = {
        ...results,
        total: min([results.vaccines, results.doses]),
        totalCompleted: min([results.completedVaccine, results.completedDose]),
    };

    return results;
};
