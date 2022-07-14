import { useDataEngine } from "@dhis2/app-runtime";
import axios from "axios";
import { fromPairs } from "lodash";
import { useQuery } from "react-query";
import * as XLSX from "xlsx";
import {
  changeDistricts,
  changeOu,
  changeProgram,
  changeSelectedOu,
  changeTotal,
  changeUserGroups,
  changeUsers,
  setExpandedKeys,
  setLevels,
  setSelected,
  setSelectedLevel,
} from "./Events";

export const api = axios.create({
  // baseURL: "http://localhost:3001/",
  baseURL: "https://services.dhis2.hispuganda.org/",
});
// export const db = new Localbase("facilities");

// export const useInitials = () => {
//   const engine = useDataEngine();
//   const ouQuery = {
//     me: {
//       resource: "me.json",
//       params: {
//         fields: "organisationUnits[id,name,leaf]]",
//       },
//     },
//   };
//   return useQuery<{ facilities: any[]; expandedKeys: string[] }, Error>(
//     ["initial"],
//     async () => {
//       const data = await db.collection("facilities").get();
//       const expandedKeys = await db.collection("expanded").get();
//       const selected = await db.collection("selected").get();
//       if (data.length > 0) {
//         return {
//           facilities: data,
//           expandedKeys: expandedKeys.map((k: any) => k.value),
//         };
//       } else {
//         const {
//           me: { organisationUnits },
//         }: any = await engine.query(ouQuery);
//         const facilities: any[] = organisationUnits.map((unit: any) => {
//           const parent = {
//             id: unit.id,
//             pId: unit.pId || "",
//             value: unit.id,
//             title: unit.name,
//             isLeaf: unit.leaf,
//           };
//           return parent;
//         });
//         const toBeSaved = facilities.map((facility: any) => {
//           return { ...facility, _key: facility.id };
//         });
//         setSelected(organisationUnits.map((ou: any) => ou.id));
//         db.collection("facilities").set(toBeSaved, { keys: true });
//         db.collection("selected").set(toBeSaved, { keys: true });
//         return { facilities, expandedKeys: [] };
//       }
//     }
//   );
// };

export function useLoader() {
  const engine = useDataEngine();
  const query = {
    districts: {
      resource: "organisationUnits.json",
      params: {
        fields: "id,name",
        paging: false,
        level: 3,
      },
    },
    users: {
      resource: "users",
      params: {
        userOrgUnits: "true",
        fields: "phoneNumber,displayName,userCredentials[username]",
        includeChildren: "true",
        paging: "false",
      },
    },
    levels: {
      resource: "organisationUnitLevels",
      params: {
        fields: "id,name,level",
      },
    },
  };
  const ouQuery = {
    me: {
      resource: "me.json",
      params: {
        fields: "organisationUnits[id,name,leaf,level],userGroups",
      },
    },
  };
  return useQuery<any, Error>("initial", async () => {
    // const data = await db.collection("facilities").get();
    // const expandedKeys = await db.collection("expanded").get();
    // const selected = await db.collection("selected").get();
    // const facility = await db.collection("facility").get();
    // if (data.length > 0) {
    // changeOu(data);
    // setExpandedKeys(expandedKeys.map((k: any) => k.value));
    // if (selected.length > 0) {
    //   setSelected(selected);
    // }
    // if (selectedLocation.length > 0) {
    //   changeSelectedOu(selectedLocation[0]);
    // }
    // } else {
    const {
      me: { organisationUnits, userGroups },
    }: any = await engine.query(ouQuery);
    const facilities: any[] = organisationUnits.map((unit: any) => {
      return {
        id: unit.id,
        pId: unit.pId || "",
        key: unit.id,
        value: unit.id,
        title: unit.name,
        isLeaf: unit.leaf,
      };
    });
    const {
      districts: { organisationUnits: ds },
      users: { users },
      levels: { organisationUnitLevels },
    }: any = await engine.query(query);
    // await db.collection("facility").set(
    //   facilities.map((f) => {
    //     return { ...f, _key: f.value };
    //   }),
    //   { keys: true }
    // );
    // await db.collection("facilities").set(
    //   facilities.map((f) => {
    //     return { ...f, _key: f.value };
    //   }),
    //   { keys: true }
    // );
    // await db.collection("selected").set(
    //   facilities.map(
    //     (f) => {
    //       return { ...f, _key: f.value };
    //     },
    //     { keys: true }
    //   )
    // );
    changeUserGroups(userGroups.map((group: any) => group.id));
    changeOu(facilities);
    changeSelectedOu(facilities[0]);
    setSelected(facilities.map((v) => v.id));
    setExpandedKeys([]);
    setLevels(organisationUnitLevels);
    setSelectedLevel(organisationUnits[0].level);
    // }

    const allUsers = users.map((u: any) => [
      u.userCredentials.username,
      { displayName: u.displayName, phoneNumber: u.phoneNumber },
    ]);
    changeDistricts(fromPairs(ds.map((d: any) => [d.id, d.name])));
    changeUsers(fromPairs(allUsers));
    // changeTypes({ programs, dataSets, organisationUnits });
    return true;
  });
}

