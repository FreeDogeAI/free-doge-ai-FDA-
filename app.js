const { useState, useEffect } = React;

const App = () => {
  const [account, setAccount] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Mobil kontrolü
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  // MetaMask'te doğrudan imza iste
  const connectWallet = async () => {
    if (!isMobile) {
      alert("Sadece mobil cihazlarda çalışır!");
      return;
    }

    if (!window.ethereum?.isMetaMask) {
      alert("Lütfen MetaMask uygulamasını kullanın!");
      return;
    }

    try {
      // 1. Hesapları iste (MetaMask popup'ını açar)
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // 2. İmza iste (Ekrandaki Account 1'de onay çıkar)
      await window.ethereum.request({
        method: 'personal_sign',
        params: [
          `FDAI Giriş Onayı: ${new Date().toLocaleString()}`,
          accounts[0]
        ],
      });

      // 3. Bağlantıyı kaydet
      setAccount(accounts[0]);
      
    } catch (error) {
      console.error("Hata:", error);
      alert("İmza reddedildi!");
    }
  };

  return (
    <div className="text-center mt-5">
      <h1>FDAI Token Presale</h1>
      
      {!account ? (
        <button 
          className="wallet-btn text-white mt-4"
          onClick={connectWallet}
        >
          MetaMask ile Bağlan
        </button>
      ) : (
        <div className="mt-4 p-3 bg-light rounded">
          <p>Bağlı Cüzdan: <strong>{account.slice(0, 6)}...{account.slice(-4)}</strong></p>
          <button 
            className="btn btn-sm btn-danger mt-2"
            onClick={() => setAccount('')}
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
