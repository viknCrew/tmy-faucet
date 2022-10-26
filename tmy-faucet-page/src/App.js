import { useState, useEffect } from "react";
import './styles/App.css';
import Web3 from 'web3';


function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAdress, setUserAdress] = useState("");
  const [userBalance, setUserBalance] = useState("");
  const [getTmyResult, setTmyResultString] = useState("");
  const [getTmyRequest, setTmyRequestBool] = useState(false);
  const [getTxString, setTxString] = useState("");
  const [getTxBool, setTxBool] = useState(false);
  const [getTimeLeftString, setTimeLeftString] = useState("")
  const [getTimeLeftBool, setTimeLeftBool] = useState(false)
  const [getChainId, setChainId] = useState()


  async function getTmy() {
    if (getChainId !== network.tmy.chainId) {
      await handleNetworkSwitch("tmy")
      return
    }
    setTmyRequestBool(true)
    var response = await fetch('http://95.105.118.187:3000/api/send/?address=' + { userAdress }.userAdress);
    var json = await response.json()
    var msg = json['msg']
    if (msg !== "Time has not yet passed") {
      var tx = json['tx']
      setTxString(tx)
      setTxBool(true)
    }
    else {
      setTimeLeftString(json['timeForGiveaway'])
      setTimeLeftBool(true)
    }
    setTmyResultString(msg)
  }

  function openTmyChainSite() {
    window.location.href = 'https://wallet.tmychain.org/#';
  }

  const detectCurrentProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;

    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      console.log("Non-ethereum browser detected. You should install Metamask");
    }
    return provider;
  };

  const onConnect = async () => {
    try {
      const currentProvider = detectCurrentProvider();
      await handleNetworkSwitch("tmy")
      if (currentProvider) {
        await currentProvider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(currentProvider);
        const userAccount = await web3.eth.getAccounts();
        var balance = await web3.eth.getBalance(userAccount[0])
        var account = userAccount[0]
        setUserAdress(account);
        setUserBalance(Web3.utils.fromWei({ balance }.balance, 'ether'))
        setIsConnected(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const onDisconnect = () => {
    setIsConnected(false);
  }

  const network = {
    tmy: {
      chainId: `0x${Number(8768).toString(16)}`,
      chainName: "TMY Chain",
      nativeCurrency: {
        name: "TMY",
        symbol: "TMY",
        decimals: 18
      },
      rpcUrls: ["https://node1.tmyblockchain.org/"],
      blockExplorerUrls: ["https://tmyscan.com"]
    }
  };

  const changeNetwork = async ({ networkName }) => {
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...network[networkName]
          }
        ]
      });
    } catch (err) {
      console.log(err)
    }
  };

  const handleNetworkSwitch = async (networkName) => {
    await changeNetwork({ networkName });
  };

  const networkChanged = (chainId) => {
    console.log({ chainId });
    setChainId({chainId}.chainId)
  };

  useEffect(() => {
    window.ethereum.on("chainChanged", networkChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", networkChanged);
    };
  }, []);

  return (
    <div>
      <header style={{
        margin: 80,
      }}>
        <div style={{
          padding: 10,
          borderRadius: 15,
          border: "solid",
          borderInlineColor: "#F7F8FC",
          borderBlockColor: "#F7F8FC",
          backgroundColor: "#F7F8FC",
        }}>

          <div class='wrapper' style={{
            display: 'grid',
            gridTemplateColumns: '10fr  1fr'
          }}>
            <div >
              <img src={process.env.PUBLIC_URL + "img/wallet-logo.svg"} alt=" " />
              <text style={{
                fontSize: 30,
                marginLeft: 10,
                verticalAlign: "baseline"
              }}>
                /:Faucet
              </text>
            </div>

            <button class='row1' style={{
              backgroundColor: '#283593',
              color: 'white',
              fontSize: '15px',
              borderRadius: '5px',
              padding: '10px 10px',
              cursor: 'pointer',

            }} onClick={openTmyChainSite} >
              TMYChain
            </button>
          </div>

        </div>
      </header>
      <body>
        {!isConnected && (
          <div className="appLogin" style={{
            padding: 10,
            marginTop: 10,
            borderRadius: 15,
            border: "solid",
            borderInlineColor: "#F7F8FC",
            borderBlockColor: "#F7F8FC",
            backgroundColor: "#F7F8FC",
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 15,
              marginTop: 15,
              fontSize: 25,
            }}>
              <text >
                Connect with metamask
              </text>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px'
            }}>


              <button style=
                {{
                  backgroundColor: '#283593',
                  color: 'white',
                  fontSize: '15px',
                  borderRadius: '5px',
                  padding: '10px 10px',
                  cursor: 'pointer',
                }} onClick={onConnect} >
                Connect
              </button>
            </div>
          </div>)}

        {isConnected && (
          <div style={{
            padding: 10,
            borderRadius: 15,
            border: "solid",
            borderInlineColor: "#F7F8FC",
            borderBlockColor: "#F7F8FC",
            backgroundColor: "#F7F8FC",

          }}>
            <div>
              <text style={{
                fontSize: 20,
                verticalAlign: "baseline",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                Address: {userAdress}
              </text>

            </div>
            <div>
              <text style={{
                fontSize: 20,
                verticalAlign: "baseline",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                Balance: {userBalance}
              </text>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {!getTmyRequest &&
                <button style=
                  {{
                    backgroundColor: '#283593',
                    color: 'white',
                    fontSize: '15px',
                    borderRadius: '5px',
                    padding: '10px 10px',
                    cursor: 'pointer',
                    margin: 5
                  }} onClick={getTmy} >
                  Get TMY
                </button>}

              {getTmyRequest &&
                <div>
                  {getTxBool &&
                    <p style={{
                      fontSize: 20,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '5px'

                    }}> Go to<a style={{
                      fontSize: 20,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',

                    }} href={getTxString}>Transaction</a></p>


                  }

                  <text style={{
                    fontSize: 20,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {getTmyResult}
                  </text>

                  {getTimeLeftBool &&
                    <text style={{
                      fontSize: 20,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      Time until the next receipt of coins : {getTimeLeftString}
                    </text>}

                </div>

              }

            </div>
          </div>
        )}

      </body>
    </div>

  );
}

export default App;
