const products = [
  { category: "Bot & Panel", description: "Sewa bot WhatsApp, panel streaming, dan jasher Telegram", items: [
    ["Sewa Bot WA 1 Bulan", "Rp35K"], ["Sewa Bot WA 1 Minggu", "Rp10K"], ["Sewa Bot WA 1 Hari", "Rp3K"],
    ["Panel Unlimited Legal", "Rp10K"], ["Panel Unlimited Illegal", "Rp2K"], ["Panel ADP Legal", "Rp25K"],
    ["Panel ADP Illegal", "Rp5K"], ["Panel RESS Legal", "Rp15K"], ["Panel RESS Illegal", "Rp3K"], ["Jasher Telegram", "Rp25K"],
  ]},
  { category: "Alight Motion", description: "Aplikasi premium, tutorial, dan paket bahan editing", items: [
    ["AM Premium Email Buyer", "Rp10K"], ["AM Premium Email Seller", "Rp5K"], ["AM Premium Nogar Sharing", "Rp3K"],
    ["Tutorial AM Premium", "Rp85K"], ["All Bahan Open Store + Tutorial", "Rp100K"],
  ]},
  { category: "Streaming & AI", description: "Akses hiburan dan tools AI pilihan", items: [
    ["CapCut 1 Bulan", "Rp35K"], ["CapCut 7 Hari", "Rp8.5K"], ["Netflix 1P2U", "Rp22K"], ["Netflix 1P1U", "Rp35K"],
    ["Spotify 1 Bulan", "Rp28K"], ["Spotify Sharing", "Rp20K"], ["YouTube Email Buyer", "Rp20K"], ["YouTube Email Seller", "Rp10K"],
    ["WeTV VIP 1 Bulan", "Rp65K"], ["WeTV VIP 3 Bulan", "Rp140K"], ["Prime Video 1 Bulan", "Rp15K"], ["Vidio 1 Bulan", "Rp30K"],
    ["VIU Lifetime", "Rp25K"], ["Remini 7 Hari", "Rp8K"], ["Picsart 1 Bulan", "Rp12K"], ["Zoom 1 Minggu", "Rp6K"],
    ["Wink 7 Hari", "Rp8.5K"], ["BStation 1 Bulan", "Rp50K"], ["Loklok 1 Bulan", "Rp25K"], ["ChatGPT 7 Hari", "Rp6K"],
    ["ChatGPT 1 Bulan", "Rp20K"], ["ChatGPT Private", "Rp45K"], ["Gemini 3 Bulan", "Rp50K"], ["VPN 7 Hari", "Rp6K"], ["VPN 1 Bulan", "Rp18K"],
  ]},
  { category: "Nokos & Kebsos", description: "Nomor virtual dan kebutuhan sosial media", items: [
    ["Murid Nokos", "Rp10K"], ["Murid Kebsos", "Rp10K"], ["Nokos Indo Fresh", "Rp7K"], ["Nokos Indo Save", "Rp10K"],
    ["Nokos SGP Fresh", "Rp10K"], ["Nokos SGP Save", "Rp15K"], ["Nokos MLY Fresh", "Rp8K"], ["Nokos MLY Save", "Rp15K"],
  ]},
];

const catalog = document.querySelector("#catalogRoot");
const search = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const empty = document.querySelector("#emptyState");

function orderLink(name, price) {
  const text = encodeURIComponent(`Halo Kak Reviza, saya mau order ${name} ${price}`);
  return `https://wa.me/628978595858?text=${text}`;
}

function renderCatalog(query = "") {
  const normalized = query.trim().toLowerCase();
  let visible = 0;
  catalog.innerHTML = products.map((group, groupIndex) => {
    const filtered = group.items.filter(([name]) => !normalized || name.toLowerCase().includes(normalized));
    visible += filtered.length;
    if (!filtered.length) return "";
    const rows = filtered.map(([name, price]) => `
      <tr>
        <td class="product-name">${name}</td>
        <td class="price">${price}</td>
        <td><a class="btn-order" href="${orderLink(name, price)}" target="_blank" rel="noopener">Order</a></td>
      </tr>`).join("");
    return `
      <section class="category-card">
        <button class="category-head" type="button" aria-expanded="true">
          <span class="category-index">0${groupIndex + 1}</span>
          <span class="category-meta"><strong>${group.category}</strong><small>${group.description}</small></span>
          <span class="category-count">${filtered.length} item</span>
          <span class="chevron">⌄</span>
        </button>
        <div class="category-body">
          <div class="table-wrap"><table><thead><tr><th>Produk</th><th>Harga</th><th>Order</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>
      </section>`;
  }).join("");
  resultCount.textContent = `${visible} produk`;
  empty.hidden = visible !== 0;
  document.querySelectorAll(".category-head").forEach((head) => {
    head.addEventListener("click", () => {
      const expanded = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", String(!expanded));
      head.nextElementSibling.classList.toggle("closed", expanded);
    });
  });
}

search?.addEventListener("input", () => renderCatalog(search.value));
renderCatalog();
