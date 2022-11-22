const { fromPairs } = require("lodash");

const axios = require("axios");
const XLSX = require("xlsx");

const columns = [
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
    id: "regorgunit",
  },
  {
    name: "Vaccination facility",
    id: "orgUnitName",
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

const realColumns = columns.map((column) => column.id).join(",");

const availableColumns = fromPairs(
  columns.map((column) => [column.id, column.name])
);

const api = axios.create({
  baseURL: "https://services.dhis2.hispuganda.org/",
});
async function useSQL() {
  const query = {
    body: {
      query: `select COUNT(*) from epivac`,
      filter: {
        term: {
          "sB1IHYu2xQT.keyword": "unknown unknown",
        },
      },
    },
  };

  let {
    data: {
      body: { rows: allRows, columns, cursor: currentCursor },
    },
  } = await api.post("wal/sql", query);

  if (currentCursor) {
    do {
      let {
        data: {
          body: { rows, cursor },
        },
      } = await api.post("wal/sql", { body: { cursor: currentCursor } });
      allRows = [...allRows, ...rows];
      currentCursor = cursor;
    } while (!!currentCursor);
  }
  const all = [columns.map((h) => availableColumns[h.name]), ...allRows];
  const sheetName = "Events";
  const filename = "Without.xlsx";
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(all);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

useSQL().then(() => console.log("Done"));
