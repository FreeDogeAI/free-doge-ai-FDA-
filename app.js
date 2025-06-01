
const { useState, useEffect } = React;

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [bnbBalance, setBnbBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [fdaBalance, setFdaBalance] = useState(0);
  const [buyAmount, setBuyAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bnb');
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // Token and contract addresses
  const tokenAddress = "0x8161698A74F2ea0035B9912ED60140893Ac0f39C";
  const receiverAddress = "0xd924e01c7d319c5b23708cd622bd1143cd4fb360";
  
  // Token prices
  const bnbPrice = 120000000000; // 1 BNB = 120,000,000,000 FDAI
  const usdtPrice = 200000000;   // 1 USDT = 200,000,000 FDAI

  // Check if mobile device
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Initialize Web3
  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        
        // Check if already connected
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          await handleConnect();
        }
      } else if (window.web3) {
        setWeb3(new Web3(window.web3.currentProvider));
      } else {
        setError("Please install MetaMask or another Web3 provider.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Connect wallet
  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        setError("Please install MetaMask or another Web3 provider.");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      // Get network ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetworkId(chainId);
      
      // Initialize Web3
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      
      // Get balances
      await updateBalances(web3Instance, accounts[0]);
      
      setIsConnected(true);
      
      // Set up event listeners
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
          updateBalances(web3Instance, newAccounts[0]);
        } else {
          handleDisconnect();
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    setAccount(null);
    setWeb3(null);
    setBnbBalance(0);
    setUsdtBalance(0);
    setFdaBalance(0);
    setIsConnected(false);
    setTxHash(null);
    setError(null);
  };

  // Update balances
  const updateBalances = async (web3Instance, account) => {
    try {
      // Get BNB balance
      const balance = await web3Instance.eth.getBalance(account);
      setBnbBalance(web3Instance.utils.fromWei(balance, 'ether'));
      
      // Note: USDT balance would require USDT contract interaction
      // For simplicity, we're not implementing it here
      setUsdtBalance(0);
      
      // Note: FDAI balance would require FDAI contract interaction
      // For simplicity, we're not implementing it here
      setFdaBalance(0);
    } catch (err) {
      setError("Failed to fetch balances: " + err.message);
    }
  };

  // Handle buy tokens
  const handleBuyTokens = async () => {
    if (!web3 || !account || !buyAmount || isNaN(buyAmount) || parseFloat(buyAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setTxHash(null);
      
      const amount = web3.utils.toWei(buyAmount, 'ether');
      let tx;
      
      if (paymentMethod === 'bnb') {
        tx = await web3.eth.sendTransaction({
          from: account,
          to: receiverAddress,
          value: amount
        });
      } else if (paymentMethod === 'usdt') {
        // Note: USDT transfer would require USDT contract interaction
        // For simplicity, we're not implementing it here
        throw new Error("USDT payments are not implemented in this demo");
      }
      
      setTxHash(tx.transactionHash);
      
      // Update balances after purchase
      await updateBalances(web3, account);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate token amount based on payment method
  const calculateTokenAmount = () => {
    if (!buyAmount || isNaN(buyAmount) return 0;
    
    const amount = parseFloat(buyAmount);
    if (amount <= 0) return 0;
    
    return paymentMethod === 'bnb' 
      ? (amount * bnbPrice).toLocaleString() 
      : (amount * usdtPrice).toLocaleString();
  };

  // Initialize on mount
  useEffect(() => {
    initWeb3();
  }, []);

  return (
    <div className="container">
      <header className="header text-center py-4 mb-5">
        <h1 className="logo">Free Doge AI Presale</h1>
        <p className="mb-0">Join the FDAI token presale now!</p>
      </header>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card mb-4">
            <div className="card-header text-white">
              <h3 className="mb-0">Purchase FDAI Tokens</h3>
            </div>
            <div className="card-body p-4">
              {!isConnected ? (
                <div className="text-center py-4">
                  <button 
                    className="btn btn-connect btn-lg" 
                    onClick={handleConnect}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                  {isMobile && (
                    <p className="mt-3">Please use your wallet browser or connect via WalletConnect</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="wallet-info mb-4">
                    <h5>Connected Wallet</h5>
                    <p className="connected-wallet">{account}</p>
                    <p className="balance">BNB Balance: {bnbBalance}</p>
                    <p className="balance">USDT Balance: {usdtBalance}</p>
                    <button 
                      className="btn btn-sm btn-outline-secondary mt-2" 
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
                    <select 
                      id="paymentMethod" 
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="bnb">BNB</option>
                      <option value="usdt">USDT</option>
                    </select>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="buyAmount" className="form-label">Amount to Spend ({paymentMethod.toUpperCase()})</label>
                    <input 
                      type="number" 
                      className="form-control"
                      id="buyAmount"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder={`Enter ${paymentMethod.toUpperCase()} amount`}
                      step="any"
                    />
                  </div>

                  <div className="token-info mb-4 p-3">
                    <h5>You Will Receive</h5>
                    <p className="token-price">{calculateTokenAmount()} FDAI</p>
                    <p className="small text-muted mb-0">
                      {paymentMethod === 'bnb' 
                        ? `1 BNB = ${bnbPrice.toLocaleString()} FDAI` 
                        : `1 USDT = ${usdtPrice.toLocaleString()} FDAI`}
                    </p>
                  </div>

                  <button 
                    className="btn btn-buy" 
                    onClick={handleBuyTokens}
                    disabled={isLoading || !buyAmount}
                  >
                    {isLoading ? 'Processing...' : 'Buy FDAI Tokens'}
                  </button>
                </>
              )}

              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}

              {txHash && (
                <div className="alert alert-success mt-3">
                  Transaction successful! <br />
                  <a 
                    href={`https://bscscan.com/tx/${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View on BscScan
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header text-white">
              <h3 className="mb-0">Token Information</h3>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <h5>Token Price</h5>
                <p>1 BNB = 120,000,000,000 FDAI</p>
                <p>1 USDT = 200,000,000 FDAI</p>
              </div>
              
              <div>
                <h5>Token Contract Address</h5>
                <div className="token-address">
                  {tokenAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2023 Free Doge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
