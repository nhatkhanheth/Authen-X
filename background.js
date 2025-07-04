chrome.commands.onCommand.addListener(async (command) => {
  if (command === "trigger-2fa") {
    console.log("⌨️ Nhấn Ctrl+Shift+Y");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return console.error("❌ Không tìm thấy tab.");

    try {
      // Lấy key từ storage
      chrome.storage.local.get("twofa_key", async (data) => {
        const key = data.twofa_key;
        if (!key) {
          console.error("❌ Chưa cấu hình mã 2FA key.");
          return;
        }

        const url = `https://2fa.live/tok/${key}`;
        console.log("🌐 Gọi API:", url);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Lỗi API: " + response.status);
        const tokenData = await response.json();
        const code = tokenData.token;

        console.log("✅ Mã 2FA:", code);

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (code) => {
            const input = document.querySelector('input[data-testid="ocfEnterTextTextInput"]');
            if (!input) {
              console.error("❌ Không tìm thấy ô nhập mã.");
              return;
            }
            input.value = code;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log("✅ Đã nhập mã 2FA.");
          },
          args: [code]
        });
      });
    } catch (err) {
      console.error("❌ Lỗi:", err);
    }
  }
});
