import {
    Box,
    Button,
    Flex,
    Heading,
    Spacer,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Input,
    Select,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { DatePicker } from "antd";
import { RangeValue } from "rc-picker/lib/interface";
import "antd/dist/antd.css";
import { useStore } from "effector-react";
import moment from "moment";
import { ChangeEvent, useState } from "react";
import { setSelected, setSelectedLevel } from "../Events";
import { useDistricts } from "../Queries";
import OrgUnitTree from "./OrgUnitTree";
import { $store } from "../Store";
import SingleOu from "./SingleOu";
import { useDataEngine } from "@dhis2/app-runtime";
import { fromPairs } from "lodash";
import ProgramStageSelect from "./ProgramStageSelect";

const { RangePicker } = DatePicker;

const Totals = () => {
    const store = useStore($store);
    const [date, setDate] = useState<[any, any]>([moment(), moment()]);
    const engine = useDataEngine();
    const [q, setQ] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [downloading, setDownloading] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<[string, string]>([
        "",
        "",
    ]);
    const [currentLevel, setCurrentLevel] = useState<string>(
        store.selectedLevel
    );
    const [orgUnits, setCurrentOrgUnits] = useState<string[]>(
        store.selected.map((v) => String(v).toLowerCase())
    );
    const [stage, setStage] = useState<string>("QmNYFz0XgMb");
    const [vaccineDataElement, setVaccineDataElement] =
        useState<string>("oOqS5bMo20q");
    const [doseDataElement, setDoseDataElement] = useState<string | undefined>(
        undefined
    );
    const { isLoading, isSuccess, isError, data, error } = useDistricts({
        q: username,
        startDate: selectedDate[0],
        endDate: selectedDate[1],
        organisationUnits: orgUnits.map((o: any) => String(o).toLowerCase()),
        stage,
        vaccineDataElement,
        doseDataElement,
        level: currentLevel,
    });

    const setOrgUnits = (values: any[]) => {
        setSelected(values);
    };

    const changeSearch = () => {
        setCurrentOrgUnits(store.selected.map((v) => String(v).toLowerCase()));
        setCurrentLevel(store.selectedLevel);
        setSelectedDate([
            date[0].format("YYYY-MM-DD"),
            date[1].format("YYYY-MM-DD"),
        ]);
        setUsername(q);
    };
    const findCompleted = (row: any) => {
        const found = row.status.buckets.find(
            (bucket: any) => bucket.key === "COMPLETED"
        );
        if (found) {
            return found.doc_count;
        }
        return 0;
    };

    const downloadEvents = async () => {
        setDownloading(true);
        const {
            units: { organisationUnits },
        }: any = await engine.query({
            units: {
                resource: "organisationUnits.json",
                params: {
                    filter: `id:in:[${data.summary.buckets
                        .map((r: any) => r.key)
                        .join(",")}]`,
                    fields: "id,name",
                    paging: false,
                },
            },
        });
        const allUnits = fromPairs(
            organisationUnits.map((unit: any) => [unit.id, unit.name])
        );
        const all = [
            ["Location", "Events Created", "Events Completed"],
            ...data.summary.buckets.map((r: any) => {
                return [allUnits[r.key], r.doc_count, findCompleted(r)];
            }),
        ];
        const sheetName = "Summary";
        const filename = `Summary-${selectedDate[0]}-${selectedDate[1]}.xlsx`;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(all);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, filename);
        setDownloading(false);
    };

    const changeStage = (value: string | undefined) => {
        setStage(() => value ?? "");

        if (value && value === "QmNYFz0XgMb") {
            setDoseDataElement(() => undefined);
            setVaccineDataElement(() => "oOqS5bMo20q");
        } else if (value && value === "a1jCssI2LkW") {
            setDoseDataElement(() => "LUIsbsm3okG");
            setVaccineDataElement(() => "bbnyNYD1wgS");
        }
    };
    return (
        <Flex justifyItems="center" direction="column">
            <Heading
                as="h3"
                size="lg"
                p={4}
                color="gray"
                justifyContent="center"
            >
                Total Statistics
            </Heading>
            <Stack direction="row" p={4} spacing={50}>
                <Box w="500px">
                    <ProgramStageSelect value={stage} onChange={changeStage} />
                </Box>
                <Input
                    placeholder="Search by User Name"
                    w={500}
                    value={q}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setQ(e.target.value)
                    }
                />
                <RangePicker
                    size="large"
                    value={date}
                    onChange={(values: RangeValue<moment.Moment>) =>
                        setDate([values?.[0], values?.[1]])
                    }
                />
                <OrgUnitTree
                    multiple={true}
                    value={store.selected}
                    onChange={setOrgUnits}
                    initial={store.organisationUnits}
                />
                <Select
                    w="300px"
                    value={store.selectedLevel}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setSelectedLevel(e.target.value)
                    }
                >
                    {store.levels.map((l) => (
                        <option value={l.level} key={l.id}>
                            {l.name}
                        </option>
                    ))}
                </Select>
                <Button colorScheme="blue" onClick={changeSearch}>
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
            <Box overflow="auto" h="calc(100vh - 270px)">
                <Table variant="striped" w="100%">
                    <Thead>
                        <Tr>
                            <Th>District Name</Th>
                            <Th textAlign="center">Events Created</Th>
                            <Th textAlign="center">Events Completed</Th>
                        </Tr>
                    </Thead>
                    {isLoading && (
                        <Tbody>
                            <Tr>
                                <Td colSpan={5} textAlign="center">
                                    Loading
                                </Td>
                            </Tr>
                        </Tbody>
                    )}
                    {isSuccess && data && (
                        <Tbody>
                            {data.summary.buckets.map((bucket: any) => {
                                return (
                                    <Tr key={bucket.key}>
                                        <Td>
                                            <SingleOu orgUnit={bucket.key} />
                                        </Td>
                                        <Td textAlign="center">
                                            {bucket.doc_count}
                                        </Td>
                                        <Td textAlign="center">
                                            {findCompleted(bucket)}
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    )}
                </Table>
            </Box>
            {isError && <div>{error?.message}</div>}
        </Flex>
    );
};

export default Totals;
