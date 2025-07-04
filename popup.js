const input = document.getElementById("keyInput");

// Load key nếu đã có
chrome.storage.local.get("twofa_key", (data) => {
  if (data.twofa_key) {
    input.value = data.twofa_key;
  }
});

// Lưu khi người dùng thay đổi
input.addEventListener("input", () => {
  chrome.storage.local.set({ twofa_key: input.value });
});