export function useDoses(organisationUnits: string[]) {
  return useQuery<any, Error>(["es-doses", ...organisationUnits], async () => {
    let must: any[] = [
      {
        bool: {
          should: [
            { terms: { "path.national": organisationUnits } },
            { terms: { "path.region": organisationUnits } },
            { terms: { "path.district": organisationUnits } },
            { terms: { "path.subcounty": organisationUnits } },
            { terms: { "path.facility": organisationUnits } },
          ],
        },
      },
      { terms: { status: ["active", "completed"] } },
      {
        match: {
          deleted: false,
        },
      },
      {
        exists: {
          field: "dose",
        },
      },
      {
        exists: {
          field: "vaccine",
        },
      },
    ];
    const query = {
      index: "programstageinstance",
      query: {
        bool: {
          must,
        },
      },
      aggs: {
        summary: {
          terms: {
            field: "dose.keyword",
            size: 10000,
          },
        },
      },
    };
    const { data }: any = await api.post("wal", query);
    return data;
  });
}

export function useOU(organisationUnit: string) {
  const engine = useDataEngine();
  return useQuery<any, Error>(["unit", organisationUnit], async () => {
    const {
      ou: { name },
    }: any = await engine.query({
      ou: {
        resource: `organisationUnits/${organisationUnit}.json`,
        params: {
          fields: "name",
        },
      },
    });
    return name;
  });
}

export function useDashboard(ou: string) {
  const engine = useDataEngine();
  let query: any = {
    campaign: {
      resource: `sqlViews/PgPX6SXZmzV/data?var=parent:${ou}&paging=false`,
    },
    daily: {
      resource: `sqlViews/s5bKRhYXFCJ/data?var=parent:${ou}&paging=false`,
    },
  };
  // const lowerUnits = organisationUnits.map((u: any) => {
  //   console.log(u);
  //   return u.value.toLowerCase();
  // });

  let must: any[] = [
    // {
    //   bool: {
    //     should: [
    //       { terms: { "path.national": lowerUnits } },
    //       { terms: { "path.region": lowerUnits } },
    //       { terms: { "path.district": lowerUnits } },
    //       { terms: { "path.subcounty": lowerUnits } },
    //       { terms: { "path.facility": lowerUnits } },
    //     ],
    //   },
    // },
    { terms: { status: ["active", "completed"] } },
    {
      match: {
        deleted: false,
      },
    },
    {
      exists: {
        field: "dose",
      },
    },
    {
      exists: {
        field: "vaccine",
      },
    },
  ];

  const otherQuery = {
    index: "programstageinstance",
    query: {
      bool: {
        must,
      },
    },
    aggs: {
      summary: {
        terms: {
          field: "dose.keyword",
          size: 10000,
        },
      },
    },
  };

  return useQuery<any, Error>(
    ["query", ou],
    async () => {
      if (ou) {
        const [
          {
            campaign: {
              listGrid: { rows: cRows },
            },
            daily: {
              listGrid: { rows: dRows },
            },
          },
          {
            data: { summary },
          },
        ]: any[] = await Promise.all([
          engine.query(query),
          api.post("wal", otherQuery),
        ]);
        const campaignData = fromPairs(cRows);
        const dailyData = fromPairs(dRows);
        return {
          individual: fromPairs(
            summary.buckets.map((b: any) => [b.key, b.doc_count])
          ),
          campaignData,
          dailyData,
        };
      }
      return { individual: {}, campaignData: {}, dailyData: {} };
    },
    {
      refetchInterval: 1000 * 10,
    }
  );
}

