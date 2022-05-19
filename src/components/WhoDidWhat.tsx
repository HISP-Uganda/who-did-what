import { Button, Input, Spacer, Spinner, Stack } from "@chakra-ui/react";
import { DatePicker } from "antd";
import "antd/dist/antd.css";
import { useStore } from "effector-react";
import { get } from "lodash";
import moment from "moment";
import * as XLSX from "xlsx";
import { ChangeEvent, useState } from "react";
import { setSelected } from "../Events";
import { useWhoDidWhat } from "../Queries";
import { $store } from "../Store";
import { columns } from "../utils";
import DetailsTable from "./DetailsTable";
import OrgUnitTree from "./OrgUnitTree";

const { RangePicker } = DatePicker;

const WhoDidWhat = () => {
  const store = useStore($store);
  const [date, setDate] = useState<[any, any]>([
    moment("2022-04-01"),
    moment(),
  ]);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [orgUnits, setCurrentOrgUnits] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<[string, string]>([
    null,
    null,
  ]);
  const [query, setQuery] = useState<string>("data.spt");
  const [q, setQ] = useState<string>("data.spt");

  const changeSearch = () => {
    setQuery(q);
    setCurrentOrgUnits(
      store.selected.map((v: any) => String(v.value).toLowerCase())
    );
    setSelectedDate([
      date[0].format("YYYY-MM-DD"),
      date[1].format("YYYY-MM-DD"),
    ]);
  };

  const downloadEvents = async () => {
    changeSearch();
    setDownloading(true);
    const all = [
      columns.map((c) => c.name),
      ...data.map((r: any) => {
        return columns.map((c) => get(r, c.id, ""));
      }),
    ];
    const sheetName = "Details";
    const filename = `Details-${orgUnits.join("-")}.xlsx`;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(all);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
    setDownloading(false);
  };

  const setOrgUnits = (values: any[]) => {
    setSelected(values);
  };
  const { isLoading, isSuccess, isError, data, error } = useWhoDidWhat(
    orgUnits,
    selectedDate[0],
    selectedDate[1],
    query
  );

  return (
    <Stack p="20px">
      <Stack direction="row">
        <Input
          placeholder="Search by User Name"
          w={350}
          value={q}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        />
        <RangePicker size="large" value={date} onChange={setDate} />
        <OrgUnitTree
          value={store.selected}
          onChange={setOrgUnits}
          expandedKeys={store.expandedKeys}
          initial={store.organisationUnits}
        />
        <Button colorScheme="blue" onClick={changeSearch} isLoading={isLoading}>
          Submit
        </Button>
        <Spacer />
        <Button
          colorScheme="blue"
          onClick={downloadEvents}
          isLoading={downloading}
        >
          Download
        </Button>
      </Stack>
      {isLoading && <Spinner />}
      {isSuccess && <DetailsTable data={data} />}
      {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}
    </Stack>
  );
};

export default WhoDidWhat;
