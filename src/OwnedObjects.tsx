import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { getObject } from "../utils/object";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";

const MOCK_RECEIVER =
  "0x54d52d2b0edf7271ef24e50e9f04ab43c0fe5bdd064abddbedc87f13d29f56a5";

function createTxb() {
  const txb = new TransactionBlock();
  const [coin] = txb.splitCoins(txb.gas, [MIST_PER_SUI]);
  txb.transferObjects([coin], MOCK_RECEIVER);

  return txb;
}

export function OwnedObjects() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
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
      <Button
        onClick={() => {
          signAndExecuteTransactionBlock(
            {
              transactionBlock: createTxb(),
              chain: "sui:devnet",
            },
            {
              onSuccess: (result) => {
                console.log("executed transaction block", result);
              },
            },
          );
        }}
      >
        Transfer
      </Button>
      {data.data.map((object) => (
        <Flex key={object.data?.objectId}>
          <Text>Object ID: {object.data?.objectId}</Text>
          <Button onClick={() => getObject(object.data?.objectId)}>Get</Button>
        </Flex>
      ))}
    </Flex>
  );
}
