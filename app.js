const { useState, useEffect } = React;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bnb');
  const [isMobile, setIsMobile] = useState(false);
  const [isMetaMaskBrowser, setIsMetaMaskBrowser] = useState(false);

  // Cihaz ve tarayıcı kontrolü
  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
    
    // MetaMask tarayıcısında mı kontrolü
    if (mobile && window.ethereum && window.ethereum.isMetaMask) {
      setIsMetaMaskBrowser(true);
      checkConnection();
    }
  }, []);

  // Bağlantı kontrolü
  const checkConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    }
  };

  // MetaMask bağlantısı (Mobil özel)
  const connectMetaMaskMobile = async () => {
    try {
      if (!window.ethereum) {
        // MetaMask uygulamasına deep link
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          window.location.href = 'metamask://dapp/' + encodeURIComponent(window.location.href);
        } else {
          window.location.href = 'https://metamask.app.link/dapp/' + window.location.href;
        }
        return;
      }
      
      // Doğrudan bağlantı isteği
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Mobil imza isteği
      await signMessage(accounts[0]);
      
      handleConnectionSuccess(accounts[0]);
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      alert(`Bağlantı hatası: ${error.message}`);
    }
  };

  // Mobil imza işlemi (Chrome'ye dönüş için kritik)
  const signMessage = async (account) => {
    try {
      const message = "FDAI Presale giriş onayı - " + Date.now();
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });
      
      // İmza sonrası Chrome'ye dönüş
      if (!isMetaMaskBrowser && document.referrer.includes('chrome')) {
        window.location.href = 'googlechrome://' + window.location.href.replace(/^https?:\/\//, '');
      }
    } catch (error) {
      console.error('İmza hatası:', error);
      throw error;
    }
  };

  const handleConnectionSuccess = (account) => {
    setAccount(account);
    setIsConnected(true);
    
    // Etkinlik dinleyicileri
    window.ethereum.on('accountsChanged', (newAccounts) => {
      if (newAccounts.length > 0) {
        setAccount(newAccounts[0]);
      } else {
        setIsConnected(false);
        setAccount('');
      }
    });
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
              
              {isMobile ? (
                <>
                  <p className="text-muted mb-3">
                    {isMetaMaskBrowser 
                      ? "MetaMask tarayıcısı ile bağlanıyorsunuz"
                      : "MetaMask uygulaması ile bağlanın"}
                  </p>
                  
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={connectMetaMaskMobile}
                  >
                    MetaMask ile Bağlan
                  </button>
                  
                  {!isMetaMaskBrowser && (
                    <p className="mt-3 small">
                      MetaMask yüklü değilse <a href="#" onClick={connectMetaMaskMobile}>buraya tıklayın</a>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-muted mb-3">Lütfen MetaMask eklentisini kullanın</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={connectMetaMaskMobile}
                  >
                    MetaMask ile Bağlan
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="connected-wallet">
              <div className="alert alert-success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Bağlı Cüzdan:</strong>
                    <div className="wallet-address">
                      {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                    </div>
                  </div>
                  <span className="badge bg-primary">MetaMask</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
