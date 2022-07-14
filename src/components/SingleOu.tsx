import { Box, Spinner, Text } from "@chakra-ui/react";
import { useOU } from "../Queries";

const SingleOu = ({ orgUnit }: { orgUnit: string }) => {
  const { isLoading, isError, isSuccess, error, data } = useOU(orgUnit);
  return (
    <>
      {isLoading && <Spinner />}
      {isSuccess && <Text>{data}</Text>}
      {isError && <Box>{error.message}</Box>}
    </>
  );
};

export default SingleOu;
