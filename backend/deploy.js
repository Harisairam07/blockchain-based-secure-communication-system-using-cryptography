require("dotenv").config();
const { Web3 } = require("web3");
const fs = require("fs");

// ================= CONFIG =================
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

const web3 = new Web3(RPC_URL);

// ================= ABI =================
const ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bytes32", name: "hash", type: "bytes32" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "MessageStored",
    type: "event"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_hash", type: "bytes32" },
      { internalType: "bytes", name: "_signature", type: "bytes" }
    ],
    name: "storeMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

// ================= BYTECODE =================
const BYTECODE = "0x608060405234801561000f575f80fd5b50610b0c8061001d5f395ff3fe608060405234801561000f575f80fd5b506004361061004a575f3560e01c806309aa37ba1461004e5780630d80fefd1461006a578063319339161461009d57806386f79edb146100bb575b5f80fd5b610068600480360381019061006391906105c7565b6100ee565b005b610084600480360381019061007f9190610654565b610210565b6040516100949493929190610756565b60405180910390f35b6100a56102ef565b6040516100b291906107a0565b60405180910390f35b6100d560048036038101906100d09190610654565b6102fa565b6040516100e59493929190610756565b60405180910390f35b5f60405180608001604052808481526020018381526020014281526020013373ffffffffffffffffffffffffffffffffffffffff16815250908060018154018082558091505060019003905f5260205f2090600402015f909190919091505f820151815f0155602082015181600101908161016991906109b3565b50604082015181600201556060820151816003015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050503373ffffffffffffffffffffffffffffffffffffffff167ffc0130f045b99ddc021ab5370f3ebcc300526e38305dc6bbf89079a83abd3eb88342604051610204929190610a82565b60405180910390a25050565b5f818154811061021e575f80fd5b905f5260205f2090600402015f91509050805f015490806001018054610243906107e6565b80601f016020809104026020016040519081016040528092919081815260200182805461026f906107e6565b80156102ba5780601f10610291576101008083540402835291602001916102ba565b820191905f5260205f20905b81548152906001019060200180831161029d57829003601f168201915b505050505090806002015490806003015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905084565b5f8080549050905090565b5f604051905090565b5f80fd5b5f80fd5b5f819050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffdfea2646970667358221220f22564a6b57a8ec5d61cd6889d7974429bed3b5f15493dc451e0e5a61580b85f64736f6c63430008140033";

// ================= DEPLOY =================
async function deploy() {
  try {
    console.log("🔌 Connecting to:", RPC_URL);

    const accounts = await web3.eth.getAccounts();
    console.log("🚀 Deploying from:", accounts[0]);

    const contract = new web3.eth.Contract(ABI);

    const gas = await contract.deploy({ data: BYTECODE }).estimateGas();

    const deployed = await contract
      .deploy({ data: BYTECODE })
      .send({
        from: accounts[0],
        gas: Math.floor(Number(gas) * 1.2)
      });

    console.log("✅ Contract deployed at:", deployed.options.address);

    fs.writeFileSync(
      "contractAddress.json",
      JSON.stringify({ address: deployed.options.address }, null, 2)
    );

  } catch (err) {
    console.error("❌ Deployment Failed:", err);
  }
}

deploy();
