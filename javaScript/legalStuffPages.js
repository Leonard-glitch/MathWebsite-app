document.getElementById('back-link').addEventListener('click', function(e) {
      e.preventDefault(); // Verhindert das normale Öffnen der href="/"
      
      // Prüft, ob ein interner Verlauf existiert
      if (document.referrer && document.referrer.includes(window.location.host)) {
          window.history.back();
      } else {
          // Fallback: Wenn kein Verlauf da ist oder COOP ihn isoliert hat
          window.location.href = '/'; 
      }
  });