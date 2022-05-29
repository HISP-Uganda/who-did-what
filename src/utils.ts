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
  // {
  //   name: "ID",
  //   id: "id",
  // },
  {
    name: "Vaccination Card No",
    id: "hDdStedsrHN",
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
  // {
  //   name: "Alternative telephone contact",
  //   id: "SSGgoQ6SnCx",
  // },
  // {
  //   name: "Relationship with alternative contact",
  //   id: "Sqq2zIYWBOK",
  // },
  {
    name: "Address - District and Subcounty",
    id: "Za0xkyQDpxA",
  },
  // {
  //   name: "Address - Parish",
  //   id: "M3trOwAtMqR",
  // },
  // {
  //   name: "Address - Village",
  //   id: "zyhxsh0kFx5",
  // },
  // {
  //   name: "Occupation",
  //   id: "LY2bDXpNvS7",
  // },
  {
    name: "Priority Population Group",
    id: "CFbojfdkIIj",
  },
  // {
  //   name: "Other groups(Specify)",
  //   id: "CVv0CLvLc2i",
  // },
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
    id: "bbnyNYD1wgS",
  },
  {
    name: "Underlying condition",
    id: "bCtWZGjSWM8",
  },

  // {
  //   name: "Underlying condition Other",
  //   id: "dpyQUtizp7s",
  // },
  // {
  //   name: "Immunodeficiency ",
  //   id: "MuZ9dMVXpuM",
  // },
  // {
  //   name: "Cardiovascular Disease",
  //   id: "LNHAYF3qdZl",
  // },
  // {
  //   name: "Chronic Lung Disease",
  //   id: "C0Bony47eKp",
  // },
  // {
  //   name: "Diabetes",
  //   id: "TT1h0vGu5da",
  // },
  // {
  //   name: "Malignancy",
  //   id: "xVxLMku5DMX",
  // },
  // {
  //   name: "Neurological/Neuromuscular",
  //   id: "VCetMtYu1DY",
  // },
  // {
  //   name: "Elsewhere dose place",
  //   id: "AmTw4pWCCaJ",
  // },
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
    id: "rpkH9ZPGJcX",
  },
  // {
  //   name: "Renal Disease",
  //   id: "gW4pd818Sw8",
  // },
  // {
  //   name: "Elsewhere Dose given",
  //   id: "vk2nF6wZwY4",
  // },
  // {
  //   name: "Elsewhere dose outside country facility",
  //   id: "OW3erclrDW8",
  // },
  // {
  //   name: "Elsewhere dose in-country facility",
  //   id: "X7tI86pr1y0",
  // },
  // {
  //   name: "Elsewhere dose date",
  //   id: "lySxMCMSo8Z",
  // },
  {
    name: "Batch Number",
    id: "Yp1F4txx8tm",
  },
  // {
  //   name: "Hypertension",
  //   id: "fTe4Vd3iqkA",
  // },
  {
    name: "Dose Number",
    id: "LUIsbsm3okG",
  },
  {
    name: "Event Status",
    id: "event_status",
  },
  // {
  //   name: "Elsewhere vaccine given",
  //   id: "wwX1eEiYLGR",
  // },
  // {
  //   name: "Client followed up",
  //   id: "uBtXpcAwqMS",
  // },
  // {
  //   name: " Elsewhere dose vaccine batch",
  //   id: "muCgXjnCfnS",
  // },
  // {
  //   name: "Last Dose",
  //   id: "DSOWCIdQ8Tr",
  // },
  // {
  //   name: "Tuberculosis",
  //   id: "ci6y2Y58SoF",
  // },
  // {
  //   name: "Elsewhere dose vaccine manufacturer",
  //   id: "taGJD9hkX0s",
  // },
  // {
  //   name: "Follow up outcome",
  //   id: "DlIdOBkBm3V",
  // },
  // {
  //   name: "Chronic respiratorry conditions",
  //   id: "h1IRhKsNq1N",
  // },
  // {
  //   name: "Total doses",
  //   id: "PamkjF1JUnE",
  // },
  // {
  //   name: "Suggested date for next dose",
  //   id: "FFWcps4MfuH",
  // },
  // {
  //   name: "Self registered",
  //   id: "Bkgeb98v5Ea",
  // },
  // {
  //   name: "Self registered and vaccinated",
  //   id: "Bu7jnTZ6i9m",
  // },
  // {
  //   name: "Elsewhere dose in-country district",
  //   id: "ObwW38YrQHu",
  // },

  // {
  //   name: "Elsewhere dose outside country",
  //   id: "ONsseOxElW9",
  // },
  // {
  //   name: "Other Batch Number ",
  //   id: "cQIgju3IKH7",
  // },
  // {
  //   name: "Elsewhere dose number",
  //   id: "AoHMuBgBlkc",
  // },
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
  let results = {
    completedVaccine: 0,
    completedDose: 0,
    doses: 0,
    vaccines: 0,
    total: 0,
    totalCompleted: 0,
  };
  const vaccine = data.vaccine.buckets.find(({ key }: any) => key === username);
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