export function useDistricts(
  organisationUnits: string[],
  startDate = "",
  endDate = "",
  username = "",
  level = ""
) {
  return useQuery<any, Error>(
    [
      "district-summaries",
      startDate,
      endDate,
      username,
      ...organisationUnits,
      level,
    ],
    async () => {
      if (startDate && endDate) {
        let must: any[] = [
          {
            bool: {
              should: [
                {
                  range: {
                    LUIsbsm3okG_created: {
                      lte: endDate,
                      gte: startDate,
                    },
                  },
                },
                {
                  range: {
                    bbnyNYD1wgS_created: {
                      lte: endDate,
                      gte: startDate,
                    },
                  },
                },
              ],
            },
          },
          {
            bool: {
              should: [
                { terms: { event_level1: organisationUnits } },
                { terms: { event_level2: organisationUnits } },
                { terms: { event_level3: organisationUnits } },
                { terms: { event_level4: organisationUnits } },
                { terms: { event_level5: organisationUnits } },
              ],
            },
          },
          {
            exists: {
              field: "bbnyNYD1wgS",
            },
          },
          {
            exists: {
              field: "LUIsbsm3okG",
            },
          },
          { terms: { event_status: ["active", "completed"] } },
        ];

        if (username) {
          must = [
            ...must,
            {
              match: {
                bbnyNYD1wgS_created_by: String(username).toLowerCase(),
              },
            },
            {
              match: {
                LUIsbsm3okG_created_by: String(username).toLowerCase(),
              },
            },
            {
              match: {
                same_user: true,
              },
            },
          ];
        }

        const query = {
          index: "epivac",
          query: {
            bool: {
              must,
            },
          },
          aggs: {
            summary: {
              terms: {
                field: `event_level${level}.keyword`,
                size: 10000,
              },
              aggs: {
                status: {
                  terms: {
                    field: "event_status.keyword",
                  },
                },
              },
            },
          },
        };
        const { data }: any = await api.post("wal", query);
        return data;
      }
      return { summary: { buckets: [] } };
    }
  );
}

