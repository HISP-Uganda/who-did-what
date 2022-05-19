import { useDataEngine } from "@dhis2/app-runtime";
import { fromPairs, isEmpty } from "lodash";
import { useQuery } from "react-query";
import axios from "axios";
import * as XLSX from "xlsx";
import Localbase from "localbase";
import {
  changeDistricts,
  changeOu,
  changeProgram,
  changeTotal,
  changeTypes,
  changeUsers,
  setExpandedKeys,
  setSelected,
} from "./Events";

export const api = axios.create({
  // baseURL: "http://localhost:3001/",
  baseURL: "https://services.dhis2.hispuganda.org/",
});
export const db = new Localbase("epivac");

export const useInitials = () => {
  const engine = useDataEngine();
  const ouQuery = {
    me: {
      resource: "me.json",
      params: {
        fields: "organisationUnits[id,name,leaf]]",
      },
    },
  };
  return useQuery<{ facilities: any[]; expandedKeys: string[] }, Error>(
    ["initial"],
    async () => {
      const data = await db.collection("facilities").get();
      const expandedKeys = await db.collection("expanded").get();
      if (data.length > 0) {
        return {
          facilities: data,
          expandedKeys: expandedKeys.map((k: any) => k.value),
        };
      } else {
        const {
          me: { organisationUnits },
        }: any = await engine.query(ouQuery);
        const facilities: any[] = organisationUnits.map((unit: any) => {
          const parent = {
            id: unit.id,
            pId: unit.pId || "",
            value: unit.id,
            title: unit.name,
            isLeaf: unit.leaf,
          };
          return parent;
        });
        const toBeSaved = facilities.map((facility: any) => {
          return { ...facility, _key: facility.id };
        });
        db.collection("facilities").set(toBeSaved, { keys: true });
        return { facilities, expandedKeys: [] };
      }
    }
  );
};

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
  };
  const ouQuery = {
    me: {
      resource: "me.json",
      params: {
        fields: "organisationUnits[id,name,leaf]",
      },
    },
  };
  return useQuery<any, Error>("initial", async () => {
    const data = await db.collection("facilities").get();
    const expandedKeys = await db.collection("expanded").get();
    if (data.length > 0) {
      changeOu(data);
      setExpandedKeys(expandedKeys.map((k: any) => k.value));
    } else {
      const {
        me: { organisationUnits },
      }: any = await engine.query(ouQuery);
      const facilities: any[] = organisationUnits.map((unit: any) => {
        const parent = {
          id: unit.id,
          pId: unit.pId || "",
          value: unit.id,
          title: unit.name,
          isLeaf: unit.leaf,
        };
        return parent;
      });
      const toBeSaved = facilities.map((facility: any) => {
        return { ...facility, _key: facility.id };
      });
      db.collection("facilities").set(toBeSaved, { keys: true });
      changeOu(facilities);
      setSelected(facilities);
      setExpandedKeys([]);
    }
    const {
      districts: { organisationUnits: ds },
      users: { users },
    }: any = await engine.query(query);
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

export function useDashboard(organisationUnits: string[]) {
  const engine = useDataEngine();
  let query: any = {
    campaign: {
      resource: `sqlViews/PgPX6SXZmzV/data?var=parent:${organisationUnits[0]}&paging=false`,
    },
    daily: {
      resource: `sqlViews/s5bKRhYXFCJ/data?var=parent:${organisationUnits[0]}&paging=false`,
    },
  };

  const lowerUnits = organisationUnits.map((u) => u.toLowerCase());

  let must: any[] = [
    {
      bool: {
        should: [
          { terms: { "path.national": lowerUnits } },
          { terms: { "path.region": lowerUnits } },
          { terms: { "path.district": lowerUnits } },
          { terms: { "path.subcounty": lowerUnits } },
          { terms: { "path.facility": lowerUnits } },
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
    ["query"],
    async () => {
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
  username = ""
) {
  return useQuery<any, Error>(
    ["es", startDate, endDate, username],
    async () => {
      if (startDate && endDate) {
        let must: any[] = [
          {
            range: {
              created: {
                lte: endDate,
                gte: startDate,
              },
            },
          },
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

        if (username) {
          must = [
            ...must,
            {
              match: {
                storedby: String(username).toLowerCase(),
              },
            },
          ];
        }

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
                field: "path.district.keyword",
                size: 10000,
              },
              aggs: {
                status: {
                  terms: {
                    field: "status.keyword",
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

export function useWhoDidWhat(
  organisationUnits: string[],
  startDate = "",
  endDate = "",
  username = ""
) {
  console.log(organisationUnits);
  return useQuery<any, Error>(
    ["who-did-what", ...organisationUnits, startDate, endDate, username],
    async () => {
      if (startDate && endDate && organisationUnits.length > 0) {
        let must: any[] = [
          {
            range: {
              "event.created": {
                gte: startDate,
                lte: endDate,
                time_zone: "+03:00",
              },
            },
          },
          {
            bool: {
              should: [
                { terms: { "event.level1": organisationUnits } },
                { terms: { "event.level2": organisationUnits } },
                { terms: { "event.level3": organisationUnits } },
                { terms: { "event.level4": organisationUnits } },
                { terms: { "event.level5": organisationUnits } },
              ],
            },
          },
          // { terms: { "event.status": ["active", "completed"] } },
          // {
          //   match: {
          //     "event.deleted": false,
          //   },
          // },
          // {
          //   exists: {
          //     field: "dose",
          //   },
          // },
          // {
          //   exists: {
          //     field: "vaccine",
          //   },
          // },
        ];

        if (username) {
          must = [
            ...must,
            {
              match: {
                "event.storedby": String(username).toLowerCase(),
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
        };

        const unitQuery = {
          index: "facilities",
          size: 10000,
          query: {
            bool: {
              should: [
                { terms: { countryId: organisationUnits } },
                { terms: { regionId: organisationUnits } },
                { terms: { districtId: organisationUnits } },
                { terms: { subCountyId: organisationUnits } },
                { terms: { id: organisationUnits } },
              ],
            },
          },
        };
        let { data }: any = await api.post("wal/scroll", query);
        let {
          data: {
            hits: { hits: facilities },
          },
        } = await api.post("wal/search", unitQuery);
        facilities = facilities.map((f: any) => f._source);
        console.log(facilities);
        data = data.map(({ tei, event, ...others }: any) => {
          if (tei) {
            const facility = facilities.find((f: any) => {
              return (
                [
                  f.countryId,
                  f.regionId,
                  f.districtId,
                  f.subCountyId,
                  f.id,
                ].indexOf(tei.regorgunit) !== -1
              );
            });

            if (facility) {
              tei = {
                ...tei,
                regorgunitname: [
                  // facility.countryName,
                  // facility.regionName,
                  facility.districtName,
                  facility.subCountyName,
                  facility.name,
                ].join("/"),
              };
            }
          }
          if (event) {
            const facility = facilities.find((f: any) => {
              return (
                [
                  f.countryId,
                  f.regionId,
                  f.districtId,
                  f.subCountyId,
                  f.id,
                ].indexOf(event.orgunit) !== -1
              );
            });

            if (facility) {
              event = {
                ...event,
                orgunitname: [
                  // facility.countryName,
                  // facility.regionName,
                  facility.districtName,
                  facility.subCountyName,
                  facility.name,
                ].join("/"),
              };
            }
          }

          return { ...others, event, tei };
        });
        return data;
      } else {
        return [];
      }
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
                    "LUIsbsm3okG.created": {
                      lte: endDate,
                      gte: startDate,
                    },
                  },
                },
                {
                  range: {
                    "bbnyNYD1wgS.created": {
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
                { terms: { "event.level1": organisationUnits } },
                { terms: { "event.level2": organisationUnits } },
                { terms: { "event.level3": organisationUnits } },
                { terms: { "event.level4": organisationUnits } },
                { terms: { "event.level5": organisationUnits } },
              ],
            },
          },
          { terms: { "event.status": ["active", "completed"] } },
          {
            match: {
              "event.deleted": false,
            },
          },
          {
            exists: {
              field: "bbnyNYD1wgS.value",
            },
          },
          {
            exists: {
              field: "LUIsbsm3okG.value",
            },
          },
        ];
        if (q) {
          must = [
            ...must,
            {
              match: {
                "LUIsbsm3okG.createdByUserInfo.username":
                  String(q).toLowerCase(),
              },
            },
            {
              match: {
                "bbnyNYD1wgS.createdByUserInfo.username":
                  String(q).toLowerCase(),
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
            dose: {
              terms: {
                field: "LUIsbsm3okG.createdByUserInfo.username.keyword",
                size: 10000,
              },
              aggs: {
                status: {
                  terms: {
                    field: "event.status.keyword",
                  },
                },
              },
            },
            vaccine: {
              terms: {
                field: "bbnyNYD1wgS.createdByUserInfo.username.keyword",
                size: 10000,
              },
              aggs: {
                status: {
                  terms: {
                    field: "event.status.keyword",
                  },
                },
              },
            },
          },
        };
        const { data }: any = await api.post("wal", query);
        return data;
      }
      return { vaccine: { buckets: [] }, dose: { buckets: [] } };
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
