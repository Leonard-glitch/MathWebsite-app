document.getElementById('back-link').addEventListener('click', function(e) {
      e.preventDefault();
      
      // Prüft, ob es eine vorherige Seite in diesem Tab gibt
      if (window.history.length > 1) {
          window.history.back();
      } else {
          // Fallback, falls der Tab komplett neu geöffnet wurde
          window.location.href = '/'; 
      }
  });