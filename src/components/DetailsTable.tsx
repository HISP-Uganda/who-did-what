import {
  Pagination,
  PaginationContainer,
  PaginationNext,
  PaginationPage,
  PaginationPageGroup,
  PaginationPrevious,
  PaginationSeparator,
  usePagination,
} from "@ajna/pagination";
import { get } from "lodash";

import {
  Center,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $store } from "../Store";
import { columns } from "../utils";
import { changePage, changePageSize } from "../Events";

type AppProps = {
  data: any;
  total: number;
};

export const innerColumns = (index: number) => {
  if (index === 0) {
    return {
      position: "sticky",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      backgroundColor: "white",
      zIndex: 100,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "150px",
      minW: "150px",
      maxWidth: "150px",
      left: "200px",
      backgroundColor: "white",
      zIndex: 100,
    } as any;
  }
  return {} as any;
};

export const otherRows = (index: number, bg: string = "white") => {
  if (index === 0) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      top: "0px",
      zIndex: 10000,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "150px",
      minW: "150px",
      maxWidth: "150px",
      left: "200px",
      top: "0px",
      zIndex: 10000,
    } as any;
  }
  return {
    top: "0px",
    position: "sticky",
    bg,
    // textAlign: "center",
    zIndex: 1000,
  } as any;
};

const DetailsTable = ({ data, total }: AppProps) => {
  const {
    pages,
    pagesCount,
    currentPage,
    setCurrentPage,
    isDisabled,
    pageSize,
    setPageSize,
  } = usePagination({
    total,
    limits: {
      outer: 4,
      inner: 4,
    },
    initialState: {
      pageSize: 25,
      currentPage: 1,
    },
  });

  const handlePageChange = (nextPage: number): void => {
    setCurrentPage(nextPage);
    changePage(nextPage);
  };

  const handlePageSizeChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    const pageSize = Number(event.target.value);
    setPageSize(pageSize);
    setCurrentPage(1);
    changePage(1);
    changePageSize(pageSize);
  };
  return (
    <Box m="auto" w="100%">
      <Box
        position="relative"
        overflow="auto"
        whiteSpace="nowrap"
        h="calc(100vh - 325px)"
        // __css={{
        //   "-webkit-touch-callout": "none",
        //   "-webkit-user-select": "none",
        //   "-khtml-user-select": "none",
        //   " -moz-user-select": "none",
        //   "-ms-user-select": "none",
        //   "user-select": "none",
        // }}
      >
        <Table variant="striped" size="sm" colorScheme="gray">
          <Thead>
            <Tr>
              {columns.map((c, index) => (
                <Th key={c.id} {...otherRows(index)}>
                  <Heading as="h6" size="xs" textTransform="none">
                    {c.name}
                  </Heading>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((h: any) => (
              <Tr key={h.id}>
                {columns.map((c, index) => (
                  <Td key={c.id} {...innerColumns(index)}>
                    {get(h, c.id, "")}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Pagination
        pagesCount={pagesCount}
        currentPage={currentPage}
        isDisabled={isDisabled}
        onPageChange={handlePageChange}
      >
        <PaginationContainer
          align="center"
          justify="space-between"
          p={4}
          w="full"
        >
          <PaginationPrevious
            _hover={{
              bg: "yellow.400",
            }}
            bg="yellow.300"
          >
            <Text>Previous</Text>
          </PaginationPrevious>
          <PaginationPageGroup
            isInline
            align="center"
            separator={
              <PaginationSeparator
                onClick={() => console.warn("I'm clicking the separator")}
                bg="blue.300"
                fontSize="sm"
                w={14}
                jumpSize={11}
              />
            }
          >
            {pages.map((page: number) => (
              <PaginationPage
                w={14}
                bg="red.300"
                key={`pagination_page_${page}`}
                page={page}
                fontSize="sm"
                _hover={{
                  bg: "green.300",
                }}
                _current={{
                  bg: "green.300",
                  fontSize: "sm",
                  w: 14,
                }}
              />
            ))}
          </PaginationPageGroup>
          <PaginationNext
            _hover={{
              bg: "yellow.400",
            }}
            bg="yellow.300"
          >
            <Text>Next</Text>
          </PaginationNext>
        </PaginationContainer>
      </Pagination>
      <Center w="full">
        <Text>Records per page</Text>
        <Select ml={3} onChange={handlePageSizeChange} w={40} value={pageSize}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </Select>
      </Center>
    </Box>
  );
};

export default DetailsTable;
