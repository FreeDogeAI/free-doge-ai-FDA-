const { useState, useEffect } = React;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Lütfen MetaMask veya Trust Wallet yükleyin!");
        return;
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
        } else {
          setIsConnected(false);
          setAccount(null);
        }
      });
      
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }
  };

  return (
    <div className="container">
      <header className="header text-center py-4 mb-4">
        <h1>Ücretsiz Doge AI Ön Satışı</h1>
        <p>FDAI token ön satışına hemen katılın!</p>
      </header>

      <div className="card p-4">
        <h2 className="text-center mb-4">FDAI Tokenleri satın alın</h2>
        
        {!isConnected ? (
          <div className="text-center">
            <h4>Cüzdanı Bağla</h4>
            {isMobile ? (
              <p className="text-muted">Lütfen cüzdan tarayıcınızı kullanın veya WalletConnect üzerinden bağlanın</p>
            ) : (
              <p className="text-muted">Lütfen MetaMask veya başka bir Web3 sağlayıcısını yükleyin</p>
            )}
            
            <button 
              className="btn btn-primary btn-lg mt-3"
              onClick={connectWallet}
            >
              Cüzdanı Bağla
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="alert alert-success">
              Başarıyla bağlandı: {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setIsConnected(false)}
            >
              Bağlantıyı Kes
            </button>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}
      </div>

      <div className="card mt-4 p-4">
        <h3 className="text-center">Jeton Bilgileri</h3>
        <h4 className="mt-3">Jeton Fiyatı</h4>
        <p>1 BNB = 120.000.000.000 FDAI</p>
        <p>1 USDT = 200.000.000 FDAI</p>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
