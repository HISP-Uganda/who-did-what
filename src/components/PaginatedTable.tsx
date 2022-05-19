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
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $store } from "../Store";
import { findAllUsers, findRecord } from "../utils";

type AppProps = {
  data: any;
};

const PaginatedTable = ({ data }: AppProps) => {
  const store = useStore($store);
  const allUsers = findAllUsers(data);
  const {
    pages,
    pagesCount,
    currentPage,
    setCurrentPage,
    isDisabled,
    pageSize,
    setPageSize,
  } = usePagination({
    total: allUsers.length,
    limits: {
      outer: 4,
      inner: 4,
    },
    initialState: {
      pageSize: 10,
      currentPage: 1,
    },
  });

  const handlePageChange = (nextPage: number): void => {
    setCurrentPage(nextPage);
  };

  const handlePageSizeChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    const pageSize = Number(event.target.value);
    setPageSize(pageSize);
    setCurrentPage(1);
  };

  return (
    <div>
      <Table variant="striped" w="100%">
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Full Name</Th>
            <Th>Contact</Th>
            <Th textAlign="center">Doses Created</Th>
            <Th textAlign="center">Doses Completed</Th>
            <Th textAlign="center">Vaccines Created</Th>
            <Th textAlign="center">Vaccines Completed</Th>
            <Th textAlign="center">Events Created</Th>
            <Th textAlign="center">Events Completed</Th>
          </Tr>
        </Thead>
        <Tbody>
          {allUsers
            .slice(currentPage * pageSize - pageSize, pageSize * currentPage)
            .map((user: any) => {
              const {
                doses,
                vaccines,
                completedDose,
                completedVaccine,
                totalCompleted,
                total,
              } = findRecord(data, user);
              return (
                <Tr key={user}>
                  <Td>{user}</Td>
                  <Td>{store.users[user]?.displayName}</Td>
                  <Td>{store.users[user]?.phoneNumber}</Td>
                  <Td textAlign="center">{doses}</Td>
                  <Td textAlign="center">{completedDose}</Td>
                  <Td textAlign="center">{vaccines}</Td>
                  <Td textAlign="center">{completedVaccine}</Td>
                  <Td textAlign="center">{total}</Td>
                  <Td textAlign="center">{totalCompleted}</Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
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
          <option value="25">25</option>
          <option value="50">50</option>
        </Select>
      </Center>
    </div>
  );
};

export default PaginatedTable;