export async function downloadDetails(
  organisationUnits: string[],
  selectedDates: [string, string] | undefined,
  username = ""
) {
  let must: any[] = [
    {
      match: {
        event_deleted: false,
      },
    },
    {
      match: {
        tei_deleted: false,
      },
    },
    {
      match: {
        pi_deleted: false,
      },
    },
  ];
  let facilityQuery: any = { match_all: {} };
  if (selectedDates) {
    must = [
      ...must,
      {
        range: {
          event_last_updated: {
            gte: selectedDates[0],
            lte: selectedDates[1],
          },
        },
      },
    ];
  }
  if (organisationUnits && organisationUnits.length > 0) {
    must = [
      ...must,
      {
        bool: {
          should: [
            { terms: { event_level1: organisationUnits } },
            { terms: { event_level2: organisationUnits } },
            { terms: { event_level3: organisationUnits } },
            { terms: { event_level4: organisationUnits } },
            { terms: { event_level5: organisationUnits } },
          ],
        },
      },
    ];
    facilityQuery = {
      bool: {
        should: [
          { terms: { countryId: organisationUnits } },
          { terms: { regionId: organisationUnits } },
          { terms: { districtId: organisationUnits } },
          { terms: { subCountyId: organisationUnits } },
          { terms: { id: organisationUnits } },
        ],
      },
    };
  }

  if (username) {
    must = [
      ...must,
      {
        multi_match: {
          query: String(username).toLowerCase(),
        },
      },
    ];
  }
  const query = {
    index: "epivac",
    sort: [
      {
        event_last_updated: {
          order: "asc",
          format: "strict_date_optional_time_nanos",
          numeric_type: "date_nanos",
        },
      },
    ],
    query: {
      bool: {
        must,
      },
    },
  };

  const unitQuery = {
    index: "facilities",
    size: 10000,
    query: facilityQuery,
  };
  let { data }: any = await api.post("wal/scroll", query);
  let {
    data: {
      hits: { hits: facilities },
    },
  } = await api.post("wal/search", unitQuery);
  facilities = facilities.map((f: any) => f._source);

  const allRecords = data.map((_source: any) => {
    const facility = facilities.find((f: any) => {
      return (
        [f.countryId, f.regionId, f.districtId, f.subCountyId, f.id].indexOf(
          _source.regorgunit
        ) !== -1
      );
    });

    if (facility) {
      _source = {
        ..._source,
        regorgunitname: [
          facility.districtName,
          facility.subCountyName,
          facility.name,
        ].join("/"),
      };
    }
    const eventFacility = facilities.find((f: any) => {
      return (
        [f.countryId, f.regionId, f.districtId, f.subCountyId, f.id].indexOf(
          _source.orgunit
        ) !== -1
      );
    });

    if (eventFacility) {
      _source = {
        ..._source,
        orgunitname: [
          eventFacility.districtName,
          eventFacility.subCountyName,
          eventFacility.name,
        ].join("/"),
      };
    }
    return _source;
  });
  return allRecords;
}

export function useWhoDidWhat(
  organisationUnits: string[],
  page = 1,
  pageSize = 20,
  selectedDates: [string, string] | undefined,
  username = ""
) {
  return useQuery<any, Error>(
    [
      "who-did-what",
      ...organisationUnits,
      selectedDates,
      username,
      page,
      pageSize,
    ],
    async () => {
      let must: any[] = [
        {
          match: {
            event_deleted: false,
          },
        },
        {
          match: {
            tei_deleted: false,
          },
        },
        {
          match: {
            pi_deleted: false,
          },
        },
      ];
      let facilityQuery: any = { match_all: {} };
      if (selectedDates) {
        must = [
          ...must,
          {
            range: {
              event_last_updated: {
                gte: selectedDates[0],
                lte: selectedDates[1],
              },
            },
          },
        ];
      }
      if (organisationUnits && organisationUnits.length > 0) {
        must = [
          ...must,
          {
            bool: {
              should: [
                { terms: { event_level1: organisationUnits } },
                { terms: { event_level2: organisationUnits } },
                { terms: { event_level3: organisationUnits } },
                { terms: { event_level4: organisationUnits } },
                { terms: { event_level5: organisationUnits } },
              ],
            },
          },
        ];
        facilityQuery = {
          bool: {
            should: [
              { terms: { countryId: organisationUnits } },
              { terms: { regionId: organisationUnits } },
              { terms: { districtId: organisationUnits } },
              { terms: { subCountyId: organisationUnits } },
              { terms: { id: organisationUnits } },
            ],
          },
        };
      }

      if (username) {
        must = [
          ...must,
          {
            multi_match: {
              query: String(username).toLowerCase(),
            },
          },
        ];
      }
      const query = {
        index: "epivac",
        track_total_hits: true,
        from: (page - 1) * pageSize,
        size: pageSize,
        sort: [
          {
            event_last_updated: {
              order: "asc",
              format: "strict_date_optional_time_nanos",
              numeric_type: "date_nanos",
            },
          },
        ],
        query: {
          bool: {
            must,
          },
        },
      };

      const unitQuery = {
        index: "facilities",
        size: 10000,
        query: facilityQuery,
      };
      let {
        data: {
          hits: {
            total: { value },
            hits: records,
          },
        },
      }: any = await api.post("wal/search", query);
      let {
        data: {
          hits: { hits: facilities },
        },
      } = await api.post("wal/search", unitQuery);
      facilities = facilities.map((f: any) => f._source);

      const allRecords = records.map(({ _source }: any) => {
        const facility = facilities.find((f: any) => {
          return (
            [
              f.countryId,
              f.regionId,
              f.districtId,
              f.subCountyId,
              f.id,
            ].indexOf(_source.regorgunit) !== -1
          );
        });

        if (facility) {
          _source = {
            ..._source,
            regorgunitname: [
              facility.districtName,
              facility.subCountyName,
              facility.name,
            ].join("/"),
          };
        }
        const eventFacility = facilities.find((f: any) => {
          return (
            [
              f.countryId,
              f.regionId,
              f.districtId,
              f.subCountyId,
              f.id,
            ].indexOf(_source.orgunit) !== -1
          );
        });

        if (eventFacility) {
          _source = {
            ..._source,
            orgunitname: [
              eventFacility.districtName,
              eventFacility.subCountyName,
              eventFacility.name,
            ].join("/"),
          };
        }
        return _source;
      });
      return { allRecords, total: value };
    }
  );
}

