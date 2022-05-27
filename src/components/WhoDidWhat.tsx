import { Button, Input, Spinner, Stack } from "@chakra-ui/react";
import { DatePicker } from "antd";
import "antd/dist/antd.css";
import { useStore } from "effector-react";
import { get } from "lodash";
import moment from "moment";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import { setSelected } from "../Events";
import { db, useWhoDidWhat } from "../Queries";
import { $pagination, $store } from "../Store";
import { columns } from "../utils";
import DetailsTable from "./DetailsTable";
import OrgUnitTree from "./OrgUnitTree";

const { RangePicker } = DatePicker;

const WhoDidWhat = () => {
  const store = useStore($store);
  const pagination = useStore($pagination);
  const [date, setDate] = useState<[any, any]>([moment(), moment()]);
  const [orgUnits, setCurrentOrgUnits] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<[string, string]>([
    date[0].format("YYYY-MM-DD"),
    date[1].format("YYYY-MM-DD"),
  ]);
  const [query, setQuery] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const changeSearch = () => {
    setQuery(q);
    setCurrentOrgUnits(
      store.selected.map((v: any) => String(v.value).toLowerCase())
    );
    if (date) {
      setSelectedDate([
        date[0].format("YYYY-MM-DD"),
        date[1].format("YYYY-MM-DD"),
      ]);
    } else {
      setSelectedDate(["", ""]);
    }
  };

  const setOrgUnits = (values: any[]) => {
    setSelected(values);
    // db.collection("selected").set(values);
  };
  const { isLoading, isSuccess, isError, data, error } = useWhoDidWhat(
    orgUnits,
    pagination.page,
    pagination.pageSize,
    selectedDate[0],
    selectedDate[1],
    query
  );

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
          // expandedKeys={store.expandedKeys}
          initial={store.organisationUnits}
        />
        <Button colorScheme="blue" onClick={changeSearch} isLoading={isLoading}>
          Submit
        </Button>
      </Stack>
      {isLoading && <Spinner />}
      {isSuccess && <DetailsTable data={data.allRecords} total={data.total} />}
      {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}
    </Stack>
  );
};

export default WhoDidWhat;
