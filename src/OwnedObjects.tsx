import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { Object } from "./Object";
import { ObjectOwner, SuiObjectData } from "@mysten/sui.js/client";

const MOCK_RECEIVER =
  "0x54d52d2b0edf7271ef24e50e9f04ab43c0fe5bdd064abddbedc87f13d29f56a5";

const TREASURY = {
  type: "0xfaa4c2aa5235d625198c9924ea4ec5bc16ff37e634918afa28d5adcf6ea96e3d::cart::CART",
  id: "0x9b3d9d6046bd83753a0615fcc4023e7204ff4d074dfe663b7075d8dd9afe0c53",
};

function createTxb() {
  //Assume signer is the owner of the treasury object -> success
  const txb = new TransactionBlock();
  const mintObject = txb.moveCall({
    arguments: [txb.object(TREASURY.id), txb.pure.u64(MIST_PER_SUI)],
    typeArguments: [TREASURY.type], // Generic type <T>
    target: `0x2::coin::mint`, // Function
  });

  txb.transferObjects([mintObject], MOCK_RECEIVER);
  return txb;
}

function isAddressOwnerType(
  objectOwner: ObjectOwner | null | undefined,
): objectOwner is {
  AddressOwner: string;
} {
  if (!objectOwner) return false;
  return objectOwner.hasOwnProperty("AddressOwner");
}

function isAddressOwner(currentAddress: string, object: SuiObjectData) {
  if (!object.owner) return false;
  return (
    isAddressOwnerType(object.owner) &&
    object.owner.AddressOwner === currentAddress
  );
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
  const { data: cartTreasury } = useSuiClientQuery(
    "getObject",
    {
      id: TREASURY.id,
      options: {
        showOwner: true,
      },
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
          if (cartTreasury?.data) {
            if (isAddressOwner(account.address, cartTreasury.data)) {
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
            } else {
              console.error("You are not the owner of the treasury object");
            }
          }
        }}
      >
        Mint
      </Button>
      {data.data.map((object) => {
        if (!object.data) return;
        return <Object object={object.data} />;
      })}
    </Flex>
  );
}
