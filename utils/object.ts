import {
  MoveStruct,
  SuiClient,
  SuiParsedData,
  getFullnodeUrl,
} from "@mysten/sui.js/client";

const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

export async function getObject(id: string | undefined) {
  if (!id) throw new Error(`getObject() argument: {id: ${id}}`);

  const object = await suiClient.getObject({
    id,
    options: {
      showContent: true,
    },
  });

  const content = object.data?.content;

  if (isMoveObject(content)) {
    console.log("GOT IT");
    console.log(content.type);
  } else if (isPackageObject(content)) {
    console.error("OBJECT is a package");
  } else {
    console.error("OBJECT NOT FOUND");
  }

  return object;
}

function isPackageObject(
  content: SuiParsedData | null | undefined,
): content is {
  dataType: "package";
  disassembled: {
    [key: string]: unknown;
  };
} {
  return content?.dataType === "package";
}

function isMoveObject(content: SuiParsedData | null | undefined): content is {
  dataType: "moveObject";
  fields: MoveStruct;
  hasPublicTransfer: boolean;
  type: string;
} {
  return content?.dataType === "moveObject";
}
