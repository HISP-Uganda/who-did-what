import { fromPairs } from "lodash";
import { useQuery } from "react-query";
import { changeTotal } from "./Events";
import { enrollmentCounts, eventCounts } from "./utils";

export function useLoader(d2: any) {
  const api = d2.Api.getApi();
  return useQuery<any, Error>("sqlViews", async () => {
    await api.post('metadata', { sqlViews: [enrollmentCounts] });
    return true
  });
}

export async function fetchSqlView(d2: any, sqlViewId: string) {
  const api = d2.Api.getApi();
  return await api.get(`sqlViews/${sqlViewId}/data`, { paging: false });
}

export function useEnrollmentCount(d2: any, page = 1, pageSize = 10, query = "", startDate = "", endDate = "") {
  return useQuery<any, Error>(["users", page, pageSize, query, startDate, endDate], async () => {
    const api = d2.Api.getApi();
    let params: any = { fields: 'phoneNumber,displayName,userCredentials[username,created,lastLogin,createdBy[displayName],lastUpdatedBy[displayName]]', page, pageSize };
    if (query) {
      params = { ...params, query }
    }
    const { users, pager } = await api.get('users', params);
    const { total } = pager
    changeTotal(total);
    if (users.length > 0) {
      const usernames = users.map((u: any) => `'${u.userCredentials.username}'`).join(',');
      await api.post('metadata', { sqlViews: [enrollmentCounts(usernames, startDate, endDate), eventCounts(usernames, startDate, endDate)] })
      const [{ listGrid: { rows: enrollments } }, { listGrid: { rows: events } }] = await Promise.all([fetchSqlView(d2, 'kIEqe77I6oC'), fetchSqlView(d2, 'kCt1rIMGkJb')]);
      const groupedEnrollment = fromPairs(enrollments);
      const groupedEvents = fromPairs(events);
      return users.map((u: any) => {
        let currentUser = u;
        const userEnrollments = groupedEnrollment[u.userCredentials.username];
        const userEvents = groupedEvents[u.userCredentials.username];
        if (userEnrollments) {
          currentUser = { ...currentUser, enrollments: userEnrollments }
        } else {
          currentUser = { ...currentUser, enrollments: 0 }
        }
        if (userEvents) {
          currentUser = { ...currentUser, events: userEvents }
        } else {
          currentUser = { ...currentUser, events: 0 }
        }
        return currentUser
      })
    }
    return users
  });
}


export function useProgram(d2: any) {
  return useQuery<any, Error>(["programs"], async () => {
    const api = d2.Api.getApi();
    const params = { fields: 'id,name', paging: false };
    const { programs } = await api.get('programs', params);
    return programs;
  });
}

export function useTrackedEntityType(d2: any) {
  return useQuery<any, Error>(["trackedEntityTypes"], async () => {
    const api = d2.Api.getApi();
    const params = { fields: 'id,name', paging: false };
    const { trackedEntityTypes } = await api.get('trackedEntityTypes', params);
    return trackedEntityTypes;
  });
}

export function useUserOrgUnit(d2: any) {
  return useQuery<any, Error>("userOrganisations", async () => {
    const units = await d2.currentUser.getOrganisationUnits();
    return units.toArray().map((unit: any) => {
      return {
        id: unit.id,
        pId: unit.pId || "",
        value: unit.id,
        title: unit.name,
        isLeaf: unit.leaf,
      };
    });
  });
}