export function useEs(
  q: string = "",
  startDate = "",
  endDate = "",
  organisationUnits: string[]
) {
  return useQuery<any, Error>(
    ["es", q, startDate, endDate, ...organisationUnits],
    async () => {
      if (startDate && endDate) {
        let must: any[] = [
          {
            bool: {
              should: [
                {
                  range: {
                    LUIsbsm3okG_created: {
                      lte: endDate,
                      gte: startDate,
                    },
                  },
                },
                {
                  range: {
                    bbnyNYD1wgS_created: {
                      lte: endDate,
                      gte: startDate,
                    },
                  },
                },
              ],
            },
          },
          {
            bool: {
              should: [
                { terms: { event_level1: organisationUnits } },
                { terms: { event_level2: organisationUnits } },
                { terms: { event_level3: organisationUnits } },
                { terms: { event_level4: organisationUnits } },
                { terms: { event_level5: organisationUnits } },
              ],
            },
          },
          { terms: { event_status: ["active", "completed"] } },
          {
            match: {
              same_user: true,
            },
          },
          {
            exists: {
              field: "bbnyNYD1wgS",
            },
          },
          {
            exists: {
              field: "LUIsbsm3okG",
            },
          },
        ];
        if (q) {
          must = [
            ...must,
            {
              match: {
                bbnyNYD1wgS_created_by: String(q).toLowerCase(),
              },
            },
            {
              match: {
                LUIsbsm3okG_created_by: String(q).toLowerCase(),
              },
            },
          ];
        }
        const query = {
          index: "epivac",
          query: {
            bool: {
              must,
            },
          },
          aggs: {
            summary: {
              terms: {
                field: "bbnyNYD1wgS_created_by.keyword",
                size: 10000,
              },
              aggs: {
                status: {
                  terms: {
                    field: "event_status.keyword",
                  },
                },
              },
            },
          },
        };
        const { data }: any = await api.post("wal", query);
        return data;
      }
      return { summary: { buckets: [] } };
    }
  );
}

export function useProgram(programId: string) {
  const engine = useDataEngine();
  const query = {
    program: {
      resource: `programs/${programId}.json`,
      params: {
        paging: false,
        fields:
          "id,name,programTrackedEntityAttributes[id,trackedEntityAttribute[id,name]],programType,trackedEntityType,programStages[id,name,programStageDataElements[id,dataElement[id,name]]]",
      },
    },
  };
  return useQuery<any, Error>(["program", programId], async () => {
    const { program }: any = await engine.query(query);
    changeProgram(program);
    return true;
  });
}

export async function fetchSqlView(sqlViewId: string) {
  const engine = useDataEngine();
  const query = {
    data: {
      resource: `sqlViews/${sqlViewId}/data`,
      params: {
        paging: false,
      },
    },
  };
  const { data }: any = await engine.query(query);
  return data;
}

