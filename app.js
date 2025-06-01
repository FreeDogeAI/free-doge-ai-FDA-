const { useState, useEffect } = React;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bnb');
  const [showBuySection, setShowBuySection] = useState(false);

  // Mobil kontrolü
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Cüzdan bağlama fonksiyonu
  const connectWallet = async () => {
    try {
      if (isMobile) {
        // Mobil için özel bağlantı
        if (window.ethereum) {
          // MetaMask/Trust Wallet tarayıcısı
          await handleEthereum();
        } else {
          // WalletConnect ile bağlantı
          openMobileWallet();
          return;
        }
      } else {
        // Masaüstü için normal bağlantı
        if (!window.ethereum) {
          alert('Lütfen MetaMask veya Trust Wallet yükleyin!');
          return;
        }
        await handleEthereum();
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      alert(`Bağlantı hatası: ${error.message}`);
    }
  };

  const handleEthereum = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    setIsConnected(true);
    
    const chain = await window.ethereum.request({ method: 'eth_chainId' });
    setChainId(chain);
    
    // Etkinlik dinleyicileri
    window.ethereum.on('accountsChanged', (newAccounts) => {
      setAccount(newAccounts[0] || '');
      setIsConnected(!!newAccounts[0]);
    });
    
    window.ethereum.on('chainChanged', () => window.location.reload());
  };

  // Mobil cüzdan açma
  const openMobileWallet = () => {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS için
      window.location.href = 'https://metamask.app.link/dapp/' + window.location.hostname;
    } else if (/Android/i.test(navigator.userAgent)) {
      // Android için
      window.location.href = 'https://metamask.app.link/dapp/' + window.location.hostname;
    } else {
      alert('Lütfen MetaMask mobil uygulamasını yükleyin!');
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
          to: '0xd924e01c7d319c5b23708cd622bd1143cd4fb360', // Alıcı adres
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
                  <p className="text-muted mb-3">Lütfen cüzdan tarayıcınızı kullanın veya WalletConnect üzerinden bağlanın</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={connectWallet}
                  >
                    Cüzdanı Bağla
                  </button>
                  <p className="mt-3">
                    <small>MetaMask veya Trust Wallet yüklü değilse <a href="#" onClick={openMobileWallet}>buraya tıklayın</a></small>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted mb-3">Lütfen MetaMask veya Trust Wallet yükleyin!</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={connectWallet}
                  >
                    Cüzdanı Bağla
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="alert alert-success">
                Bağlı cüzdan: {`${account.substring(0, 6)}...${account.substring(38)}`}
              </div>
              
              <button 
                className="btn btn-outline-primary mb-3"
                onClick={() => setShowBuySection(!showBuySection)}
              >
                {showBuySection ? 'Satın Alma Ekranını Gizle' : 'Token Satın Al'}
              </button>
              
              {showBuySection && (
                <div className="buy-section mt-3 p-3 border rounded">
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
                  
                  <div className="mb-3 p-2 bg-light rounded">
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
                    className="btn btn-success w-100 py-2"
                    onClick={buyTokens}
                  >
                    Şimdi Satın Al
                  </button>
                </div>
              )}
              
              <button 
                className="btn btn-outline-danger mt-3"
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
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
