import { Stack } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { TreeSelect } from "antd";
import { uniqBy } from "lodash";
import { useState } from "react";

import "antd/dist/antd.css";

type OrgUnitTreeProps = {
  initial: any[];
  onChange: (value: any) => void;
  value: any;
  multiple: boolean;
};

const OrgUnitTree = ({
  initial,
  // expandedKeys,
  onChange,
  value,
  multiple,
}: OrgUnitTreeProps) => {
  const engine = useDataEngine();
  const [treeData, setTreeData] = useState<any[]>(initial);
  // const [expanded, setExpanded] = useState<React.Key[]>(expandedKeys);
  const onLoadData = async (parent: any) => {
    try {
      const {
        units: { organisationUnits },
      }: any = await engine.query({
        units: {
          resource: "organisationUnits.json",
          params: {
            filter: `id:in:[${parent.value}]`,
            paging: "false",
            order: "shortName:desc",
            fields: "children[id,name,path,leaf]",
          },
        },
      });
      const found = organisationUnits.flatMap((unit: any) => {
        return unit.children
          .map((child: any) => {
            return {
              id: child.id,
              pId: parent.value,
              value: child.id,
              key: child.id,
              title: child.name,
              isLeaf: child.leaf,
            };
          })
          .sort((a: any, b: any) => {
            if (a.title > b.title) {
              return 1;
            }
            if (a.title < b.title) {
              return -1;
            }
            return 0;
          });
      });
      const all: any[] = uniqBy([...treeData, ...found], "value");
      setTreeData(all);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Stack w="300px">
      <TreeSelect
        allowClear={true}
        multiple={multiple}
        treeDataSimpleMode
        size="large"
        style={{ width: "100%" }}
        value={value}
        // treeCheckable={multiple}
        // treeCheckStrictly={multiple}
        listHeight={700}
        // treeExpandedKeys={expanded}
        // onTreeExpand={onTreeExpand}
        dropdownStyle={{ overflow: "auto" }}
        placeholder="Please select health centre"
        onChange={onChange}
        showSearch={true}
        loadData={onLoadData}
        treeData={treeData}
      />
    </Stack>
  );
};

export default OrgUnitTree;