export function useSQLView(
  page = 1,
  pageSize = 10,
  sqlView: string,
  startDate = "",
  endDate = "",
  organisations: string[] = [],
  username: string = ""
) {
  const engine = useDataEngine();
  return useQuery<any, Error>(
    ["users", sqlView, page, pageSize, startDate, endDate, username],
    async () => {
      if (startDate && endDate) {
        const queries = [
          `var=start:${startDate}`,
          `var=end:${endDate}`,
          `var=units:${organisations.map((o: any) => o.id).join("-")}`,
          `var=username:${username === "" ? " " : username}`,
          `page=${page}`,
          `pageSize=${pageSize}`,
        ].join("&");

        const sqlViewQuery = {
          data: {
            resource: `sqlViews/${sqlView}/data?${queries}`,
          },
        };
        const { data }: any = await engine.query(sqlViewQuery);
        const {
          pager: { total },
        } = data;
        changeTotal({ [sqlView]: total });
        return data;
      }
      return { listGrid: { rows: [] } };
    }
  );
}

export async function download(
  sqlView: string,
  startDate = "",
  endDate = "",
  organisations: string[] = [],
  username: string = ""
) {
  const engine = useDataEngine();
  const queries = [
    `var=start:${startDate}`,
    `var=end:${endDate}`,
    `var=units:${organisations.map((o: any) => o.id).join("-")}`,
    `var=username:${username === "" ? " " : username}`,
    `paging=false`,
  ].join("&");

  const sqlViewQuery = {
    data: {
      resource: `sqlViews/${sqlView}/data?${queries}`,
    },
  };
  const {
    data: {
      listGrid: { rows, headers },
    },
  }: any = await engine.query(sqlViewQuery);

  const all = [headers.map((h: any) => h.name), ...rows];
  const sheetName = "Events";
  const filename = `Events-${organisations.join("-")}-${startDate}-${endDate}`;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(all);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function useSqlViewOus(startDate = "", endDate = "") {
  const engine = useDataEngine();

  let params: any = {
    fields: "id,name",
    paging: "false",
    level: 3,
  };
  const queries = [`var=start:${startDate}`, `var=end:${endDate}`].join("&");

  const queryString = {
    units: {
      resource: `organisationUnits.json`,
      params,
    },
    events: { resource: `sqlViews/kbc1rIMGkJb/data?${queries}` },
    enrollments: { resource: `sqlViews/kVTqe77I6oC/data?${queries}` },
  };
  return useQuery<any, Error>(
    ["count by organisations", startDate, endDate],
    async () => {
      const {
        units: { organisationUnits },
        events: {
          listGrid: { rows: events },
        },
        enrollments: {
          listGrid: { rows: enrollments },
        },
      }: any = await engine.query(queryString);

      return { events };
    }
  );
}

export function useTEA(program: string, attribute: string, value: string) {
  const engine = useDataEngine();
  const query = {
    instances: {
      resource: `trackedEntityInstances.json`,
      params: {
        paging: false,
        ouMode: "ALL",
        program,
        filter: `${attribute}:eq:${value}`,
      },
    },
  };
  return useQuery<any, Error>(
    ["instances", program, attribute, value],
    async () => {
      const {
        instances: { trackedEntityInstances },
      }: any = await engine.query(query);
      return trackedEntityInstances.map((tei: any) => {
        return tei.attributes.find((a: any) => a.attribute === attribute);
      });
    },
    {
      enabled: !!program && !!attribute && !!value,
    }
  );
}

export function useTEI(program: string, value: string) {
  const engine = useDataEngine();
  const query = {
    instance: {
      resource: `trackedEntityInstances/${value}.json`,
      params: {
        ouMode: "ALL",
        program,
      },
    },
  };
  return useQuery<any, Error>(
    ["instances", program, value],
    async () => {
      try {
        const { instance }: any = await engine.query(query);
        return instance;
      } catch (error) {
        return "Nothing found";
      }
    },
    {
      enabled: !!program && !!value,
    }
  );
}
