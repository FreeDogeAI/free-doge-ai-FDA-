const { useState, useEffect } = React;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Mobil kontrolü
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Sayfa yüklendiğinde bağlantı kontrolü
    if (window.ethereum) {
      checkConnection();
    }
  }, []);

  // Bağlantı kontrolü
  const checkConnection = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  // SADECE MOBİL İMZA İŞLEMİ
  const handleMobileSign = async () => {
    if (!isMobile) {
      alert('Bu özellik sadece mobil cihazlarda çalışır!');
      return;
    }
    
    try {
      setIsSigning(true);
      
      // 1. MetaMask uygulamasına yönlendir
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        const url = `https://metamask.app.link/dapp/${window.location.hostname}`;
        window.location.href = url;
        return;
      }
      
      // 2. Hesapları iste
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // 3. MOBİL İMZA İSTE (Ekranda gördüğünüz popup)
      const message = `FDAI Presale Giriş Onayı\n\nAdres: ${accounts[0]}\n\nZaman: ${new Date().toLocaleString()}`;
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      });
      
      // 4. Bağlantıyı tamamla
      setAccount(accounts[0]);
      setIsConnected(true);
      
      // 5. Chrome'ye dön
      if (document.referrer.includes('chrome://')) {
        setTimeout(() => {
          window.location.href = 'googlechrome://' + window.location.href.replace(/^https?:\/\//, '');
        }, 1000);
      }
      
    } catch (error) {
      console.error('İmza hatası:', error);
      alert(`İmza reddedildi: ${error.message}`);
    } finally {
      setIsSigning(false);
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
          {!isConnected ? (
            <div className="text-center">
              <h4 className="mb-4">Cüzdanı Bağla</h4>
              
              {isMobile ? (
                <>
                  <p className="text-muted mb-3">
                    MetaMask uygulamasında imza isteyeceğiz
                  </p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleMobileSign}
                    disabled={isSigning}
                  >
                    {isSigning ? 'İmza Bekleniyor...' : 'MetaMask ile Bağlan'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-muted mb-3">Lütfen mobil cihazınızla bağlanın</p>
                  <button 
                    className="btn btn-secondary btn-lg"
                    disabled
                  >
                    Sadece Mobil Destekleniyor
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
                  <span className="badge bg-primary">Bağlandı</span>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => setIsConnected(false)}
                >
                  Bağlantıyı Kes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
