import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Spacer,
    Spinner,
    Stack,
} from "@chakra-ui/react";
import { DatePicker } from "antd";
import "antd/dist/antd.css";
import { useStore } from "effector-react";
import moment from "moment";
import { RangeValue } from "rc-picker/lib/interface";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import { useEs } from "../Queries";
import { $store } from "../Store";
import { findCompleted } from "../utils";
import PaginatedTable from "./PaginatedTable";
import ProgramStageSelect from "./ProgramStageSelect";

const { RangePicker } = DatePicker;
type Option = {
    label: string;
    value: string;
};

const EventsStat = () => {
    const [date, setDate] = useState<RangeValue<moment.Moment>>([
        moment(),
        moment(),
    ]);
    const [downloading, setDownloading] = useState<boolean>(false);
    const [vaccineDataElement, setVaccineDataElement] =
        useState<string>("oOqS5bMo20q");
    const [doseDataElement, setDoseDataElement] = useState<string | undefined>(
        undefined
    );
    const [selectedDate, setSelectedDate] = useState<[string, string]>([
        "",
        "",
    ]);
    const [query, setQuery] = useState<string>("");
    const [q, setQ] = useState<string>("");
    const store = useStore($store);

    const changeSearch = () => {
        setQuery(() => q);
        setSelectedDate((prev) => {
            if (date && date[0] && date[1]) {
                return [
                    date[0]?.format("YYYY-MM-DD"),
                    date[1]?.format("YYYY-MM-DD"),
                ];
            }
            return prev;
        });
    };

    const [stage, setStage] = useState<string>("QmNYFz0XgMb");
    const { isError, isLoading, isSuccess, error, data } = useEs({
        q: query,
        startDate: selectedDate[0],
        endDate: selectedDate[1],
        organisationUnits: store.organisationUnits.map((o: any) =>
            String(o.id).toLowerCase()
        ),
        stage,
        vaccineDataElement,
        doseDataElement,
    });

    const downloadEvents = async () => {
        setQuery(() => q);
        setSelectedDate((prev) => {
            if (date && date[0] && date[1]) {
                return [
                    date[0]?.format("YYYY-MM-DD"),
                    date[1]?.format("YYYY-MM-DD"),
                ];
            }
            return prev;
        });
        setDownloading(true);

        const all = [
            [
                "Username",
                "Full Name",
                "Contact",
                "Events Created",
                "Events Completed",
            ],
            ...data.summary.buckets.map((r: any) => {
                return [
                    r.key,
                    store.users[r.key]?.displayName,
                    store.users[r.key]?.phoneNumber,
                    r.doc_count,
                    findCompleted(r),
                ];
            }),
        ];
        const sheetName = "Events";
        const filename = `Events-${store.organisationUnits
            .map((o: any) => o.name)
            .join("-")}-${selectedDate[0]}-${selectedDate[1]}.xlsx`;
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
                Summary Statistics
            </Heading>
            <Stack p={4} direction="row" spacing={50}>
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
                    onChange={(a) => setDate(a)}
                />
                <Button
                    colorScheme="blue"
                    onClick={changeSearch}
                    isLoading={isLoading}
                >
                    Submit
                </Button>
                <Spacer />
                <Button
                    colorScheme="blue"
                    onClick={downloadEvents}
                    isLoading={downloading}
                    isDisabled={data?.summary.buckets.length === 0}
                >
                    Download
                </Button>
            </Stack>
            <Box p={4} m={4} borderWidth="1px" borderRadius="lg">
                {isLoading && <Spinner />}
                {isSuccess && <PaginatedTable data={data} />}
            </Box>
            {isError && <Box>{error?.message}</Box>}
        </Flex>
    );
};

export default EventsStat;
