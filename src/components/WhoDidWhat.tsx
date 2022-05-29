import { Button, Input, Spacer, Spinner, Stack } from "@chakra-ui/react";
import { DatePicker } from "antd";
import * as XLSX from "xlsx";
import "antd/dist/antd.css";
import { useStore } from "effector-react";
import moment from "moment";
import { ChangeEvent, useState } from "react";
import { setSelected } from "../Events";
import { useWhoDidWhat, downloadDetails } from "../Queries";
import { $canDownload, $pagination, $store } from "../Store";
import DetailsTable from "./DetailsTable";
import OrgUnitTree from "./OrgUnitTree";
import { columns } from "../utils";
import { get } from "lodash";

const { RangePicker } = DatePicker;

const WhoDidWhat = () => {
  const store = useStore($store);
  const pagination = useStore($pagination);
  const canDownload = useStore($canDownload);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [date, setDate] = useState<[any, any] | undefined>([
    moment(),
    moment(),
  ]);
  const [orgUnits, setCurrentOrgUnits] = useState<string[]>(
    store.selected.map((v) => String(v).toLowerCase())
  );
  const [selectedDates, setSelectedDates] = useState<
    [string, string] | undefined
  >(
    !!date
      ? [date[0].format("YYYY-MM-DD"), date[1].format("YYYY-MM-DD")]
      : undefined
  );
  const [query, setQuery] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const changeSearch = () => {
    setQuery(q);
    setCurrentOrgUnits(store.selected.map((v) => String(v).toLowerCase()));
    if (date) {
      setSelectedDates([
        date[0].format("YYYY-MM-DD"),
        date[1].format("YYYY-MM-DD"),
      ]);
    } else {
      setSelectedDates(undefined);
    }
  };

  const setOrgUnits = (values: any[]) => {
    setSelected(values);
  };
  const { isLoading, isSuccess, isError, data, error } = useWhoDidWhat(
    orgUnits,
    pagination.page,
    pagination.pageSize,
    selectedDates,
    query
  );

  const download = async () => {
    setDownloading(true);
    changeSearch();

    const currentData = await downloadDetails(orgUnits, selectedDates, query);

    const all = [
      columns.map((c) => c.name),
      ...currentData.map((r: any) => {
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
  return (
    <Stack p="20px">
      <Stack direction="row">
        <Input
          placeholder="Search records"
          w={350}
          value={q}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        />
        <RangePicker size="large" value={date} onChange={setDate} />
        <OrgUnitTree
          multiple={true}
          value={store.selected}
          onChange={setOrgUnits}
          initial={store.organisationUnits}
        />
        <Button colorScheme="blue" onClick={changeSearch} isLoading={isLoading}>
          Submit
        </Button>
        <Spacer />
        {canDownload && (
          <Button
            colorScheme="blue"
            onClick={download}
            isLoading={downloading || isLoading}
          >
            Download
          </Button>
        )}
      </Stack>
      {isLoading && <Spinner />}
      {isSuccess && <DetailsTable data={data.allRecords} total={data.total} />}
      {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}
    </Stack>
  );
};

export default WhoDidWhat;
