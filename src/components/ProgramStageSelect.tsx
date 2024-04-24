import { GroupBase, Select } from "chakra-react-select";
type Option = {
    label: string;
    value: string;
};
const stageOptions: Option[] = [
    { value: "QmNYFz0XgMb", label: "Yellow Fever Vaccination" },
    { value: "a1jCssI2LkW", label: "Covid-19 Vaccination" },
    { value: "A6TF629IhhR", label: "AEFI" },
];
export default function ProgramStageSelect({
    value,
    onChange,
}: {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
}) {
    return (
        <Select<Option, false, GroupBase<Option>>
            options={stageOptions}
            value={stageOptions.filter((a) => a.value === value)}
            onChange={(e) => onChange(e?.value)}
        />
    );
}
