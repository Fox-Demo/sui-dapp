import { SuiObjectData } from "@mysten/sui.js/client";
import { Button, Flex, Text } from "@radix-ui/themes";
import { getObject } from "../utils/object";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const MOCK_RECEIVER =
  "0x1dbe7c090f36edafda9f2f577c2ec55b5d4474a5200ead45a425881fb14f5882";

function createTxb(object: SuiObjectData) {
  const txb = new TransactionBlock();
  txb.transferObjects([object.objectId], MOCK_RECEIVER);

  return txb;
}

export const Object = ({ object }: { object: SuiObjectData }) => {
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  return (
    <Flex key={object.objectId}>
      <Text>Object ID: {object.objectId}</Text>
      <Button onClick={() => getObject(object.objectId)}>Get</Button>
      <Button
        onClick={() => {
          signAndExecuteTransactionBlock(
            {
              transactionBlock: createTxb(object),
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
    </Flex>
  );
};
