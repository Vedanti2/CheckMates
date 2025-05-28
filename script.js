function startGame() {
  window.location.href = "game.html";
}

  
  function goToInstructions() {
    window.location.href = "instruction.html";
  }
  
  
  function visualize() {
    window.location.href = "visualize.html"; // Visualization logic
  }
  
  function exitGame() {
    if (confirm("Are you sure you want to exit?")) {
      window.close(); // Will not work on most browsers unless opened via JS
    }
  }
  