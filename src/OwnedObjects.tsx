import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { getObject } from "../utils/object";

export function OwnedObjects() {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  if (!account) {
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  return (
    <Flex direction="column" my="2">
      {data.data.length === 0 ? (
        <Text>No objects owned by the connected wallet</Text>
      ) : (
        <Heading size="4">Objects owned by the connected wallet</Heading>
      )}
      {data.data.map((object) => (
        <Flex key={object.data?.objectId}>
          <Text>Object ID: {object.data?.objectId}</Text>
          <Button onClick={() => getObject(object.data?.objectId)}>Get</Button>
        </Flex>
      ))}
    </Flex>
  );
}
