/*
 * 简易脚本用于从公共 API 拉取数据并填充页面元素。
 * 请在生产环境中将 API 调用部分替换为您自己的服务地址和认证信息。
 */

// 配置：您可以在此处添加 API 密钥等信息。
const API_CONFIG = {
  coingeckoBase: 'https://api.coingecko.com/api/v3',
  fearGreedUrl: 'https://api.alternative.me/fng/?limit=1',
  // 以下 Glassnode、Coinglass、CryptoQuant 等服务通常需要 API Key。
  glassnodeKey: '',
  coinglassKey: '',
  cryptoQuantKey: '',
};

// 页面加载完成后自动更新数据
document.addEventListener('DOMContentLoaded', () => {
  updatePrices();
  updateFearGreed();
  updateAltSeason();
  updateETF();
  updateVolatility();
  updateLongShortRatio();
  // 其余指标如 MVRV、DEX 交易量、韩国溢价等需要订阅对应 API，可在此处扩展函数。
});

// 更新 BTC、ETH 当前价格并刷新「市场概况」板块中的数字
async function updatePrices() {
  try {
    const ids = ['bitcoin', 'ethereum'];
    const res = await fetch(`${API_CONFIG.coingeckoBase}/simple/price?ids=${ids.join(',')}&vs_currencies=usd`);
    if (!res.ok) throw new Error('请求价格数据失败');
    const data = await res.json();
    const btc = data.bitcoin?.usd;
    const eth = data.ethereum?.usd;
    if (btc) {
      document.getElementById('btc-price').textContent = btc.toLocaleString();
    }
    // 也可以在此处更新 ETH 价格等其他元素
  } catch (err) {
    console.warn('获取价格信息时出现问题：', err);
  }
}

// 更新 Fear & Greed 指数
async function updateFearGreed() {
  try {
    const res = await fetch(API_CONFIG.fearGreedUrl);
    if (!res.ok) throw new Error('请求恐惧与贪婪指数失败');
    const json = await res.json();
    const value = json?.data?.[0]?.value;
    if (value) {
      document.getElementById('fear-greed').textContent = value;
      document.getElementById('greed-index').textContent = value;
    }
  } catch (err) {
    console.warn('获取 Fear & Greed 指数时出现问题：', err);
  }
}

// 更新 Altcoin Season 指数（此处示例为通过 Blockchaincenter 爬取数据，实际可能需要代理）
async function updateAltSeason() {
  try {
    // 该网站没有正式 API，此处示意获取页面中的 JSON 数据
    // 示例仅供参考，使用时需遵循目标站点许可。
    const res = await fetch('https://www.blockchaincenter.net/altcoin-season-index.json');
    if (!res.ok) throw new Error('请求 Altcoin Season 数据失败');
    const json = await res.json();
    const latest = json?.data?.[json.data.length - 1];
    if (latest) {
      document.getElementById('alt-season').textContent = latest.value;
    }
  } catch (err) {
    console.warn('获取 Altcoin Season 指数时出现问题：', err);
  }
}

// 更新比特币 ETF 净流入 (示例使用 Coinglass)
async function updateETF() {
  if (!API_CONFIG.coinglassKey) return;
  try {
    const res = await fetch('https://open-api.coinglass.com/public/v2/etf/history', {
      headers: {
        'coinglassSecret': API_CONFIG.coinglassKey,
      },
    });
    if (!res.ok) throw new Error('请求 ETF 数据失败');
    const json = await res.json();
    const latest = json.data?.[0];
    if (latest && latest.netFlow) {
      document.getElementById('etf-flows').textContent = `${latest.netFlow} M`;
    }
  } catch (err) {
    console.warn('获取 ETF 净流入时出现问题：', err);
  }
}

// 更新年化波动率示例（需 Glassnode Pro 订阅）
async function updateVolatility() {
  if (!API_CONFIG.glassnodeKey) return;
  try {
    const btcRes = await fetch(`https://api.glassnode.com/v1/metrics/market/realized_volatility_1w?a=BTC&i=24h`, {
      headers: { 'X-Api-Key': API_CONFIG.glassnodeKey },
    });
    const ethRes = await fetch(`https://api.glassnode.com/v1/metrics/market/realized_volatility_1w?a=ETH&i=24h`, {
      headers: { 'X-Api-Key': API_CONFIG.glassnodeKey },
    });
    if (btcRes.ok && ethRes.ok) {
      const btcJson = await btcRes.json();
      const ethJson = await ethRes.json();
      const btcVal = btcJson[btcJson.length - 1]?.v;
      const ethVal = ethJson[ethJson.length - 1]?.v;
      if (btcVal) document.getElementById('btc-vol-1w').textContent = (btcVal * 100).toFixed(2) + '%';
      if (ethVal) document.getElementById('eth-vol-1w').textContent = (ethVal * 100).toFixed(2) + '%';
    }
  } catch (err) {
    console.warn('获取波动率数据时出现问题：', err);
  }
}

// 更新多空比 (示例)
async function updateLongShortRatio() {
  if (!API_CONFIG.coinglassKey) return;
  try {
    const res = await fetch('https://open-api.coinglass.com/api/futures/liquidationMap?symbol=BTC', {
      headers: { 'coinglassSecret': API_CONFIG.coinglassKey },
    });
    if (res.ok) {
      const json = await res.json();
      // 假定返回字段中包含 longShortRatio
      const ratio = json.data?.longShortRatio;
      if (ratio) {
        document.getElementById('long-short-ratio').textContent = ratio;
      }
    }
  } catch (err) {
    console.warn('获取多空比时出现问题：', err);
  }
}

// 更多函数可根据所需指标编写，例如 MVRV、交易量、韩国溢价、Token 解锁等
