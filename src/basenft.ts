import { Transfer as TransferEvent } from "../generated/basenft/basenft";
import { BaseNft, BaseNftMetadata, User } from "../generated/schema";
import { BaseNftMetadata as BaseNftMetadataTemplate } from "../generated/templates";
import { json, Bytes, dataSource } from "@graphprotocol/graph-ts";

const ipfsHash = "bafybeigr7b3cbyrhyjnmv6nx7itr7v25ghqqhfzb23owwvtmaj7vh5vlr4";

export function handleTransfer(event: TransferEvent): void {
  let basenft = BaseNft.load(event.params.tokenId.toString());

  if (!basenft) {
    basenft = new BaseNft(event.params.tokenId.toString());
    basenft.tokenID = event.params.tokenId;
    basenft.tokenURI = event.params.tokenId.toString();
    const ipfsHashUri = ipfsHash + "/" + basenft.tokenURI;
    basenft.ipfsHashURI = ipfsHashUri;
    BaseNftMetadataTemplate.create(ipfsHashUri);
  }
  basenft.owner = event.params.to.toHexString();
  basenft.updatedAtTimestamp = event.block.timestamp;
  basenft.save();

  let user = User.load(event.params.to.toHexString());
  if (!user) {
    user = new User(event.params.to.toHexString());
    user.save();
  }
}

export function handleMetadata(content: Bytes): void {
  let basenftMetadata = new BaseNftMetadata(dataSource.stringParam());

  const value = json.fromBytes(content).toObject();
  if (value) {
    const image = value.get("image");
    const name = value.get("name");
    const attributes = value.get("attributes");

    if (name && image && attributes) {
      basenftMetadata.name = name.toString();
      basenftMetadata.image = image.toString();
      const attributesArray = attributes.toArray();

      if (attributesArray) {
        for (let i = 0; i < attributesArray.length; i++) {
          const attributeObject = attributesArray[i].toObject();
          const trait_type = attributeObject.get("trait_type");
          const value = attributeObject.get("value");

          if (trait_type && value) {
            switch (i) {
              case 0:
                basenftMetadata.type = value.toString();
                break;
              case 1:
                basenftMetadata.eyes = value.toString();
                break;
              case 2:
                basenftMetadata.head = value.toString();
                break;
              case 3:
                basenftMetadata.outfit = value.toString();
                break;
              case 4:
                basenftMetadata.mouth = value.toString();
                break;
              case 5:
                basenftMetadata.background = value.toString();
                break;
            }
          }
        }
      }
      basenftMetadata.save();
    }
  }
}
